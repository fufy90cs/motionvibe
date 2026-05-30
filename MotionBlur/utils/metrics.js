'use strict';
const log = require('./logger');

// ── Config ────────────────────────────────────────────────
const WINDOW_MS       = 5  * 60 * 1000;  // sliding window for rate calculations
const MAX_RT_SAMPLES  = 2000;             // max response-time samples kept in memory
const ERROR_THRESHOLD = 20;              // alert when error rate exceeds 20%
const MIN_REQUESTS    = 10;              // minimum requests before checking threshold
const ALERT_COOLDOWN  = 30 * 60 * 1000; // max 1 threshold alert per 30 minutes

// ── State ─────────────────────────────────────────────────
const state = {
  startedAt:     Date.now(),
  total:         0,
  byStatus:      { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
  responseTimes: [],   // [{ ts, ms, path }]
  recentErrors:  [],   // [{ ts, status, path, reqId }]
  lastAlertAt:   0,
};

// ── Record a completed request ────────────────────────────
function record({ statusCode, ms, path, reqId }) {
  const now    = Date.now();
  const bucket = `${Math.floor(statusCode / 100)}xx`;

  state.total++;
  if (bucket in state.byStatus) state.byStatus[bucket]++;

  // Response-time ring buffer
  state.responseTimes.push({ ts: now, ms, path });
  if (state.responseTimes.length > MAX_RT_SAMPLES) state.responseTimes.shift();

  // Error tracking
  if (statusCode >= 400) {
    state.recentErrors.push({ ts: now, status: statusCode, path, reqId: reqId || '?' });
  }

  // Purge entries outside the sliding window
  const cutoff = now - WINDOW_MS;
  state.recentErrors  = state.recentErrors.filter(e => e.ts > cutoff);

  // Error-rate threshold check
  checkThreshold();
}

// ── Percentile helper ─────────────────────────────────────
function percentile(sorted, p) {
  if (!sorted.length) return 0;
  return sorted[Math.max(0, Math.floor(sorted.length * p) - 1)];
}

// ── Build current stats snapshot ─────────────────────────
function getStats() {
  const now    = Date.now();
  const cutoff = now - WINDOW_MS;

  const windowTimes  = state.responseTimes.filter(r => r.ts > cutoff).map(r => r.ms).sort((a, b) => a - b);
  const windowErrors = state.recentErrors.filter(e => e.ts > cutoff);
  const windowReqs   = windowTimes.length;

  const avg    = windowReqs ? Math.round(windowTimes.reduce((s, v) => s + v, 0) / windowReqs) : 0;
  const errorRate = windowReqs ? ((windowErrors.length / windowReqs) * 100).toFixed(1) : '0.0';

  const mem = process.memoryUsage();

  return {
    uptime:       Math.floor((now - state.startedAt) / 1000),
    uptimeHuman:  formatUptime(now - state.startedAt),
    requests: {
      total:   state.total,
      byStatus: state.byStatus,
    },
    responseTime: {
      windowMin:  '5min',
      samples:    windowReqs,
      avg,
      p50:        percentile(windowTimes, 0.50),
      p95:        percentile(windowTimes, 0.95),
      p99:        percentile(windowTimes, 0.99),
    },
    errors: {
      windowMin:  '5min',
      count:      windowErrors.length,
      rate:       `${errorRate}%`,
      recent:     windowErrors.slice(-10).map(({ ts, status, path, reqId }) => ({
        time: new Date(ts).toISOString(), status, path, reqId,
      })),
    },
    memory: {
      heapUsedMB:  (mem.heapUsed  / 1024 / 1024).toFixed(1),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(1),
      rssMB:       (mem.rss       / 1024 / 1024).toFixed(1),
      heapPercent: (mem.heapUsed  / mem.heapTotal * 100).toFixed(1),
    },
  };
}

// ── Error-rate threshold alerting ────────────────────────
function checkThreshold() {
  const now    = Date.now();
  const cutoff = now - WINDOW_MS;

  const windowReqs   = state.responseTimes.filter(r => r.ts > cutoff).length;
  const windowErrors = state.recentErrors.filter(e => e.ts > cutoff).length;

  if (windowReqs < MIN_REQUESTS) return;

  const rate = (windowErrors / windowReqs) * 100;
  if (rate < ERROR_THRESHOLD) return;
  if (now - state.lastAlertAt < ALERT_COOLDOWN) return;

  state.lastAlertAt = now;
  log.critical('ERROR_RATE_THRESHOLD', {
    rate:        `${rate.toFixed(1)}%`,
    threshold:   `${ERROR_THRESHOLD}%`,
    errors:      windowErrors,
    requests:    windowReqs,
    windowMin:   '5min',
  });
}

// ── Uptime formatter ──────────────────────────────────────
function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s % 60}s`;
}

module.exports = { record, getStats };
