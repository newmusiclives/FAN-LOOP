const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Alternative uncached login route for testing
router.get('/login2', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html>
<html><head><title>Login Test</title></head>
<body>
<h1>THIS IS LOGIN2 - TIMESTAMP: ${Date.now()}</h1>
<p>If you see this with a timestamp, the proxy cache is bypassed.</p>
</body></html>`);
});

router.get('/login', (req, res) => {
  if (req.cookies?.admin_token) {
    try {
      jwt.verify(req.cookies.admin_token, process.env.JWT_SECRET);
      return res.redirect('/admin');
    } catch (e) { /* continue to login page */ }
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.render('admin/login', { title: 'Admin Login', error: null, layout: false });
});

router.post('/login', authLimiter, (req, res) => {
  const { email, password } = req.body;
  const user = User.findByEmail(email);

  if (!user || !User.verifyPassword(user, password)) {
    return res.render('admin/login', { title: 'Admin Login', error: 'Invalid email or password', layout: false });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.cookie('admin_token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: isProduction
  });
  res.redirect('/admin');
});

router.get('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.redirect('/admin/login');
});

module.exports = router;
