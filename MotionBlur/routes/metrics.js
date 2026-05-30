'use strict';
const express      = require('express');
const router       = express.Router();
const { getStats } = require('../utils/metrics');

// ── Auth: METRICS_KEY env var ─────────────────────────────
// Access: GET /api/metrics?key=YOUR_KEY  or  Authorization: Bearer YOUR_KEY
function requireKey(req, res, next) {
  const envKey = process.env.METRICS_KEY;
  if (!envKey) return res.status(503).json({ error: 'Metrics disabled — set METRICS_KEY in .env' });

  const provided =
    req.query.key ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (provided !== envKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── GET /api/metrics — full JSON metrics ──────────────────
router.get('/', requireKey, (_req, res) => {
  res.json(getStats());
});

// ── GET /api/metrics/dashboard — HTML dashboard ───────────
router.get('/dashboard', requireKey, (_req, res) => {
  const s = getStats();
  const errorRateNum = parseFloat(s.errors.rate);
  const rateColor    = errorRateNum > 20 ? '#ef4444' : errorRateNum > 5 ? '#f59e0b' : '#22c55e';
  const heapColor    = parseFloat(s.memory.heapPercent) > 80 ? '#ef4444' : '#22c55e';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="refresh" content="30">
  <title>MotionVibe — Metrics</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;padding:24px}
    h1{font-size:1.4rem;font-weight:700;margin-bottom:24px;color:#fff}
    h1 span{font-size:.75rem;font-weight:400;color:#64748b;margin-left:8px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px}
    .card{background:#12121f;border:1px solid #1e1e3a;border-radius:12px;padding:20px}
    .card-label{font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:8px}
    .card-value{font-size:2rem;font-weight:800;line-height:1}
    .card-sub{font-size:.75rem;color:#64748b;margin-top:6px}
    table{width:100%;border-collapse:collapse;background:#12121f;border-radius:12px;overflow:hidden;border:1px solid #1e1e3a}
    th{font-size:.7rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#64748b;padding:10px 14px;text-align:left;border-bottom:1px solid #1e1e3a}
    td{padding:10px 14px;font-size:.82rem;border-bottom:1px solid #1a1a2e}
    tr:last-child td{border:none}
    .badge{display:inline-block;padding:2px 8px;border-radius:50px;font-size:.68rem;font-weight:700}
    .ok{background:rgba(34,197,94,.15);color:#22c55e}
    .warn{background:rgba(245,158,11,.15);color:#f59e0b}
    .err{background:rgba(239,68,68,.15);color:#ef4444}
    .section{margin-bottom:24px}
    .section h2{font-size:.85rem;font-weight:700;color:#94a3b8;margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em}
    .note{font-size:.7rem;color:#475569;margin-top:12px;text-align:right}
  </style>
</head>
<body>
  <h1>MotionVibe Dashboard <span>auto-refresh 30s</span></h1>

  <div class="grid">
    <div class="card">
      <div class="card-label">Uptime</div>
      <div class="card-value" style="font-size:1.4rem;color:#a78bfa">${s.uptimeHuman}</div>
    </div>
    <div class="card">
      <div class="card-label">Total Requests</div>
      <div class="card-value">${s.requests.total.toLocaleString()}</div>
      <div class="card-sub">2xx: ${s.requests.byStatus['2xx']} &nbsp; 4xx: ${s.requests.byStatus['4xx']} &nbsp; 5xx: ${s.requests.byStatus['5xx']}</div>
    </div>
    <div class="card">
      <div class="card-label">Error Rate (5min)</div>
      <div class="card-value" style="color:${rateColor}">${s.errors.rate}</div>
      <div class="card-sub">${s.errors.count} errors / ${s.responseTime.samples} requests</div>
    </div>
    <div class="card">
      <div class="card-label">Avg Response (5min)</div>
      <div class="card-value">${s.responseTime.avg}<span style="font-size:1rem;color:#64748b">ms</span></div>
      <div class="card-sub">p50: ${s.responseTime.p50}ms &nbsp; p95: ${s.responseTime.p95}ms &nbsp; p99: ${s.responseTime.p99}ms</div>
    </div>
    <div class="card">
      <div class="card-label">Heap Memory</div>
      <div class="card-value" style="color:${heapColor}">${s.memory.heapPercent}%</div>
      <div class="card-sub">${s.memory.heapUsedMB} / ${s.memory.heapTotalMB} MB &nbsp;·&nbsp; RSS ${s.memory.rssMB} MB</div>
    </div>
  </div>

  ${s.errors.recent.length ? `
  <div class="section">
    <h2>Recent Errors</h2>
    <table>
      <thead><tr><th>Time</th><th>Status</th><th>Path</th><th>Req ID</th></tr></thead>
      <tbody>
        ${s.errors.recent.map(e => `
        <tr>
          <td>${e.time.replace('T',' ').slice(0,19)}</td>
          <td><span class="badge ${e.status >= 500 ? 'err' : 'warn'}">${e.status}</span></td>
          <td>${e.path}</td>
          <td style="font-family:monospace;color:#64748b">${e.reqId}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <p class="note">Generated ${new Date().toISOString()}</p>
</body>
</html>`);
});

module.exports = router;
