require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

// Initialize database
const { getDb, closeDb } = require('./db/database');
getDb();

const app = express();

// Security & parsing
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Routes
const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const fanRoutes = require('./src/routes/fan');
const apiRoutes = require('./src/routes/api');

app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', fanRoutes);
app.use('/api', apiRoutes);

// Home redirect
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Error handling
const { errorHandler, notFoundHandler } = require('./src/middleware/errors');
app.use(notFoundHandler);
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  FANLOOP server running on http://localhost:${PORT}`);
  console.log(`  Admin: http://localhost:${PORT}/admin/login`);
  console.log(`  Login: admin@fanloop.io / admin123\n`);
});

// Cleanup
process.on('SIGINT', () => { closeDb(); process.exit(); });
process.on('SIGTERM', () => { closeDb(); process.exit(); });
