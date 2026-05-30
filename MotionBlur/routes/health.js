'use strict';
const express     = require('express');
const nodemailer  = require('nodemailer');
const os          = require('os');
const fs          = require('fs');
const path        = require('path');
const router      = express.Router();
const { getStats } = require('../utils/metrics');

// ── SMTP transporter for verify() check ──────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST || 'smtp.gmail.com',
  port:   Number(process.env.MAIL_PORT) || 587,
  auth:   { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  connectionTimeout: 4_000,
  socketTimeout:     4_000,
});

// ── Individual service checks ─────────────────────────────

async function checkSMTP() {
  const start = Date.now();
  try {
    await transporter.verify();
    return { status: 'ok', latencyMs: Date.now() - start };
  } catch (err) {
    return { status: 'error', latencyMs: Date.now() - start, error: err.message };
  }
}

function checkMemory() {
  const mem         = process.memoryUsage();
  const heapPercent = mem.heapUsed / mem.heapTotal * 100;
  return {
    status:      heapPercent > 90 ? 'warn' : 'ok',
    heapUsedMB:  (mem.heapUsed  / 1024 / 1024).toFixed(1),
    heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(1),
    heapPercent: heapPercent.toFixed(1),
    rssMB:       (mem.rss / 1024 / 1024).toFixed(1),
  };
}

function checkDisk() {
  const logDir = path.join(__dirname, '..', 'logs');
  try {
    fs.accessSync(logDir, fs.constants.W_OK);
    const files   = fs.readdirSync(logDir);
    const totalKB = files.reduce((sum, f) => {
      try { return sum + fs.statSync(path.join(logDir, f)).size; } catch { return sum; }
    }, 0) / 1024;
    return { status: 'ok', logDirWritable: true, logsSizeKB: Math.round(totalKB) };
  } catch (err) {
    return { status: 'error', logDirWritable: false, error: err.message };
  }
}

function checkProcess() {
  return {
    status:     'ok',
    pid:        process.pid,
    nodeVersion: process.version,
    platform:   process.platform,
    loadAvg:    os.loadavg().map(v => v.toFixed(2)),
    freeMB:     (os.freemem() / 1024 / 1024).toFixed(0),
    totalMB:    (os.totalmem() / 1024 / 1024).toFixed(0),
  };
}

// ── GET /api/health ───────────────────────────────────────
// Full check — includes SMTP verification (takes 100-500ms)
router.get('/', async (_req, res) => {
  const [smtp] = await Promise.all([checkSMTP()]);

  const memory  = checkMemory();
  const disk    = checkDisk();
  const proc    = checkProcess();
  const metrics = getStats();

  const allOk = smtp.status === 'ok' && memory.status === 'ok' && disk.status === 'ok';

  res.status(allOk ? 200 : 503).json({
    status:  allOk ? 'ok' : 'degraded',
    ts:      new Date().toISOString(),
    uptime:  metrics.uptimeHuman,
    checks: { smtp, memory, disk, process: proc },
    metrics: {
      requests:     metrics.requests,
      errorRate:    metrics.errors.rate,
      responseTime: metrics.responseTime,
    },
  });
});

// ── GET /api/health/ping ──────────────────────────────────
// Lightweight liveness probe — no SMTP check, responds in < 1ms
router.get('/ping', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

module.exports = router;
