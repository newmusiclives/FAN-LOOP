const { getDb } = require('../../db/database');

const Campaign = {
  findById(id) {
    return getDb().prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  },

  findBySlug(slug) {
    return getDb().prepare('SELECT * FROM campaigns WHERE slug = ?').get(slug);
  },

  create(data) {
    const result = getDb().prepare(`
      INSERT INTO campaigns (artist_id, title, slug, type, status, description, headline, subheadline, image_url, brand_config, share_messages, reward_tiers, config, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.artist_id, data.title, data.slug, data.type || 'pre-save', data.status || 'draft',
      data.description || null, data.headline || null, data.subheadline || null, data.image_url || null,
      JSON.stringify(data.brand_config || {}), JSON.stringify(data.share_messages || {}),
      JSON.stringify(data.reward_tiers || []), JSON.stringify(data.config || {}),
      data.start_date || null, data.end_date || null
    );
    return this.findById(result.lastInsertRowid);
  },

  update(id, fields) {
    const jsonFields = ['brand_config', 'share_messages', 'reward_tiers', 'config'];
    const allowed = ['title', 'slug', 'type', 'status', 'description', 'headline', 'subheadline', 'image_url', 'start_date', 'end_date', ...jsonFields];
    const sets = [];
    const values = [];
    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = ?`);
        values.push(jsonFields.includes(key) ? JSON.stringify(val) : val);
      }
    }
    if (sets.length === 0) return this.findById(id);
    sets.push("updated_at = datetime('now')");
    values.push(id);
    getDb().prepare(`UPDATE campaigns SET ${sets.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  },

  delete(id) {
    getDb().prepare('DELETE FROM campaigns WHERE id = ?').run(id);
  },

  incrementFanCount(id) {
    getDb().prepare('UPDATE campaigns SET fan_count = fan_count + 1 WHERE id = ?').run(id);
  },

  listByArtist(artistId) {
    return getDb().prepare('SELECT * FROM campaigns WHERE artist_id = ? ORDER BY created_at DESC').all(artistId);
  },

  listAll({ status, limit = 50, offset = 0 } = {}) {
    if (status) {
      return getDb().prepare('SELECT * FROM campaigns WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(status, limit, offset);
    }
    return getDb().prepare('SELECT * FROM campaigns ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  },

  countAll() {
    return getDb().prepare('SELECT COUNT(*) as count FROM campaigns').get().count;
  },

  getActiveCampaigns() {
    return getDb().prepare("SELECT * FROM campaigns WHERE status = 'active' ORDER BY fan_count DESC").all();
  }
};

module.exports = Campaign;
