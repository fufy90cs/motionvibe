'use strict';
require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const compression = require('compression');
const path        = require('path');
const { randomUUID } = require('crypto');
const log            = require('./utils/logger');
const { AppError }   = require('./utils/errors');
const metrics        = require('./utils/metrics');

// ── Constants ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const PROD = process.env.NODE_ENV === 'production';

const RATE = {
  GLOBAL_MAX:      300,
  GLOBAL_WINDOW:   15 * 60 * 1000,
  CONTACT_MAX:     5,
  CONTACT_WINDOW:  15 * 60 * 1000,
  BURST_MAX:       2,
  BURST_WINDOW:    60 * 1000,
  CLEANUP_INTERVAL:30 * 60 * 1000,
  CORS_MAX_AGE:    86400,
  UA_MAX_LEN:      120,
};

const REQUIRED_ENV = ['MAIL_USER', 'MAIL_PASS', 'MAIL_TO'];

// ── Helpers ───────────────────────────────────────────────
const getUA    = req => (req.headers['user-agent'] || '').slice(0, RATE.UA_MAX_LEN);
const fmtStack = err => err.stack?.split('\n').slice(0, 4).join(' | ');

// ── Startup validation ────────────────────────────────────
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  log.error('STARTUP', { msg: 'Missing required env vars', missing });
  process.stderr.write(`[FATAL] Missing env vars: ${missing.join(', ')}\n`);
  process.exit(1);
}
log.info('STARTUP', { msg: 'MotionVibe server starting', env: process.env.NODE_ENV || 'development', port: PORT });

// ── App ───────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Gzip all text responses (HTML, CSS, JS, JSON) — 60–80% size reduction
app.use(compression({ level: 6, threshold: 1024 }));

// Request ID — short UUID prefix for log correlation across all entries
app.use((req, _res, next) => {
  req.id = randomUUID().slice(0, 8);
  next();
});

// ── Helmet ────────────────────────────────────────────────
app.use(helmet({
  hidePoweredBy:                true,
  frameguard:                   { action: 'deny' },
  noSniff:                      true,
  xssFilter:                    true,
  dnsPrefetchControl:           { allow: false },
  ieNoOpen:                     true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  crossOriginOpenerPolicy:      { policy: 'same-origin' },
  crossOriginResourcePolicy:    { policy: 'same-origin' },
  originAgentCluster:           true,
  referrerPolicy:               { policy: 'strict-origin-when-cross-origin' },
  hsts: PROD ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'"],
      styleSrc:       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:         ["'self'", 'data:', 'https://cdn.simpleicons.org'],
      connectSrc:     ["'self'"],
      objectSrc:      ["'none'"],
      baseUri:        ["'self'"],
      frameAncestors: ["'none'"],
      formAction:     ["'self'"],
      ...(PROD ? { upgradeInsecureRequests: [] } : {}),
    },
  },
}));

// Permissions-Policy — not yet in helmet v8
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), ' +
    'accelerometer=(), gyroscope=(), magnetometer=(), fullscreen=(self)'
  );
  next();
});

// ── HTTPS redirect ────────────────────────────────────────
app.use((req, res, next) => {
  if (PROD && req.headers['x-forwarded-proto'] === 'http') {
    log.info('HTTPS_REDIRECT', { ip: req.ip, from: req.originalUrl });
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
});

// ── API request logger ────────────────────────────────────
app.use('/api/', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms    = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    log[level]('API_REQUEST', { reqId: req.id, method: req.method, path: req.path, status: res.statusCode, ms, ip: req.ip, ua: getUA(req) });
    metrics.record({ statusCode: res.statusCode, ms, path: req.path, reqId: req.id });
  });
  next();
});

// ── CORS ──────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

