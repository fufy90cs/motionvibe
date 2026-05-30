'use strict';
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_DIR  = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'motionvibe.db');

try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch {}

const db = new Database(DB_FILE);

// WAL mode — faster writes, safe concurrent reads
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    ip         TEXT,
    ime        TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    telefon    TEXT,
    usluga     TEXT,
    poruka     TEXT    NOT NULL,
    mail_sent  INTEGER NOT NULL DEFAULT 0,
    mail_error TEXT
  );
`);

// ── Prepared statements ───────────────────────────────────
const insertContact = db.prepare(`
  INSERT INTO contacts (ip, ime, email, telefon, usluga, poruka)
  VALUES (@ip, @ime, @email, @telefon, @usluga, @poruka)
`);

const markMailSent = db.prepare(`
  UPDATE contacts SET mail_sent = 1 WHERE id = ?
`);

const markMailFailed = db.prepare(`
  UPDATE contacts SET mail_sent = 0, mail_error = ? WHERE id = ?
`);

const listContacts = db.prepare(`
  SELECT id, created_at, ip, ime, email, telefon, usluga,
         substr(poruka, 1, 80) AS poruka_preview, mail_sent, mail_error
  FROM contacts
  ORDER BY id DESC
  LIMIT ? OFFSET ?
`);

const countContacts = db.prepare(`SELECT COUNT(*) AS total FROM contacts`);

module.exports = { db, insertContact, markMailSent, markMailFailed, listContacts, countContacts };
