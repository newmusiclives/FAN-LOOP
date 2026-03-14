const { getDb } = require('../../db/database');

const PROFILE_FIELDS = [
  'name', 'slug', 'genre', 'bio', 'image_url', 'brand_config',
  'website', 'spotify_url', 'apple_music_url',
  'instagram_handle', 'tiktok_handle', 'twitter_handle',
  'youtube_url', 'discord_url', 'contact_email', 'phone',
  'city', 'state_region', 'country', 'merch_store_url',
  'default_venue', 'fan_noun'
];

const Artist = {
  findById(id) {
    return getDb().prepare('SELECT * FROM artists WHERE id = ?').get(id);
  },

  findBySlug(slug) {
    return getDb().prepare('SELECT * FROM artists WHERE slug = ?').get(slug);
  },

  create({ user_id, name, slug, genre, bio, image_url, brand_config, ...rest }) {
    const cols = ['user_id', 'name', 'slug', 'genre', 'bio', 'image_url', 'brand_config'];
    const vals = [user_id, name, slug, genre || null, bio || null, image_url || null, JSON.stringify(brand_config || {})];

    // Add any extra profile fields that were provided
    for (const field of PROFILE_FIELDS) {
      if (field === 'name' || field === 'slug' || field === 'genre' || field === 'bio' || field === 'image_url' || field === 'brand_config') continue;
      if (rest[field] !== undefined && rest[field] !== '') {
        cols.push(field);
        vals.push(rest[field]);
      }
    }

    const placeholders = cols.map(() => '?').join(', ');
    const result = getDb().prepare(
      `INSERT INTO artists (${cols.join(', ')}) VALUES (${placeholders})`
    ).run(...vals);
    return this.findById(result.lastInsertRowid);
  },

  update(id, fields) {
    const allowed = PROFILE_FIELDS;
    const sets = [];
    const values = [];
    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = ?`);
        values.push(key === 'brand_config' ? JSON.stringify(val) : (val || null));
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
  },

  /**
   * Returns a map of placeholder -> value for use in campaign template auto-fill.
   * All [BRACKETED] placeholders in templates that can be derived from the artist profile.
   */
  getPlaceholderMap(artist) {
    if (!artist) return {};
    const bc = artist.brand_config ? (typeof artist.brand_config === 'string' ? JSON.parse(artist.brand_config) : artist.brand_config) : {};
    return {
      '[ARTIST NAME]': artist.name || '',
      '[GENRE]': artist.genre || '',
      '[CITY]': artist.city || '',
      '[STATE]': artist.state_region || '',
      '[COUNTRY]': artist.country || '',
      '[WEBSITE]': artist.website || '',
      '[SPOTIFY]': artist.spotify_url || '',
      '[APPLE MUSIC]': artist.apple_music_url || '',
      '[INSTAGRAM]': artist.instagram_handle ? `@${artist.instagram_handle.replace(/^@/, '')}` : '',
      '[TIKTOK]': artist.tiktok_handle ? `@${artist.tiktok_handle.replace(/^@/, '')}` : '',
      '[TWITTER]': artist.twitter_handle ? `@${artist.twitter_handle.replace(/^@/, '')}` : '',
      '[YOUTUBE]': artist.youtube_url || '',
      '[DISCORD]': artist.discord_url || '',
      '[MERCH STORE]': artist.merch_store_url || '',
      '[VENUE]': artist.default_venue || '[VENUE]',
      '[FAN NOUN]': artist.fan_noun || 'fans',
      '[CONTACT EMAIL]': artist.contact_email || '',
    };
  }
};

module.exports = Artist;
