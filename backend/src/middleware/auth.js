const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Fan = require('../models/Fan');

function adminAuth(req, res, next) {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findById(decoded.id);
    if (!user) {
      res.clearCookie('admin_token');
      return req.path.startsWith('/api/') ? res.status(401).json({ error: 'Invalid token' }) : res.redirect('/admin/login');
    }
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie('admin_token');
    return req.path.startsWith('/api/') ? res.status(401).json({ error: 'Invalid token' }) : res.redirect('/admin/login');
  }
}

function fanSession(req, res, next) {
  const token = req.cookies?.fan_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.COOKIE_SECRET);
      const fan = Fan.findById(decoded.fanId);
      if (fan) req.fan = fan;
    } catch (err) {
      res.clearCookie('fan_token');
    }
  }
  next();
}

function requireFan(req, res, next) {
  if (!req.fan) {
    return res.redirect(req.baseUrl || '/');
  }
  next();
}

module.exports = { adminAuth, fanSession, requireFan };
