const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'fanloop.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);

    // Migrations — add artist profile fields
    const artistCols = db.prepare("PRAGMA table_info(artists)").all().map(c => c.name);
    const newCols = [
      ['website', 'TEXT'],
      ['spotify_url', 'TEXT'],
      ['apple_music_url', 'TEXT'],
      ['instagram_handle', 'TEXT'],
      ['tiktok_handle', 'TEXT'],
      ['twitter_handle', 'TEXT'],
      ['youtube_url', 'TEXT'],
      ['discord_url', 'TEXT'],
      ['contact_email', 'TEXT'],
      ['phone', 'TEXT'],
      ['city', 'TEXT'],
      ['state_region', 'TEXT'],
      ['country', 'TEXT'],
      ['merch_store_url', 'TEXT'],
      ['default_venue', 'TEXT'],
      ['fan_noun', 'TEXT'],  // e.g. "Swifties", "BeyHive", "fans"
    ];
    for (const [col, type] of newCols) {
      if (!artistCols.includes(col)) {
        db.exec(`ALTER TABLE artists ADD COLUMN ${col} ${type}`);
      }
    }
  }
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };
