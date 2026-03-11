require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const crypto = require('crypto');

// Set fallback defaults for required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-in-production')) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set to a secure value in production');
    process.exit(1);
  }
  process.env.JWT_SECRET = 'fanloop-dev-jwt-secret-2024';
  console.warn('WARNING: JWT_SECRET using development default. Do NOT use this in production.');
}
if (!process.env.COOKIE_SECRET || process.env.COOKIE_SECRET.includes('change-in-production')) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: COOKIE_SECRET must be set to a secure value in production');
    process.exit(1);
  }
  process.env.COOKIE_SECRET = 'fanloop-dev-cookie-secret-2024';
  console.warn('WARNING: COOKIE_SECRET using development default. Do NOT use this in production.');
}

// Initialize database
const { getDb, closeDb } = require('./db/database');
const bcrypt = require('bcryptjs');
getDb();

// Reset admin password on every startup (fallback to hardcoded default)
try {
  const db = getDb();
  const admin = db.prepare("SELECT id FROM users WHERE email = 'admin@fanloop.io'").get();
  if (admin) {
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Lennon22!';
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, admin.id);
    console.log('Admin password reset on startup.');
  }
} catch (err) {
  console.error('Failed to reset admin password:', err.message);
}

const app = express();

// Trust proxy (for Render, etc.)
app.set('trust proxy', 1);

// Security & parsing
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000'];

app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.manifestfinancial.com", "https://api.sandbox.manifestfinancial.com", "https://cdn.tailwindcss.com"],
      frameSrc: ["'self'", "https://api.manifestfinancial.com", "https://api.sandbox.manifestfinancial.com"],
      objectSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      upgradeInsecureRequests: []
    }
  } : false,
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false
}));

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (same-origin, server-to-server, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development, allow all localhost origins
    if (!isProduction && origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// HTTPS redirect in production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Disable caching for HTML pages (prevent proxy/CDN serving stale content)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
  }
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Static files with caching
app.use(express.static(path.join(__dirname, 'src', 'public'), {
  maxAge: isProduction ? '1d' : 0,
  etag: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    getDb().prepare('SELECT 1').get();
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// Debug: test if browser reaches this server
app.get('/test-server', (req, res) => {
  res.send(`<h1 style="color:lime;background:black;padding:20px">Server is LIVE - ${new Date().toISOString()}</h1>`);
});

// Routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const fanRoutes = require('./src/routes/fan');
const apiRoutes = require('./src/routes/api');
const checkoutRoutes = require('./src/routes/checkout');

// Home page — serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', fanRoutes);
app.use('/api', apiRoutes);
app.use('/', checkoutRoutes);

// Error handling
const { errorHandler, notFoundHandler } = require('./src/middleware/errors');
app.use(notFoundHandler);
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  FANLOOP server running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!isProduction) {
    console.log(`  Admin: http://localhost:${PORT}/admin/login\n`);
  }
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n  ${signal} received. Shutting down gracefully...`);
  closeDb();
  process.exit(0);
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  closeDb();
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
