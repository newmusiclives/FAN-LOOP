require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getDb, closeDb } = require('./database');
const bcrypt = require('bcryptjs');

const email = process.argv[2] || 'admin@fanloop.io';
const newPassword = process.argv[3];

if (!newPassword) {
  console.error('Usage: node db/reset-password.js [email] <new-password>');
  console.error('  e.g. node db/reset-password.js admin@fanloop.io MyNewPass123');
  process.exit(1);
}

const db = getDb();
const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);

if (!user) {
  console.error(`No user found with email: ${email}`);
  closeDb();
  process.exit(1);
}

const hash = bcrypt.hashSync(newPassword, 10);
db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(?) WHERE id = ?')
  .run(hash, new Date().toISOString(), user.id);

console.log(`Password updated for ${email}`);
closeDb();
