'use strict';
const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────
const LOG_DIR    = path.join(__dirname, '..', 'logs');
const LOG_FILE   = path.join(LOG_DIR, 'app.log');
const ERR_FILE   = path.join(LOG_DIR, 'error.log');   // errors + criticals only
const MAX_BYTES  = 5 * 1024 * 1024;
const MAX_BACKUPS = 5;
const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // max 1 alert email per category per hour

// ── PII fields never written to logs ─────────────────────
const PII_KEYS = new Set(['ime', 'email', 'poruka', 'password', 'pass', 'token', 'secret', 'key', 'authorization']);

try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch {}

// ── Log rotation ──────────────────────────────────────────
function rotate(filePath) {
  try {
    if (fs.statSync(filePath).size < MAX_BYTES) return;
    fs.renameSync(filePath, `${filePath}.${Date.now()}.bak`);
    fs.readdirSync(LOG_DIR)
      .filter(f => f.endsWith('.bak'))
      .sort()
      .slice(0, -MAX_BACKUPS)
      .forEach(f => { try { fs.unlinkSync(path.join(LOG_DIR, f)); } catch {} });
  } catch {}
}

// ── PII scrubber ──────────────────────────────────────────
function scrub(data) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    out[k] = PII_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : v;
  }
  return out;
}

// ── Core write ────────────────────────────────────────────
function write(level, category, data) {
  rotate(LOG_FILE);
  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    category,
    ...scrub(data),
  }) + '\n';

  // Console routing
  if (level === 'CRITICAL' || level === 'ERROR' || level === 'SECURITY') {
    process.stderr.write(entry);
  } else {
    process.stdout.write(entry);
  }

  // All logs → app.log
  try { fs.appendFileSync(LOG_FILE, entry, 'utf8'); } catch {}

  // Errors + criticals also → error.log for easier monitoring
  if (level === 'ERROR' || level === 'CRITICAL') {
    rotate(ERR_FILE);
    try { fs.appendFileSync(ERR_FILE, entry, 'utf8'); } catch {}
  }

  // Critical → trigger alert
  if (level === 'CRITICAL') sendAlert(category, data).catch(() => {});
}

// ── Critical alerting ─────────────────────────────────────
// Rate-limited: max 1 email per category per hour to prevent spam
const _alertSent = new Map();

async function sendAlert(category, data) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return;

  const now  = Date.now();
  const last = _alertSent.get(category) || 0;
  if (now - last < ALERT_COOLDOWN_MS) return; // still in cooldown
  _alertSent.set(category, now);

  // Lazy-require to avoid circular dependency with routes/contact.js
  const nodemailer = require('nodemailer');
  const transport  = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

  const safeData = JSON.stringify(scrub(data), null, 2);

  await transport.sendMail({
    from:    `"MotionVibe Alert" <${process.env.MAIL_USER}>`,
    to:      process.env.MAIL_TO || process.env.MAIL_USER,
    subject: `🚨 CRITICAL ERROR — ${category}`,
    html: `
      <div style="font-family:monospace;max-width:640px;color:#1a1a1a">
        <h2 style="color:#dc2626;margin:0 0 16px">🚨 Critical Error Detected</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:6px 0;color:#666;width:100px">Category</td><td style="font-weight:700">${category}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Time</td><td>${new Date().toISOString()}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Server</td><td>${process.env.NODE_ENV || 'development'}</td></tr>
        </table>
        <pre style="background:#f5f5f5;padding:16px;border-radius:6px;font-size:12px;overflow-x:auto">${safeData}</pre>
        <p style="font-size:12px;color:#999;margin-top:16px">MotionVibe auto-alert — max 1 per hour per category</p>
      </div>`,
  });
}

// ── Public API ────────────────────────────────────────────
module.exports = {
  info:     (cat, data) => write('INFO',     cat, data || {}),
  warn:     (cat, data) => write('WARN',     cat, data || {}),
  error:    (cat, data) => write('ERROR',    cat, data || {}),
  security: (cat, data) => write('SECURITY', cat, data || {}),
  critical: (cat, data) => write('CRITICAL', cat, data || {}),
};
