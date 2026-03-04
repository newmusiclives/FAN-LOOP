const { getDb } = require('../../db/database');

const Referral = {
  create({ campaign_id, referrer_id, referred_id, status = 'confirmed' }) {
    const result = getDb().prepare(
      'INSERT INTO referrals (campaign_id, referrer_id, referred_id, status) VALUES (?, ?, ?, ?)'
    ).run(campaign_id, referrer_id, referred_id, status);
    return getDb().prepare('SELECT * FROM referrals WHERE id = ?').get(result.lastInsertRowid);
  },

  findByReferredId(referredId) {
    return getDb().prepare('SELECT * FROM referrals WHERE referred_id = ?').get(referredId);
  },

  listByReferrer(referrerId) {
    return getDb().prepare(`
      SELECT r.*, f.email as referred_email, f.name as referred_name
      FROM referrals r JOIN fans f ON r.referred_id = f.id
      WHERE r.referrer_id = ? ORDER BY r.created_at DESC
    `).all(referrerId);
  },

  listByCampaign(campaignId, { limit = 50, offset = 0 } = {}) {
    return getDb().prepare('SELECT * FROM referrals WHERE campaign_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(campaignId, limit, offset);
  },

  updateStatus(id, status) {
    getDb().prepare('UPDATE referrals SET status = ? WHERE id = ?').run(status, id);
  },

  countByCampaign(campaignId) {
    return getDb().prepare("SELECT COUNT(*) as count FROM referrals WHERE campaign_id = ? AND status = 'confirmed'").get(campaignId).count;
  },

  countToday() {
    return getDb().prepare("SELECT COUNT(*) as count FROM referrals WHERE created_at >= date('now')").get().count;
  }
};

module.exports = Referral;
