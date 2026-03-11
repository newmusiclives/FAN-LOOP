const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// Self-contained login page using HTML attributes for styling (no CSS needed)
router.get('/signin', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>FANLOOP — Admin Sign In</title></head>
<body bgcolor="#0a0a0f" text="#e2e8f0" style="margin:0;padding:0;font-family:system-ui,sans-serif;">
<center>
<br><br><br>
<table width="400" cellpadding="0" cellspacing="0">
<tr><td align="center">
  <font size="7" color="#a78bfa"><b>FANLOOP</b></font>
  <br><font size="3" color="#6b7280">Admin Portal</font>
  <br><br>
</td></tr>
<tr><td bgcolor="#111118" style="border-radius:12px;padding:30px;">
  <font size="4" color="#e2e8f0"><b>Sign In</b></font>
  <br><br>
  <form method="POST" action="/admin/login">
    <font size="2" color="#9ca3af">Email</font><br>
    <input type="email" name="email" required placeholder="admin@fanloop.io"
      style="width:100%;box-sizing:border-box;padding:10px 14px;margin:6px 0 14px 0;background:#1a1a2e;border:1px solid #2a2a3e;color:#e2e8f0;border-radius:8px;font-size:16px;">
    <br>
    <font size="2" color="#9ca3af">Password</font><br>
    <input type="password" name="password" required placeholder="Enter password"
      style="width:100%;box-sizing:border-box;padding:10px 14px;margin:6px 0 20px 0;background:#1a1a2e;border:1px solid #2a2a3e;color:#e2e8f0;border-radius:8px;font-size:16px;">
    <br>
    <input type="submit" value="Sign In"
      style="width:100%;padding:12px;border:none;border-radius:8px;font-weight:600;font-size:16px;color:white;background:linear-gradient(135deg,#8b5cf6,#ec4899);cursor:pointer;">
  </form>
</td></tr>
</table>
<br><br>
<font size="1" color="#444">Page generated: ${new Date().toISOString()}</font>
</center>
</body>
</html>`);
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