app.use('/api/', (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next();

  if (PROD && ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    log.security('CORS_BLOCKED', { ip: req.ip, origin });
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  res.setHeader('Access-Control-Allow-Origin',  origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age',       RATE.CORS_MAX_AGE);
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// ── Block sensitive file paths ────────────────────────────
const SENSITIVE_PATH = /^\/\.env$|^\/server\.js$|^\/routes(\/|$)|^\/package(-lock)?\.json$|^\/node_modules(\/|$)|^\/utils(\/|$)|^\/logs(\/|$)/i;

app.use((req, res, next) => {
  if (SENSITIVE_PATH.test(req.path)) {
    log.security('SENSITIVE_FILE_PROBE', { ip: req.ip, path: req.path, ua: getUA(req) });
    return res.status(403).end();
  }
  next();
});

// ── Body parsing ──────────────────────────────────────────
app.use(express.json(        { limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// ── Rate limiter ──────────────────────────────────────────
const _ipMap = new Map();

function rateLimiter(maxReqs, windowMs, silent = false) {
  return (req, res, next) => {
    const ip  = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${ip}:${windowMs}`;
    const now = Date.now();
    let   rec = _ipMap.get(key);

    if (!rec || now > rec.reset) rec = { count: 0, reset: now + windowMs };
    rec.count++;
    _ipMap.set(key, rec);

    if (rec.count <= maxReqs) return next();

    const retryAfter = Math.ceil((rec.reset - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    log.security('RATE_LIMITED', { ip, path: req.path, count: rec.count, limit: maxReqs, windowMs, silent, ua: getUA(req) });

    if (silent) return res.status(200).json({ ok: true, message: 'Poruka je uspješno poslana!' });
    return res.status(429).json({
      ok: false,
      error: `Previše pokušaja. Pokušajte ponovo za ${Math.ceil(retryAfter / 60)} minuta.`,
    });
  };
}

// Purge expired entries every 30 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of _ipMap) if (now > rec.reset) _ipMap.delete(key);
}, RATE.CLEANUP_INTERVAL);

// ── Bot & browser fingerprint check (API only) ────────────
// Combines UA denylist + Accept header presence into one middleware
const BOT_UA = /curl|wget|python-request|scrapy|mechanize|libwww-perl|go-http-client|java\/|headless|phantom|selenium|puppeteer|playwright|httpclient|okhttp/i;

function rejectBots(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  const ua = getUA(req);
  if (!ua || BOT_UA.test(ua)) {
    log.security('BOT_BLOCKED', { ip: req.ip, path: req.path, ua });
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  if (!req.headers['accept']) {
    log.security('MISSING_ACCEPT', { ip: req.ip, path: req.path, ua });
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }
  next();
}

// ── Mount middleware & routes ─────────────────────────────
app.use(rateLimiter(RATE.GLOBAL_MAX, RATE.GLOBAL_WINDOW));
app.use('/api/', rejectBots);
// Static files — aggressive caching for versioned assets, shorter for HTML
app.use(express.static(path.join(__dirname), {
  maxAge:  '7d',       // CSS, JS, images cached 7 days
  etag:    true,
  lastModified: true,
  setHeaders(res, filePath) {
    // HTML must revalidate — never cache stale markup
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

const adminRoute = require('./routes/admin');
app.use('/api/health',   require('./routes/health'));
app.use('/api/metrics',  require('./routes/metrics'));
app.use('/api/admin',    adminRoute);
app.use('/api/contact',
  rateLimiter(RATE.CONTACT_MAX, RATE.CONTACT_WINDOW),
  rateLimiter(RATE.BURST_MAX,   RATE.BURST_WINDOW, true),
  require('./routes/contact')
);

// ── Frontend error intake ─────────────────────────────────
// Browser reports JS errors here via navigator.sendBeacon
app.post('/api/client-error', express.json({ limit: '4kb' }), (req, res) => {
  const { type, msg, src, line, col, stack } = req.body || {};
  log.warn('CLIENT_JS_ERROR', {
    reqId: req.id,
    ip:    req.ip,
    type:  String(type  || '').slice(0, 40),
    msg:   String(msg   || '').slice(0, 300),
    src:   String(src   || '').slice(0, 200),
    line, col,
    stack: String(stack || '').slice(0, 600),
  });
  res.status(204).end();
});

app.use((_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ── Global error handler ──────────────────────────────────
// Distinguishes operational AppErrors from unexpected programming errors
app.use((err, req, res, _next) => {
  if (err instanceof AppError) {
    // Operational error — expected, log as warn
    log.warn('APP_ERROR', {
      reqId:  req.id,
      status: err.statusCode,
      msg:    err.message,
      ctx:    err.context,
      path:   req.path,
      ip:     req.ip,
    });
    return res.status(err.statusCode).json({ ok: false, error: err.userMessage });
  }

  // Programming error — unexpected, log as critical + trigger alert
  log.critical('UNHANDLED_ERROR', {
    reqId:  req.id,
    msg:    err.message,
    stack:  fmtStack(err),
    path:   req.path,
    method: req.method,
    ip:     req.ip,
  });
  res.status(500).json({ ok: false, error: 'Interna greška servera.' });
});

// ── Process-level error handlers ─────────────────────────
process.on('unhandledRejection', reason => {
  log.critical('UNHANDLED_REJECTION', { reason: String(reason).slice(0, 500) });
});

process.on('uncaughtException', err => {
  log.critical('UNCAUGHT_EXCEPTION', { msg: err.message, stack: fmtStack(err) });
  // Give logger time to flush + send alert before exit
  setTimeout(() => process.exit(1), 500);
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  log.info('STARTUP', { msg: 'Server ready', port: PORT, https: PROD });
  if (!PROD) process.stdout.write(`✅  http://localhost:${PORT}\n`);
  // Start daily DB backup scheduler (first backup fires immediately)
  adminRoute.scheduleDailyBackup();
});
