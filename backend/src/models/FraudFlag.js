const { getDb } = require('../../db/database');

const FraudFlag = {
  create({ fan_id, campaign_id, reason, details }) {
    const result = getDb().prepare(
      'INSERT INTO fraud_flags (fan_id, campaign_id, reason, details) VALUES (?, ?, ?, ?)'
    ).run(fan_id, campaign_id, reason, JSON.stringify(details || {}));
    return getDb().prepare('SELECT * FROM fraud_flags WHERE id = ?').get(result.lastInsertRowid);
  },

  listPending({ limit = 50, offset = 0 } = {}) {
    return getDb().prepare(`
      SELECT ff.*, f.email as fan_email, f.name as fan_name, c.title as campaign_title
      FROM fraud_flags ff
      JOIN fans f ON ff.fan_id = f.id
      JOIN campaigns c ON ff.campaign_id = c.id
      WHERE ff.status = 'pending'
      ORDER BY ff.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset);
  },

  review(id, { status, reviewed_by }) {
    getDb().prepare(
      `UPDATE fraud_flags SET status = ?, reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?`
    ).run(status, reviewed_by, id);
  },

  countPending() {
    return getDb().prepare("SELECT COUNT(*) as count FROM fraud_flags WHERE status = 'pending'").get().count;
  },

  findById(id) {
    return getDb().prepare('SELECT * FROM fraud_flags WHERE id = ?').get(id);
  }
};

module.exports = FraudFlag;
