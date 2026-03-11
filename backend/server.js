require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const crypto = require('crypto');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'COOKIE_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar] || process.env[envVar].includes('change-in-production')) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`FATAL: ${envVar} must be set to a secure value in production`);
      process.exit(1);
    }
    console.warn(`WARNING: ${envVar} is using a development default. Do NOT use this in production.`);
  }
}

// Initialize database
const { getDb, closeDb } = require('./db/database');
const bcrypt = require('bcryptjs');
getDb();

// Reset admin password from env var on every startup
if (process.env.ADMIN_INITIAL_PASSWORD) {
  try {
    const db = getDb();
    const admin = db.prepare("SELECT id FROM users WHERE email = 'admin@fanloop.io'").get();
    if (admin) {
      const hash = bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, admin.id);
      console.log('Admin password updated from ADMIN_INITIAL_PASSWORD env var.');
    }
  } catch (err) {
    console.error('Failed to reset admin password:', err.message);
  }
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
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.manifestfinancial.com", "https://api.sandbox.manifestfinancial.com", "https://cdn.tailwindcss.com"],
      frameSrc: ["'self'", "https://api.manifestfinancial.com", "https://api.sandbox.manifestfinancial.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null
    }
  },
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
