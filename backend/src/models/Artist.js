const { getDb } = require('../../db/database');

const Artist = {
  findById(id) {
    return getDb().prepare('SELECT * FROM artists WHERE id = ?').get(id);
  },

  findBySlug(slug) {
    return getDb().prepare('SELECT * FROM artists WHERE slug = ?').get(slug);
  },

  create({ user_id, name, slug, genre, bio, image_url, brand_config }) {
    const result = getDb().prepare(
      'INSERT INTO artists (user_id, name, slug, genre, bio, image_url, brand_config) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(user_id, name, slug, genre || null, bio || null, image_url || null, JSON.stringify(brand_config || {}));
    return this.findById(result.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = ['name', 'slug', 'genre', 'bio', 'image_url', 'brand_config'];
    const sets = [];
    const values = [];
    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = ?`);
        values.push(key === 'brand_config' ? JSON.stringify(val) : val);
      }
    }
    if (sets.length === 0) return this.findById(id);
    sets.push("updated_at = datetime('now')");
    values.push(id);
    getDb().prepare(`UPDATE artists SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id) {
    getDb().prepare('DELETE FROM artists WHERE id = ?').run(id);
  },

  listByUser(userId) {
    return getDb().prepare('SELECT * FROM artists WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  listAll() {
    return getDb().prepare('SELECT * FROM artists ORDER BY created_at DESC').all();
  }
};

module.exports = Artist;
