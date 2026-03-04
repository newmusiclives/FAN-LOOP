const { getDb } = require('../../db/database');

const RewardClaim = {
  findById(id) {
    return getDb().prepare('SELECT * FROM reward_claims WHERE id = ?').get(id);
  },

  create({ fan_id, reward_id }) {
    const existing = getDb().prepare('SELECT id FROM reward_claims WHERE fan_id = ? AND reward_id = ?').get(fan_id, reward_id);
    if (existing) return this.findById(existing.id);
    const result = getDb().prepare('INSERT INTO reward_claims (fan_id, reward_id) VALUES (?, ?)').run(fan_id, reward_id);
    return this.findById(result.lastInsertRowid);
  },

  approve(id, userId) {
    getDb().prepare(`UPDATE reward_claims SET status = 'approved', fulfilled_at = datetime('now') WHERE id = ?`).run(id);
  },

  deny(id, notes) {
    getDb().prepare(`UPDATE reward_claims SET status = 'denied', notes = ?, fulfilled_at = datetime('now') WHERE id = ?`).run(notes || null, id);
  },

  listPending({ limit = 50, offset = 0 } = {}) {
    return getDb().prepare(`
      SELECT rc.*, f.email as fan_email, f.name as fan_name, r.tier_name, r.description as reward_description,
             c.title as campaign_title
      FROM reward_claims rc
      JOIN fans f ON rc.fan_id = f.id
      JOIN rewards r ON rc.reward_id = r.id
      JOIN campaigns c ON r.campaign_id = c.id
      WHERE rc.status = 'pending'
      ORDER BY rc.claimed_at ASC LIMIT ? OFFSET ?
    `).all(limit, offset);
  },

  listByFan(fanId) {
    return getDb().prepare(`
      SELECT rc.*, r.tier_name, r.description as reward_description, r.referrals_required
      FROM reward_claims rc JOIN rewards r ON rc.reward_id = r.id
      WHERE rc.fan_id = ? ORDER BY r.referrals_required ASC
    `).all(fanId);
  },

  countPending() {
    return getDb().prepare("SELECT COUNT(*) as count FROM reward_claims WHERE status = 'pending'").get().count;
  }
};

module.exports = RewardClaim;
