'use strict';
const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const router   = express.Router();
const log      = require('../utils/logger');
const events   = require('../utils/events');
const { db, listContacts, countContacts } = require('../utils/db');

// ── Auth ──────────────────────────────────────────────────
function requireKey(req, res, next) {
  const envKey   = process.env.METRICS_KEY;
  if (!envKey)   return res.status(503).send('Admin disabled — set METRICS_KEY in .env');
  const provided = req.query.key || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (provided !== envKey) return res.status(401).send('Unauthorized');
  next();
}

// ── GET /api/admin — redirect to panel ───────────────────
router.get('/', requireKey, (req, res) => {
  res.redirect(`/api/admin/panel?key=${req.query.key || ''}`);
});

// ── GET /api/admin/panel — HTML dashboard ─────────────────
router.get('/panel', requireKey, (req, res) => {
  const key   = req.query.key || '';
  const total = countContacts.get().total;
  const today = db.prepare(`
    SELECT COUNT(*) AS c FROM contacts
    WHERE date(created_at) = date('now')
  `).get().c;
  const unsent = db.prepare(`SELECT COUNT(*) AS c FROM contacts WHERE mail_sent = 0`).get().c;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="bs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>MotionVibe Admin</title>
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0 }
    body { font-family:system-ui,sans-serif; background:#07060f; color:#e2e8f0; min-height:100vh }
    header { background:#0e0d1c; border-bottom:1px solid #1e1b3a; padding:16px 28px; display:flex; align-items:center; justify-content:space-between }
    .logo { font-size:1.1rem; font-weight:800; color:#fff }
    .logo span { color:#BF5FFF }
    .badge { font-size:.68rem; padding:3px 10px; border-radius:50px; font-weight:700; letter-spacing:.04em }
    .live { background:rgba(34,197,94,.15); color:#22c55e }
    main { max-width:1200px; margin:0 auto; padding:28px }
    .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:28px }
    .stat { background:#0e0d1c; border:1px solid #1e1b3a; border-radius:14px; padding:20px }
    .stat-label { font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#64748b; margin-bottom:8px }
    .stat-val { font-size:2.2rem; font-weight:900; line-height:1 }
    .stat-sub { font-size:.72rem; color:#475569; margin-top:6px }
    table { width:100%; border-collapse:collapse; background:#0e0d1c; border-radius:14px; overflow:hidden; border:1px solid #1e1b3a }
    th { font-size:.68rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#64748b; padding:12px 16px; text-align:left; border-bottom:1px solid #1e1b3a }
    td { padding:13px 16px; font-size:.83rem; border-bottom:1px solid #12111f; vertical-align:top }
    tr:last-child td { border:none }
    tr.new-row { animation:flashIn .6s ease }
    @keyframes flashIn { from { background:rgba(191,95,255,.15) } to { background:transparent } }
    .usluga { display:inline-block; font-size:.68rem; font-weight:700; padding:2px 9px; border-radius:50px; background:rgba(191,95,255,.12); color:#BF5FFF }
    .ok { color:#22c55e } .fail { color:#ef4444 }
    .name { font-weight:700; color:#fff }
    .email { color:#94a3b8; font-size:.78rem }
    a.row-link { color:#BF5FFF; text-decoration:none; font-size:.78rem }
    a.row-link:hover { text-decoration:underline }
    .empty { text-align:center; color:#475569; padding:48px; font-size:.9rem }
    /* Toast notifications */
    #toasts { position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px }
    .toast { background:#0e0d1c; border:1px solid rgba(191,95,255,.4); border-left:4px solid #BF5FFF; border-radius:10px; padding:14px 18px; min-width:280px; max-width:340px; box-shadow:0 8px 32px rgba(0,0,0,.5); animation:slideIn .3s ease }
    @keyframes slideIn { from { transform:translateX(120%); opacity:0 } to { transform:translateX(0); opacity:1 } }
    .toast-title { font-size:.78rem; font-weight:800; color:#BF5FFF; margin-bottom:4px; text-transform:uppercase; letter-spacing:.05em }
    .toast-body { font-size:.82rem; color:#e2e8f0 }
    .toast-sub { font-size:.72rem; color:#64748b; margin-top:3px }
    #conn { width:8px; height:8px; border-radius:50%; background:#ef4444; display:inline-block; margin-right:6px }
    #conn.on { background:#22c55e; box-shadow:0 0 6px #22c55e }
    .section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px }
    .section-head h2 { font-size:.9rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em }
    .refresh-btn { font-size:.75rem; background:rgba(191,95,255,.1); color:#BF5FFF; border:1px solid rgba(191,95,255,.3); border-radius:8px; padding:5px 14px; cursor:pointer }
    .refresh-btn:hover { background:rgba(191,95,255,.2) }
  </style>
</head>
<body>

<div id="toasts"></div>

<header>
  <div class="logo">Motion<span>Vibe</span> &nbsp;<span style="color:#475569;font-weight:400;font-size:.85rem">Admin</span></div>
  <div style="display:flex;align-items:center;gap:10px">
    <span id="conn"></span><span id="conn-label" style="font-size:.75rem;color:#64748b">Connecting...</span>
    <span class="badge live" id="live-badge" style="display:none">● LIVE</span>
  </div>
</header>

<main>
  <div class="stats">
    <div class="stat">
      <div class="stat-label">Ukupno upita</div>
      <div class="stat-val" id="s-total">${total}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Danas</div>
      <div class="stat-val" id="s-today" style="color:#BF5FFF">${today}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Email nije poslan</div>
      <div class="stat-val" id="s-unsent" style="color:${unsent > 0 ? '#f59e0b' : '#22c55e'}">${unsent}</div>
      <div class="stat-sub">${unsent > 0 ? 'Provjeri log' : 'Sve OK'}</div>
    </div>
  </div>

  <div class="section-head">
    <h2>Kontakt upiti</h2>
    <button class="refresh-btn" onclick="loadContacts()">↻ Osvježi</button>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Datum</th>
        <th>Ime</th>
        <th>Usluga</th>
        <th>Poruka</th>
        <th>Mail</th>
      </tr>
    </thead>
    <tbody id="contacts-body">
      <tr><td colspan="6" class="empty">Učitavanje...</td></tr>
    </tbody>
  </table>
</main>

<script>
const KEY = ${JSON.stringify(key)};

// ── Load contacts via API ─────────────────────────────────
async function loadContacts(prepend) {
  const r    = await fetch('/api/admin/contacts?limit=50&key=' + KEY);
  const data = await r.json();
  const tbody = document.getElementById('contacts-body');

  if (!data.contacts?.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Nema upita još.</td></tr>';
    return;
  }

  const rows = data.contacts.map((c, i) => \`
    <tr id="row-\${c.id}" \${i === 0 && prepend ? 'class="new-row"' : ''}>
      <td style="color:#475569">\${c.id}</td>
      <td style="color:#64748b;font-size:.75rem">\${c.created_at.replace('T',' ').slice(0,16)}</td>
      <td>
        <div class="name">\${c.ime}</div>
        <div class="email">\${c.email}</div>
      </td>
      <td>\${c.usluga ? '<span class="usluga">' + c.usluga + '</span>' : '<span style="color:#475569">—</span>'}</td>
      <td style="color:#94a3b8;max-width:300px">\${c.poruka_preview}\${c.poruka_preview?.length >= 80 ? '…' : ''}</td>
      <td>\${c.mail_sent ? '<span class="ok">✓</span>' : '<span class="fail">✗</span>'}</td>
    </tr>
  \`).join('');

  tbody.innerHTML = rows;
  document.getElementById('s-total').textContent = data.total;
}

// ── Server-Sent Events — real-time notifications ──────────
function connectSSE() {
  const conn      = document.getElementById('conn');
  const connLabel = document.getElementById('conn-label');
  const liveBadge = document.getElementById('live-badge');
  const es        = new EventSource('/api/admin/events?key=' + KEY);

  es.onopen = () => {
    conn.classList.add('on');
    connLabel.textContent = 'Povezan';
    liveBadge.style.display = 'inline';
  };

  es.addEventListener('new_contact', e => {
    const data = JSON.parse(e.data);
    showToast(data);
    loadContacts(true);
    // Update today counter
    const el = document.getElementById('s-today');
    el.textContent = parseInt(el.textContent || 0) + 1;
  });

  es.onerror = () => {
    conn.classList.remove('on');
    connLabel.textContent = 'Reconnecting...';
    liveBadge.style.display = 'none';
    // Browser auto-reconnects SSE, no need to do it manually
  };
}

// ── Toast notification ────────────────────────────────────
function showToast({ ime, usluga, id }) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = \`
    <div class="toast-title">🔔 Novi upit</div>
    <div class="toast-body">\${ime}</div>
    <div class="toast-sub">\${usluga || 'Usluga nije odabrana'} · #\${id}</div>
  \`;
  document.getElementById('toasts').prepend(t);
  setTimeout(() => t.style.animation = 'slideIn .3s ease reverse', 4200);
  setTimeout(() => t.remove(), 4600);
}

loadContacts();
connectSSE();
</script>
</body>
</html>`);
});

// ── GET /api/admin/events — Server-Sent Events stream ─────
router.get('/events', requireKey, (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  // Keep-alive ping every 25s so connection doesn't time out
  const ping = setInterval(() => res.write(':ping\n\n'), 25_000);

  const send = data => res.write(`event: new_contact\ndata: ${JSON.stringify(data)}\n\n`);
  events.on('new_contact', send);

  req.on('close', () => {
    clearInterval(ping);
    events.off('new_contact', send);
  });
});

// ── GET /api/admin/contacts ───────────────────────────────
router.get('/contacts', requireKey, (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const offset = (page - 1) * limit;
  const rows   = listContacts.all(limit, offset);
  const total  = countContacts.get().total;
  res.json({ total, page, limit, pages: Math.ceil(total / limit), contacts: rows });
});

// ── GET /api/admin/contacts/:id ───────────────────────────
router.get('/contacts/:id', requireKey, (req, res) => {
  const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// ── POST /api/admin/backup ────────────────────────────────
router.post('/backup', requireKey, (_req, res) => {
  const result = triggerBackup();
  res.status(result.ok ? 200 : 500).json(result);
});

// ── Backup ────────────────────────────────────────────────
const DB_FILE    = path.join(__dirname, '..', 'data', 'motionvibe.db');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');

function triggerBackup() {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const ts   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dest = path.join(BACKUP_DIR, `motionvibe-${ts}.db`);
    db.backup(dest);
    pruneBackups();
    return { ok: true, file: path.basename(dest), ts };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function pruneBackups() {
  try {
    const DAY   = 86_400_000;
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => ({ name: f, ts: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
      .sort((a, b) => b.ts - a.ts);

    const keep = new Set();
    const byDay = {}, byWeek = {}, byMonth = {};

    for (const f of files) {
      const day   = Math.floor(f.ts / DAY);
      const week  = Math.floor(f.ts / (7 * DAY));
      const d     = new Date(f.ts);
      const month = `${d.getFullYear()}-${d.getMonth()}`;

      if (Object.keys(byDay).length   < 7  && !byDay[day])   { byDay[day]   = 1; keep.add(f.name); }
      if (Object.keys(byWeek).length  < 4  && !byWeek[week]) { byWeek[week] = 1; keep.add(f.name); }
      if (Object.keys(byMonth).length < 12 && !byMonth[month]){ byMonth[month]=1; keep.add(f.name); }
    }

    for (const f of files) {
      if (!keep.has(f.name)) {
        try { fs.unlinkSync(path.join(BACKUP_DIR, f.name)); } catch {}
      }
    }
  } catch {}
}

function scheduleDailyBackup() {
  const result = triggerBackup();
  if (result.ok) log.info('DB_BACKUP', result);
  else           log.error('DB_BACKUP_FAIL', result);
  setTimeout(scheduleDailyBackup, 24 * 60 * 60 * 1000);
}

module.exports = router;
module.exports.scheduleDailyBackup = scheduleDailyBackup;
