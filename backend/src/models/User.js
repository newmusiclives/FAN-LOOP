const { getDb } = require('../../db/database');
const bcrypt = require('bcryptjs');

const User = {
  findById(id) {
    return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  },

  create({ email, password, name, role = 'admin' }) {
    const hash = bcrypt.hashSync(password, 10);
    const result = getDb().prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).run(email.toLowerCase(), hash, name, role);
    return this.findById(result.lastInsertRowid);
  },

  verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password_hash);
  },

  updatePassword(id, newPassword) {
    const hash = bcrypt.hashSync(newPassword, 10);
    getDb().prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(hash, id);
  },

  list() {
    return getDb().prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC').all();
  }
};

module.exports = User;
