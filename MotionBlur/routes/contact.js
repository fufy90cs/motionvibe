'use strict';
const express    = require('express');
const nodemailer = require('nodemailer');
const router     = express.Router();
const log        = require('../utils/logger');
const { insertContact, markMailSent, markMailFailed } = require('../utils/db');
const events = require('../utils/events');

// ── Constants ─────────────────────────────────────────────
const TIMING = {
  MIN_MS: 3_000,       // form must be open at least 3 seconds
  MAX_MS: 7_200_000,   // reject stale submissions older than 2 hours
};

const FIELD_LIMITS = { ime: 100, email: 200, telefon: 30, usluga: 100, poruka: 3_000 };

const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE  = /^[0-9 +\-().]{0,30}$/;

// ── Nodemailer transporter ────────────────────────────────
// pool:true reuses SMTP connections — avoids 100-200ms reconnect per send
const transporter = nodemailer.createTransport({
  host:              process.env.MAIL_HOST || 'smtp.gmail.com',
  port:              Number(process.env.MAIL_PORT) || 587,
  secure:            process.env.MAIL_SECURE === 'true',
  auth:              { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  pool:              true,
  maxConnections:    3,
  connectionTimeout: 5_000,
  socketTimeout:     10_000,
});

// ── Helpers ───────────────────────────────────────────────

function esc(val) {
  if (val == null) return '';
  return String(val)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function trimFields(body) {
  return {
    ime:     body.ime?.trim()     || '',
    email:   body.email?.trim()   || '',
    telefon: body.telefon?.trim() || '',
    usluga:  body.usluga?.trim()  || '',
    poruka:  body.poruka?.trim()  || '',
  };
}

// Returns an error string or null if valid
function validateFields({ ime, email, telefon, usluga, poruka }) {
  if (!ime || !email || !poruka)
    return 'Molimo popunite sva obavezna polja.';

  for (const [field, max] of Object.entries(FIELD_LIMITS)) {
    if ({ ime, email, telefon, usluga, poruka }[field].length > max)
      return `Polje ${field} je previše dugo.`;
  }

  if (!EMAIL_RE.test(email))
    return 'Email adresa nije ispravna.';

  if (telefon && !PHONE_RE.test(telefon))
    return 'Broj telefona nije ispravan.';

  return null;
}

function buildAdminEmail({ sIme, sEmail, sTelefon, sUsluga, sPoruka }) {
  const optionalRows = [
    sTelefon ? `<tr><td style="padding:8px 0;color:#666">Telefon</td><td style="padding:8px 0;font-weight:600">${sTelefon}</td></tr>` : '',
    sUsluga  ? `<tr><td style="padding:8px 0;color:#666">Usluga</td><td style="padding:8px 0;font-weight:600">${sUsluga}</td></tr>`  : '',
  ].join('');

  return `
    <div style="font-family:Inter,sans-serif;max-width:560px;color:#1a1a1a">
      <h2 style="margin:0 0 20px;color:#0A0907">Novi upit s MotionVibe sajta</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#666;width:110px">Ime</td><td style="padding:8px 0;font-weight:600">${sIme}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0;font-weight:600"><a href="mailto:${sEmail}">${sEmail}</a></td></tr>
        ${optionalRows}
      </table>
      <div style="margin-top:20px;padding:16px;background:#f5f5f5;border-radius:8px">
        <p style="margin:0;color:#333;white-space:pre-line">${sPoruka}</p>
      </div>
      <p style="margin-top:24px;font-size:12px;color:#999">Poslano s motionvibe.ba — ${new Date().toLocaleString('bs-BA')}</p>
    </div>`;
}

function buildClientEmail(sIme) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:560px;color:#1a1a1a">
      <h2 style="margin:0 0 16px;color:#0A0907">Hvala, ${sIme}!</h2>
      <p style="color:#444;line-height:1.7">Primili smo vaš upit i javit ćemo vam se u roku od jednog radnog dana.</p>
      <p style="color:#444;line-height:1.7">Ako je hitno, slobodno nas kontaktirajte direktno na Viberu ili WhatsAppu.</p>
      <p style="margin-top:28px;color:#999;font-size:13px">— Tim MotionVibe</p>
    </div>`;
}

// ── POST /api/contact ─────────────────────────────────────
router.post('/', async (req, res) => {
  const ip = req.ip || 'unknown';
  const ua = (req.headers['user-agent'] || '').slice(0, 120);

  // 1. Honeypot — bots fill this; silently pretend success
  if (req.body._hp) {
    log.security('HONEYPOT_TRIGGERED', { ip, ua });
    return res.json({ ok: true, message: 'Poruka je uspješno poslana!' });
  }

  // 2. Timing — blocks instant-submit bots
  const age = Date.now() - parseInt(req.body._ts || '0', 10);
  if (isNaN(age) || age < TIMING.MIN_MS || age > TIMING.MAX_MS) {
    log.security('TIMING_VIOLATION', { ip, ua, age: isNaN(age) ? 'NaN' : age });
    return res.status(400).json({ ok: false, error: 'Greška pri slanju. Osvježite stranicu i pokušajte ponovo.' });
  }

  // 3. Origin — must come from own domain in production
  const { origin = '', referer = '', host = '' } = req.headers;
  if (process.env.NODE_ENV === 'production' && host && !origin.includes(host) && !referer.includes(host)) {
    log.security('ORIGIN_MISMATCH', { ip, ua, origin, referer, host });
    return res.status(403).json({ ok: false, error: 'Forbidden.' });
  }

  // 4. Validate & sanitize
  const fields = trimFields(req.body);
  const validationError = validateFields(fields);
  if (validationError) {
    log.warn('VALIDATION_FAIL', { ip, error: validationError });
    return res.status(400).json({ ok: false, error: validationError });
  }

  const safe = {
    sIme:     esc(fields.ime),
    sEmail:   esc(fields.email),
    sTelefon: esc(fields.telefon),
    sUsluga:  esc(fields.usluga),
    sPoruka:  esc(fields.poruka),
  };

  // 5. Save to database — before sending email so nothing is lost if SMTP fails
  let contactId;
  try {
    const row = insertContact.run({
      ip:      ip,
      ime:     fields.ime,
      email:   fields.email,
      telefon: fields.telefon,
      usluga:  fields.usluga,
      poruka:  fields.poruka,
    });
    contactId = row.lastInsertRowid;
    log.info('CONTACT_SAVED', { ip, id: contactId, usluga: fields.usluga || 'none' });
    events.emit('new_contact', {
      id:         contactId,
      ime:        fields.ime,
      usluga:     fields.usluga || '—',
      created_at: new Date().toISOString(),
    });
  } catch (dbErr) {
    log.error('DB_INSERT_FAIL', { ip, msg: dbErr.message });
    // Continue anyway — email still gets sent even if DB write fails
  }

  // 6. Respond immediately — don't block on SMTP latency
  res.json({ ok: true, message: 'Poruka je uspješno poslana!' });

  // Send both emails in parallel — non-blocking after response
  const adminMail = {
    from:    `"MotionVibe Kontakt" <${process.env.MAIL_USER}>`,
    to:      process.env.MAIL_TO || process.env.MAIL_USER,
    replyTo: fields.email,
    subject: `Novi upit od ${safe.sIme}`,
    html:    buildAdminEmail(safe),
  };
  const clientMail = {
    from:    `"MotionVibe" <${process.env.MAIL_USER}>`,
    to:      fields.email,
    subject: 'Primili smo vaš upit — MotionVibe',
    html:    buildClientEmail(safe.sIme),
  };

  Promise.all([
    transporter.sendMail(adminMail),
    transporter.sendMail(clientMail),
  ])
    .then(() => {
      log.info('MAIL_SENT', { ip, id: contactId, usluga: safe.sUsluga || 'none' });
      if (contactId) markMailSent.run(contactId);
    })
    .catch(err => {
      log.error('MAIL_ERROR', { ip, id: contactId, msg: err.message });
      if (contactId) markMailFailed.run(err.message.slice(0, 200), contactId);
    });
});

module.exports = router;
