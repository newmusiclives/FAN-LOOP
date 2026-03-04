const { getDb } = require('../../db/database');

const Tag = {
  findById(id) {
    return getDb().prepare('SELECT * FROM tags WHERE id = ?').get(id);
  },

  create({ name, color }) {
    const result = getDb().prepare('INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)').run(name, color || '#6366f1');
    return getDb().prepare('SELECT * FROM tags WHERE name = ?').get(name);
  },

  listAll() {
    return getDb().prepare('SELECT * FROM tags ORDER BY name').all();
  },

  addToFan(fanId, tagId) {
    getDb().prepare('INSERT OR IGNORE INTO fan_tags (fan_id, tag_id) VALUES (?, ?)').run(fanId, tagId);
  },

  removeFromFan(fanId, tagId) {
    getDb().prepare('DELETE FROM fan_tags WHERE fan_id = ? AND tag_id = ?').run(fanId, tagId);
  },

  getForFan(fanId) {
    return getDb().prepare('SELECT t.* FROM tags t JOIN fan_tags ft ON t.id = ft.tag_id WHERE ft.fan_id = ?').all(fanId);
  },

  delete(id) {
    getDb().prepare('DELETE FROM fan_tags WHERE tag_id = ?').run(id);
    getDb().prepare('DELETE FROM tags WHERE id = ?').run(id);
  }
};

module.exports = Tag;
