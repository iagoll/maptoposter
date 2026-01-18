const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use environment variable for database path (production)
// Falls back to local directory (development)
const dbDir = process.env.DB_PATH || path.join(__dirname, '../../data');
const dbPath = path.join(dbDir, 'maptoposter.db');

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✓ Created database directory: ${dbDir}`);
}

const db = new Database(dbPath);

// Log database location for debugging
console.log(`✓ Database location: ${dbPath}`);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initializeDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firebase_uid TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      display_name TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Map requests table (for caching and tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS map_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      city TEXT,
      country TEXT NOT NULL,
      coords TEXT,
      theme TEXT NOT NULL,
      distance INTEGER NOT NULL,
      orientation TEXT NOT NULL,
      title TEXT,
      title_pos TEXT,
      full_borders BOOLEAN DEFAULT 0,
      request_hash TEXT UNIQUE NOT NULL,
      preview_filename TEXT,
      highres_filename TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      map_request_id INTEGER NOT NULL,
      stripe_session_id TEXT UNIQUE NOT NULL,
      stripe_payment_intent_id TEXT,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      status TEXT DEFAULT 'pending',
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (map_request_id) REFERENCES map_requests(id) ON DELETE CASCADE
    )
  `);

  // Email deliveries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      map_request_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      resend_email_id TEXT,
      status TEXT DEFAULT 'pending',
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (map_request_id) REFERENCES map_requests(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
    CREATE INDEX IF NOT EXISTS idx_map_requests_hash ON map_requests(request_hash);
    CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(stripe_session_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
  `);

  console.log('✓ Database initialized successfully');
};

// Initialize on import
initializeDatabase();

module.exports = db;
