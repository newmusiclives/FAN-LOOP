const { getDb } = require('../../db/database');

const Integration = {
  findById(id) {
    return getDb().prepare('SELECT * FROM integrations WHERE id = ?').get(id);
  },

  create({ artist_id, type, name, config }) {
    const result = getDb().prepare(
      'INSERT INTO integrations (artist_id, type, name, config) VALUES (?, ?, ?, ?)'
    ).run(artist_id, type, name, JSON.stringify(config || {}));
    return this.findById(result.lastInsertRowid);
  },

  update(id, { name, config, active }) {
    const sets = [];
    const values = [];
    if (name !== undefined) { sets.push('name = ?'); values.push(name); }
    if (config !== undefined) { sets.push('config = ?'); values.push(JSON.stringify(config)); }
    if (active !== undefined) { sets.push('active = ?'); values.push(active ? 1 : 0); }
    if (sets.length === 0) return this.findById(id);
    sets.push("updated_at = datetime('now')");
    values.push(id);
    getDb().prepare(`UPDATE integrations SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id) {
    getDb().prepare('DELETE FROM integrations WHERE id = ?').run(id);
  },

  listByArtist(artistId) {
    return getDb().prepare('SELECT * FROM integrations WHERE artist_id = ? ORDER BY created_at DESC').all(artistId);
  },

  getActiveWebhooks(artistId) {
    return getDb().prepare("SELECT * FROM integrations WHERE artist_id = ? AND type = 'webhook' AND active = 1").all(artistId);
  },

  getActiveByType(artistId, type) {
    return getDb().prepare("SELECT * FROM integrations WHERE artist_id = ? AND type = ? AND active = 1").all(artistId, type);
  }
};

module.exports = Integration;
