-- ─────────────────────────────────────────────────────────────────────────────
-- MapToPoster – PostgreSQL DDL
-- Run this once against your 'maptoposter' database.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS t_user (
  user_id       SERIAL PRIMARY KEY,
  firebase_uid  TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  display_name  TEXT,
  photo_url     TEXT,
  ts_created    TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
  ts_last_login TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE IF NOT EXISTS t_map_request (
  map_request_id    SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES t_user(user_id) ON DELETE CASCADE,
  city              TEXT,
  country           TEXT NOT NULL,
  coords            TEXT,
  theme             TEXT NOT NULL,
  distance          INTEGER NOT NULL,
  orientation       TEXT NOT NULL,
  title             TEXT,
  title_pos         TEXT,
  full_borders      BOOLEAN DEFAULT FALSE,
  request_hash      TEXT UNIQUE NOT NULL,
  preview_filename  TEXT,
  highres_filename  TEXT,
  ts_created        TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE IF NOT EXISTS t_payment (
  payment_id                SERIAL PRIMARY KEY,
  user_id                   INTEGER NOT NULL REFERENCES t_user(user_id) ON DELETE CASCADE,
  map_request_id            INTEGER NOT NULL REFERENCES t_map_request(map_request_id) ON DELETE CASCADE,
  stripe_session_id         TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id  TEXT,
  amount                    INTEGER NOT NULL,
  currency                  TEXT DEFAULT 'usd',
  status                    TEXT DEFAULT 'pending',
  ts_paid                   TIMESTAMPTZ,
  ts_created                TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE TABLE IF NOT EXISTS t_email_delivery (
  email_delivery_id  SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL REFERENCES t_user(user_id) ON DELETE CASCADE,
  map_request_id     INTEGER NOT NULL REFERENCES t_map_request(map_request_id) ON DELETE CASCADE,
  email              TEXT NOT NULL,
  resend_email_id    TEXT,
  status             TEXT DEFAULT 'pending',
  ts_sent            TIMESTAMPTZ,
  ts_created         TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_t_user_firebase_uid         ON t_user(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_t_map_request_hash          ON t_map_request(request_hash);
CREATE INDEX IF NOT EXISTS idx_t_payment_stripe_session_id ON t_payment(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_t_payment_status            ON t_payment(status);
