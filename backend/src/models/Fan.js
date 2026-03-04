const { getDb } = require('../../db/database');

const Fan = {
  findById(id) {
    return getDb().prepare('SELECT * FROM fans WHERE id = ?').get(id);
  },

  findByCode(code) {
    return getDb().prepare('SELECT * FROM fans WHERE referral_code = ?').get(code);
  },

  findByEmail(campaignId, email) {
    return getDb().prepare('SELECT * FROM fans WHERE campaign_id = ? AND email = ?').get(campaignId, email.toLowerCase());
  },

  findByVerificationToken(token) {
    return getDb().prepare('SELECT * FROM fans WHERE verification_token = ?').get(token);
  },

  create(data) {
    const result = getDb().prepare(`
      INSERT INTO fans (campaign_id, email, name, referral_code, referred_by, verification_token, ip_address, device_fingerprint, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.campaign_id, data.email.toLowerCase(), data.name || null, data.referral_code,
      data.referred_by || null, data.verification_token || null,
      data.ip_address || null, data.device_fingerprint || null, data.source || null
    );
    return this.findById(result.lastInsertRowid);
  },

  incrementReferralCount(id) {
    getDb().prepare(`UPDATE fans SET referral_count = referral_count + 1, updated_at = datetime('now') WHERE id = ?`).run(id);
  },

  decrementReferralCount(id) {
    getDb().prepare(`UPDATE fans SET referral_count = MAX(0, referral_count - 1), updated_at = datetime('now') WHERE id = ?`).run(id);
  },

  verify(id) {
    getDb().prepare(`UPDATE fans SET verified = 1, verification_token = NULL, updated_at = datetime('now') WHERE id = ?`).run(id);
  },

  ban(id) {
    getDb().prepare(`UPDATE fans SET status = 'banned', updated_at = datetime('now') WHERE id = ?`).run(id);
  },

  listByCampaign(campaignId, { limit = 50, offset = 0, sort = 'created_at', order = 'DESC', search } = {}) {
    const allowedSorts = ['created_at', 'referral_count', 'email', 'name'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    if (search) {
      return getDb().prepare(`SELECT * FROM fans WHERE campaign_id = ? AND (email LIKE ? OR name LIKE ?) ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`)
        .all(campaignId, `%${search}%`, `%${search}%`, limit, offset);
    }
    return getDb().prepare(`SELECT * FROM fans WHERE campaign_id = ? ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`)
      .all(campaignId, limit, offset);
  },

  countByCampaign(campaignId) {
    return getDb().prepare('SELECT COUNT(*) as count FROM fans WHERE campaign_id = ?').get(campaignId).count;
  },

  countTodayByCampaign(campaignId) {
    return getDb().prepare("SELECT COUNT(*) as count FROM fans WHERE campaign_id = ? AND created_at >= date('now')").get(campaignId).count;
  },

  countToday() {
    return getDb().prepare("SELECT COUNT(*) as count FROM fans WHERE created_at >= date('now')").get().count;
  },

  countAll() {
    return getDb().prepare('SELECT COUNT(*) as count FROM fans').get().count;
  },

  getRecentSignups(limit = 10) {
    return getDb().prepare(`
      SELECT f.*, c.title as campaign_title, c.slug as campaign_slug
      FROM fans f JOIN campaigns c ON f.campaign_id = c.id
      ORDER BY f.created_at DESC LIMIT ?
    `).all(limit);
  },

  getReferralTree(fanId) {
    return getDb().prepare('SELECT * FROM fans WHERE referred_by = ? ORDER BY created_at DESC').all(fanId);
  },

  getTopReferrers(campaignId, limit = 10) {
    return getDb().prepare('SELECT * FROM fans WHERE campaign_id = ? AND referral_count > 0 ORDER BY referral_count DESC LIMIT ?')
      .all(campaignId, limit);
  },

  getRecentByIp(ip, minutes = 5) {
    return getDb().prepare(`SELECT * FROM fans WHERE ip_address = ? AND created_at >= datetime('now', '-${minutes} minutes')`).all(ip);
  },

  countByIpToday(ip) {
    return getDb().prepare("SELECT COUNT(*) as count FROM fans WHERE ip_address = ? AND created_at >= date('now')").get(ip).count;
  },

  listAll({ limit = 50, offset = 0, search } = {}) {
    if (search) {
      return getDb().prepare(`
        SELECT f.*, c.title as campaign_title FROM fans f
        JOIN campaigns c ON f.campaign_id = c.id
        WHERE f.email LIKE ? OR f.name LIKE ?
        ORDER BY f.created_at DESC LIMIT ? OFFSET ?
      `).all(`%${search}%`, `%${search}%`, limit, offset);
    }
    return getDb().prepare(`
      SELECT f.*, c.title as campaign_title FROM fans f
      JOIN campaigns c ON f.campaign_id = c.id
      ORDER BY f.created_at DESC LIMIT ? OFFSET ?
    `).all(limit, offset);
  }
};

module.exports = Fan;
