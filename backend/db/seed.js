require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { getDb, closeDb } = require('./database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

function generateCode() {
  return uuidv4().replace(/-/g, '').substring(0, 8);
}

function seed() {
  const db = getDb();

  // Check if already seeded
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = 'admin@fanloop.io'").get();
  if (existingAdmin) {
    // If ADMIN_INITIAL_PASSWORD is set, update the password even if already seeded
    if (process.env.ADMIN_INITIAL_PASSWORD) {
      const newHash = bcrypt.hashSync(process.env.ADMIN_INITIAL_PASSWORD, 10);
      db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE email = 'admin@fanloop.io'").run(newHash);
      console.log('Admin password updated from ADMIN_INITIAL_PASSWORD env var.');
    }
    console.log('Database already seeded. Skipping.');
    closeDb();
    return;
  }

  console.log('Seeding database...');

  // Admin user — use env var or generate a secure default
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(12).toString('base64url');
  const adminHash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(`INSERT OR IGNORE INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`).run(
    'admin@fanloop.io', adminHash, 'FANLOOP Admin', 'admin'
  );
  const admin = db.prepare("SELECT * FROM users WHERE email = 'admin@fanloop.io'").get();

  if (!process.env.ADMIN_INITIAL_PASSWORD) {
    console.log(`\n  Generated admin password: ${adminPassword}`);
    console.log('  IMPORTANT: Save this password now. It will not be shown again.');
    console.log('  Set ADMIN_INITIAL_PASSWORD env var to use a specific password.\n');
  }

  // Sample artist
  db.prepare(`INSERT OR IGNORE INTO artists (user_id, name, slug, genre, bio, brand_config) VALUES (?, ?, ?, ?, ?, ?)`).run(
    admin.id, 'DJ Nova', 'dj-nova', 'Electronic / House',
    'Rising electronic artist pushing the boundaries of house music.',
    JSON.stringify({ primary_color: '#8b5cf6', secondary_color: '#ec4899', font: 'Inter' })
  );
  const artist = db.prepare("SELECT * FROM artists WHERE slug = 'dj-nova'").get();

  // Sample campaign
  db.prepare(`INSERT OR IGNORE INTO campaigns (artist_id, title, slug, type, status, headline, subheadline, description, share_messages, reward_tiers, fan_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    artist.id,
    'Midnight Drop - Exclusive Pre-Save',
    'midnight-drop',
    'pre-save',
    'active',
    'Be First to Hear "Midnight Drop"',
    'Pre-save now & unlock exclusive rewards by sharing with friends',
    'Get early access to DJ Nova\'s upcoming single "Midnight Drop" plus exclusive behind-the-scenes content.',
    JSON.stringify({
      twitter: 'I just pre-saved @DJNova\'s new track "Midnight Drop" 🔥 Get exclusive rewards when you sign up too! {link}',
      whatsapp: 'Check out DJ Nova\'s new track! Pre-save and get exclusive rewards: {link}',
      email_subject: 'You need to hear this',
      email_body: 'Hey! I just discovered DJ Nova\'s upcoming track "Midnight Drop". Pre-save it and we both get exclusive rewards: {link}'
    }),
    JSON.stringify([
      { tier: 'Listener', referrals: 1, reward: 'Unreleased acoustic demo' },
      { tier: 'Promoter', referrals: 3, reward: 'Exclusive behind-the-scenes video' },
      { tier: 'Street Team', referrals: 5, reward: 'Signed digital poster' },
      { tier: 'Superfan', referrals: 10, reward: 'Video shoutout from DJ Nova' },
      { tier: 'Inner Circle', referrals: 25, reward: 'Free concert ticket + meet & greet' }
    ]),
    5
  );
  const campaign = db.prepare("SELECT * FROM campaigns WHERE slug = 'midnight-drop'").get();

  // Rewards
  const tiers = [
    { name: 'Listener', required: 1, desc: 'Unreleased acoustic demo', type: 'digital' },
    { name: 'Promoter', required: 3, desc: 'Exclusive behind-the-scenes video', type: 'digital' },
    { name: 'Street Team', required: 5, desc: 'Signed digital poster', type: 'digital' },
    { name: 'Superfan', required: 10, desc: 'Video shoutout from DJ Nova', type: 'digital' },
    { name: 'Inner Circle', required: 25, desc: 'Free concert ticket + meet & greet', type: 'physical' }
  ];
  for (const t of tiers) {
    db.prepare('INSERT OR IGNORE INTO rewards (campaign_id, tier_name, referrals_required, description, reward_type) VALUES (?, ?, ?, ?, ?)')
      .run(campaign.id, t.name, t.required, t.desc, t.type);
  }

  // Sample fans
  const fans = [
    { email: 'sarah@example.com', name: 'Sarah Johnson', code: generateCode() },
    { email: 'mike@example.com', name: 'Mike Chen', code: generateCode() },
    { email: 'emma@example.com', name: 'Emma Wilson', code: generateCode() },
    { email: 'alex@example.com', name: 'Alex Rivera', code: generateCode() },
    { email: 'jordan@example.com', name: 'Jordan Lee', code: generateCode() }
  ];

  for (const f of fans) {
    db.prepare('INSERT OR IGNORE INTO fans (campaign_id, email, name, referral_code, verified, source) VALUES (?, ?, ?, ?, 1, ?)')
      .run(campaign.id, f.email, f.name, f.code, 'direct');
  }

  // Set up referral chain
  const sarah = db.prepare("SELECT * FROM fans WHERE email = 'sarah@example.com'").get();
  const mike = db.prepare("SELECT * FROM fans WHERE email = 'mike@example.com'").get();
  const emma = db.prepare("SELECT * FROM fans WHERE email = 'emma@example.com'").get();
  const alex = db.prepare("SELECT * FROM fans WHERE email = 'alex@example.com'").get();

  if (sarah && mike && emma && alex) {
    db.prepare('UPDATE fans SET referred_by = ?, referral_count = 2 WHERE id = ?').run(null, sarah.id);
    db.prepare('UPDATE fans SET referred_by = ? WHERE id = ?').run(sarah.id, mike.id);
    db.prepare('UPDATE fans SET referred_by = ? WHERE id = ?').run(sarah.id, emma.id);
    db.prepare('UPDATE fans SET referred_by = ?, referral_count = 1 WHERE id = ?').run(mike.id, alex.id);

    db.prepare('INSERT OR IGNORE INTO referrals (campaign_id, referrer_id, referred_id, status) VALUES (?, ?, ?, ?)').run(campaign.id, sarah.id, mike.id, 'confirmed');
    db.prepare('INSERT OR IGNORE INTO referrals (campaign_id, referrer_id, referred_id, status) VALUES (?, ?, ?, ?)').run(campaign.id, sarah.id, emma.id, 'confirmed');
    db.prepare('INSERT OR IGNORE INTO referrals (campaign_id, referrer_id, referred_id, status) VALUES (?, ?, ?, ?)').run(campaign.id, mike.id, alex.id, 'confirmed');
  }

  // Sample tags
  db.prepare("INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)").run('VIP', '#f59e0b');
  db.prepare("INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)").run('Early Adopter', '#10b981');
  db.prepare("INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)").run('High Referrer', '#8b5cf6');

  console.log('Seed complete!');
  console.log(`Campaign URL: /c/midnight-drop`);
  closeDb();
}

seed();
