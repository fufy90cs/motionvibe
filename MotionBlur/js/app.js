'use strict';

// ── GLOBAL FRONTEND ERROR HANDLER ────────────────────────
// Catches unhandled JS errors and reports them to the server.
// Uses sendBeacon (fire-and-forget, works during page unload).
// Skipped on localhost so dev console stays clean.
(function () {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  function report(data) {
    const payload = JSON.stringify({ ...data, url: location.href, ua: navigator.userAgent.slice(0, 120) });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/client-error', new Blob([payload], { type: 'application/json' }));
    }
  }

  // Uncaught synchronous errors
  window.onerror = (msg, src, line, col, err) => {
    report({ type: 'uncaught', msg: String(msg).slice(0, 300), src: String(src).slice(0, 200), line, col, stack: err?.stack?.slice(0, 600) });
    return false; // don't suppress browser's own error
  };

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', e => {
    report({ type: 'promise', msg: String(e.reason).slice(0, 300), stack: e.reason?.stack?.slice(0, 600) });
  });
})();

// ── TICKER ────────────────────────────────────────────────
(function () {
  const track = document.getElementById('tickerTrack');
  if (!track) return;

  function init() {
    const origHTML  = track.innerHTML;
    const origWidth = track.scrollWidth;
    if (!origWidth) return;

    // How many copies needed so first half ≥ viewport width
    const vw     = window.innerWidth;
    const copies = Math.max(Math.ceil(vw * 2 / origWidth), 2);
    // Must be even so -50% lands on an identical pattern boundary
    const total  = copies % 2 === 0 ? copies : copies + 1;

    let extra = '';
    for (let i = 1; i < total; i++) extra += origHTML;
    track.insertAdjacentHTML('beforeend', extra);

    // Speed: 160 px/s → duration = (totalWidth / 2) / 160
    const duration = ((track.scrollWidth / 2) / 55).toFixed(2);
    track.style.animation = `tickerRoll ${duration}s linear infinite`;
  }

  // Wait for fonts so letter widths are accurate
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    requestAnimationFrame(init);
  });
})();

// ── NAV ──────────────────────────────────────────────────
const nav = document.getElementById('nav');

// ── HAMBURGER / MOBILE NAV ─────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobNav    = document.getElementById('mobNav');

hamburger?.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobNav?.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
// Mobile accordion — Usluge / Suradnje
mobNav?.querySelectorAll('.mob-acc-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const body    = btn.nextElementSibling;
    const isOpen  = body.classList.contains('open');
    // Close all others
    mobNav.querySelectorAll('.mob-acc-body.open').forEach(b => {
      b.classList.remove('open');
      b.previousElementSibling.setAttribute('aria-expanded','false');
    });
    if (!isOpen) {
      body.classList.add('open');
      btn.setAttribute('aria-expanded','true');
    }
  });
});

mobNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  hamburger?.classList.remove('open');
  mobNav?.classList.remove('open');
  document.body.style.overflow = '';
}));

// ── DROPDOWN TOGGLE (click — keyboard + touch) ─────────────
document.querySelectorAll('.nav-item').forEach(item => {
  const btn = item.querySelector('.nav-drop-btn');
  btn?.addEventListener('click', e => {
    e.stopPropagation();
    const wasOpen = item.classList.contains('open');
    closeAllDrops();
    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

function closeAllDrops() {
  document.querySelectorAll('.nav-item.open').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.nav-drop-btn')?.setAttribute('aria-expanded', 'false');
  });
}

document.addEventListener('click', closeAllDrops);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllDrops(); });

// ── EXTRAS MODAL ───────────────────────────────────────────
const EXTRAS = {
  'email-marketing': {
    title: 'Email marketing',
    body: 'Integriramo Mailchimp, Brevo ili slične alate direktno u vaš sajt. Posjetioci se pretplaćuju na newsletter kroz formu, a vi šaljete automatske kampanje — dobrodošlica novim pretplatnicima, sezonske ponude, popusti. Sve se dešava automatski, bez ručnog rada. Svaki email je dizajniran u vašim bojama i izgledá profesionalno.'
  },
  'whatsapp': {
    title: 'WhatsApp widget',
    body: 'Plutajuće dugme u uglu ekrana koje jednim klikom otvara WhatsApp razgovor s vašim brojem. Posjetioci vam pišu direktno iz sajta — bez traženja broja, bez kopiranja. Možete postaviti i automatsku poruku dobrodošlice. Idealno za brzu komunikaciju s klijentima i odmah povećava broj upita.'
  },
  'push': {
    title: 'Push obavještenja',
    body: 'Korisnici koji posjete vaš sajt mogu pristati da primaju push notifikacije — male poruke koje se pojavljuju na ekranu čak i kad sajt nije otvoren. Koristite za obavještenja o novim artiklima, popustima, važnim vijestima ili novim terminima. Dosegne korisnike direktno, bez emaila i bez reklama.'
  },
  'booking': {
    title: 'Booking sistem',
    body: 'Online sistem za rezervacije dostupan 24/7. Klijenti biraju datum i termin iz vašeg rasporeda, dobivaju automatsku potvrdu emailom i SMS podsjetnikom dan prije. Integrira se s Google Kalendarom svakog zaposlenika. Smanjuje no-showove do 45% i eliminiše telefonske pozive za rezervacije.'
  },
  'placanje': {
    title: 'Online plaćanje',
    body: 'Primajte uplate direktno s weba putem Stripe-a, PayPala, bankovnih kartica ili lokalne banke. Sigurno, automatizirano i bez posrednika. Idealno za e-commerce, plaćanje usluga unaprijed, rezervacije s depozitom ili pretplatne pakete. Klijent plati — vi dobijete obavještenje.'
  },
  'loyalty': {
    title: 'Loyalty program',
    body: 'Sistem bodova za vjerne kupce — za svaku kupovinu ili posjet korisnik skuplja bodove koje može zamijeniti za popust ili nagradu. Povećava ponovne kupovine, gradi zajednicu oko vašeg brenda i daje razlog klijentima da se vrate. Svi podaci su vidljivi u admin panelu.'
  },
  'pdf': {
    title: 'PDF generator',
    body: 'Automatska izrada PDF dokumenata direktno s weba — ponude, fakture, ugovori, potvrde rezervacije. Klijent popuni formu i instantno dobiva profesionalno oblikovan PDF na email. Štedi sate ručnog rada, eliminiše greške i ostavlja daleko profesionalniji dojam kod klijenata.'
  },
  'visejezicni': {
    title: 'Višejezični sajt',
    body: 'Vaš sajt dostupan na bosanskom, engleskom, njemačkom ili bilo kom drugom jeziku. Svaki jezik ima vlastiti URL (npr. /de/, /en/) i posebnu SEO optimizaciju za to tržište. Internacionalni klijenti kupuju 70% više kada im se obrátite na maternjem jeziku. Idealno za biznise s inozemnim klijentima i turiste.'
  },
  'recenzije': {
    title: 'Sistem recenzija',
    body: 'Automatski prikaz vaših Google ili Facebook recenzija na sajtu, uvijek ažuriran. Ili custom sistem gdje klijenti ostavljaju recenzije direktno na vašem sajtu s ocjenom i fotografijom. 93% kupaca čita recenzije prije odluke. Prikaz pravih recenzija gradi povjerenje kod novih posjetilaca bolje od bilo koje reklame.'
  },
  'analytics': {
    title: 'Analytics dashboard',
    body: 'Posebna admin stranica gdje vidite ko posjećuje vaš sajt, odakle dolaze, koje stranice gledaju, koliko dugo ostaju i šta rade. Integrira Google Analytics i Search Console u jedan pregledan prikaz koji razumijete bez tehničkog znanja. Donosite odluke na osnovu podataka, ne nagađanja.'
  },
  'webshop': {
    title: 'Web shop',
    body: 'Kompletna online prodavnica — dodavanje proizvoda, kategorije, filteri, košarica, checkout, upravljanje narudžbama i zalihama. Integracija s lokalnim kuririma i opcija plaćanja pouzećem, karticom ili virmanom. Vaš biznis prodaje 24/7, čak i kad spavate.'
  },
  'blog': {
    title: 'Blog & CMS',
    body: 'Sistem za upravljanje sadržajem koji vam omogućava da sami objavljujete tekstove, vijesti i članke bez ikakvog tehničkog znanja — kao pisanje u Wordu. Svaki blog post je automatski SEO optimiziran i pomaže sajtu da bolje rangira na Googleu za ključne pojmove iz vaše industrije.'
  },
  'portal': {
    title: 'Korisnički portal',
    body: 'Privatna zona na sajtu dostupna samo registriranim korisnicima. Svaki klijent ima svoj profil, historiju narudžbi ili rezervacija, važne dokumente i komunikaciju s vama. Digitalizira odnos s klijentima, smanjuje broj upita i daje premium iskustvo koje vas razlikuje od konkurencije.'
  },
  'gdpr': {
    title: 'GDPR & Cookie consent',
    body: 'Profesionalni cookie consent banner i kompletna GDPR usklađenost — politika privatnosti, upravljanje kolačićima po kategorijama, sigurno prikupljanje i čuvanje podataka putem formi. Obavezno za svaki sajt koji posluje s EU korisnicima. Štiti vas od kazni koje mogu ići do 4% godišnjeg prihoda.'
  },
  'video': {
    title: 'Video sekcije',
    body: 'Hero sekcija s pozadinskim videom koji odmah privlači pažnju, embedded YouTube ili Vimeo videi koji prikazuju vaš rad, ili autoplay showcasevi prostora i proizvoda. Video povećava prosječno vrijeme na sajtu za 88% i smanjuje bounce rate — posjetioci ostaju duže i bolje razumiju šta nudite.'
  },
  'livechat': {
    title: 'Live chat podrška',
    body: 'Real-time chat widget koji vam omogućava da razgovarate s posjetiocima dok su na sajtu. Dobijate notifikaciju na mobilu i možete odmah odgovoriti. Sajt s live chatom konvertuje do 3× bolje od onih bez njega. Integriše se s popularnim alatima kao što su Tidio, Crisp ili Intercom.'
  }
};

(function () {
  const modal   = document.getElementById('extraModal');
  const emTitle = document.getElementById('emTitle');
  const emBody  = document.getElementById('emBody');
  const emIcon  = document.getElementById('emIcon');
  const emClose = document.getElementById('emClose');
  if (!modal) return;

  function openExtra(item) {
    const key  = item.dataset.extra;
    const data = EXTRAS[key];
    if (!data) return;
    emTitle.textContent = data.title;
    emBody.textContent  = data.body;
    emIcon.innerHTML    = item.querySelector('.extra-icon').innerHTML;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    emClose.focus();
  }

  function closeExtra() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.extra-item').forEach(item => {
    item.addEventListener('click', () => openExtra(item));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openExtra(item); } });
  });

  emClose.addEventListener('click', closeExtra);
  modal.querySelector('.em-overlay').addEventListener('click', closeExtra);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeExtra(); });

  document.getElementById('emCta')?.addEventListener('click', closeExtra);
})();

// ── REEL LIGHTBOX ─────────────────────────────────────────
(function () {
  const lbox  = document.getElementById('lbox');
  const frame = document.getElementById('lboxFrame');
  const close = document.getElementById('lboxClose');
  if (!lbox) return;

  function open(mockEl) {
    const lpm = mockEl.querySelector('.lpm');
    if (!lpm) return;

    // Build laptop shell with cloned mockup inside
    const shell  = document.createElement('div');
    shell.className = 'lbox-laptop';

    const screen = document.createElement('div');
    screen.className = 'lbox-laptop-screen';
    screen.appendChild(lpm.cloneNode(true));

    const base = document.createElement('div');
    base.className = 'lbox-laptop-base';

    shell.appendChild(screen);
    shell.appendChild(base);

    // Scale to fit viewport (natural size: 292 × 192px)
    const scale = Math.min(
      (window.innerWidth  * 0.86) / 292,
      (window.innerHeight * 0.80) / 192
    );
    shell.style.setProperty('--lbox-scale', scale);

    frame.innerHTML = '';
    frame.appendChild(shell);
    lbox.classList.add('is-open');
    lbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function shut() {
    lbox.classList.remove('is-open');
    lbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    frame.innerHTML = '';
  }

  document.querySelector('.reel-sec').addEventListener('click', e => {
    const mock = e.target.closest('.lp--mock');
    if (mock && mock.getAttribute('tabindex') !== '-1') open(mock);
  });
  document.querySelector('.reel-sec').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const mock = e.target.closest('.lp--mock');
      if (mock && mock.getAttribute('tabindex') !== '-1') { e.preventDefault(); open(mock); }
    }
  });
  close.addEventListener('click', shut);
  lbox.querySelector('.lbox-overlay').addEventListener('click', shut);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lbox.classList.contains('is-open')) shut();
  });
})();

// ── HERO CURSOR GLOW ──────────────────────────────────────
(function () {
  const hero = document.querySelector('.hero');
  if (!hero || matchMedia('(pointer:coarse)').matches) return;
  const glow = document.createElement('div');
  glow.className = 'hero-cursor-glow';
  hero.appendChild(glow);
  let rx = 0, ry = 0, cx = 200, cy = 200;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    cx = e.clientX - r.left;
    cy = e.clientY - r.top;
  });
  (function lerp() {
    rx += (cx - rx) * 0.07;
    ry += (cy - ry) * 0.07;
    glow.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(lerp);
  })();
})();

// ── COUNT-UP ANIMATION (shared) ────────────────────────────
// Used by trust-bar (parses text) and result-num (uses data-target)
function animateCount(el, target, suffix, dur) {
  const t0 = performance.now();
  (function tick(now) {
    const p    = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + (suffix || '');
    if (p < 1) requestAnimationFrame(tick);
  })(performance.now());
}

(function () {
  const bar = document.querySelector('.trust-bar');
  if (!bar) return;
  let fired = false;
  const io = new IntersectionObserver(entries => {
    if (fired || !entries[0].isIntersecting) return;
    fired = true; io.disconnect();
    bar.querySelectorAll('.trust-item strong').forEach(el => {
      const m = el.textContent.trim().match(/^(\d+)(.*)/);
      if (m) animateCount(el, +m[1], m[2], 1400);
    });
  }, { threshold: 0.6 });
  io.observe(bar);
})();

// ── SCROLL ANIMATIONS ─────────────────────────────────────
(function () {
  // stamp delay indices on includes list items
  document.querySelectorAll('.includes-grid li').forEach((li, i) => {
    li.style.setProperty('--i', i);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.includes-sec, .story-chunk').forEach(el => io.observe(el));
})();

// ── CONTACT FORM ───────────────────────────────────────────
(function () {
  // Set timing token the moment the form section becomes visible
  const tsField = document.getElementById('_formTs');
  if (tsField && tsField.value === '0') tsField.value = Date.now().toString();

  const form     = document.getElementById('kontaktForm');
  const btn      = document.getElementById('kfBtn');
  const btnTxt   = btn?.querySelector('.kf-btn-txt');
  const btnSpin  = btn?.querySelector('.kf-btn-spin');
  const feedback = document.getElementById('kfFeedback');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.disabled = true;
    btnTxt.hidden = true;
    btnSpin.hidden = false;
    feedback.hidden = true;
    feedback.className = 'kf-feedback';

    const body = {
      ime:     form.ime.value.trim(),
      email:   form.email.value.trim(),
      telefon: form.telefon?.value.trim() || '',
      usluga:  form.usluga?.value || '',
      poruka:  form.poruka.value.trim(),
      _hp:     form._hp?.value  || '',
      _ts:     form._ts?.value  || '0',
    };

    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      feedback.textContent = data.message || data.error || (res.ok ? 'Poruka poslana!' : 'Greška pri slanju.');
      feedback.classList.add(res.ok && data.ok ? 'ok' : 'err');
      feedback.hidden = false;
      if (res.ok && data.ok) {
        form.reset();
        if (tsField) tsField.value = Date.now().toString();
      }
    } catch {
      feedback.textContent = 'Greška pri slanju. Provjerite konekciju i pokušajte ponovo.';
      feedback.classList.add('err');
      feedback.hidden = false;
    } finally {
      btn.disabled = false;
      btnTxt.hidden = false;
      btnSpin.hidden = true;
    }
  });
})();

// ── SMOOTH SCROLL ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ════════════════════════════════════════════════════════════
//  MOTION EFFECTS
// ════════════════════════════════════════════════════════════

// ── PAGE LOADER ───────────────────────────────────────────
(function () {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const MIN = 1150; // ms — ensure fill animation plays fully
  const t0  = performance.now();

  function dismiss() {
    loader.classList.add('ld-done');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }

  function tryDismiss() {
    const wait = Math.max(0, MIN - (performance.now() - t0));
    setTimeout(dismiss, wait);
  }

  if (document.readyState === 'complete') tryDismiss();
  else window.addEventListener('load', tryDismiss);
})();

// ── PAGE TRANSITIONS ─────────────────────────────────────
(function () {
  const overlay = document.createElement('div');
  overlay.id = 'page-trans';
  document.body.appendChild(overlay);

  // Fade in when arriving via transition
  if (sessionStorage.getItem('pt')) {
    sessionStorage.removeItem('pt');
    overlay.style.transition = 'none';
    overlay.style.opacity    = '1';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.style.transition = '';
      overlay.style.opacity    = '0';
    }));
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:')
        || href.startsWith('tel:') || href.startsWith('viber:')) return;
    if (a.target === '_blank') return;
    try {
      const url = new URL(href, location.href);
      if (url.hostname !== location.hostname) return;
    } catch { return; }

    e.preventDefault();
    sessionStorage.setItem('pt', '1');
    overlay.classList.add('pt-active');
    setTimeout(() => { window.location.href = a.href; }, 330);
  });
})();

// ── SCROLL PROGRESS BAR ──────────────────────────────────
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  // Exposed so the unified scroll handler can update it
  window._scrollBar = bar;
})();

// ── CUSTOM CURSOR ────────────────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;

  const dot  = document.createElement('div');
  dot.className = 'cur-dot';
  const ring = document.createElement('div');
  ring.className = 'cur-ring';
  document.body.append(dot, ring);

  let mx = -200, my = -200, rx = -200, ry = -200;
  let firstMove = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    if (!firstMove) {
      firstMove = true;
      dot.classList.add('vis');
      ring.classList.add('vis');
    }
  });

  // Ring follows with lerp
  (function lerpRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();

  // State changes
  const LINK_SEL = 'a, button, [role=button], .lp--mock, .extra-item, .tfi, .pricing-card, .soc-link, .nav-logo';
  const TEXT_SEL = 'input, select, textarea';

  function updateState(e) {
    const onLink = !!e.target.closest(LINK_SEL);
    const onText = !!e.target.closest(TEXT_SEL);
    dot.classList.toggle('on-link', onLink);
    ring.classList.toggle('on-link', onLink);
    dot.classList.toggle('on-text', onText);
    ring.classList.toggle('on-text', onText);
  }
  document.addEventListener('mouseover', updateState);

  document.addEventListener('mousedown', () => {
    dot.classList.add('clicking');
    ring.classList.add('clicking');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('clicking');
    ring.classList.remove('clicking');
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => {
    if (firstMove) { dot.style.opacity = ''; ring.style.opacity = ''; }
  });
})();

// ── RIPPLE ───────────────────────────────────────────────
(function () {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-yellow, .btn-ghost, .kf-btn, .pc-cta');
    if (!btn) return;
    const r    = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.4;
    const rpl  = document.createElement('span');
    rpl.className = 'rpl';
    rpl.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.appendChild(rpl);
    rpl.addEventListener('animationend', () => rpl.remove());
  });
})();

// ── 3D TILT ──────────────────────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;

  function addTilt(el, maxDeg, scalePx) {
    let rafId, rx = 0, ry = 0, tx = 0, ty = 0, live = false;

    el.addEventListener('mouseenter', () => {
      live = true;
      cancelAnimationFrame(rafId);
      loop();
    });
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      tx =  ((e.clientX - r.left) / r.width  - 0.5) * maxDeg * 2;
      ty = -((e.clientY - r.top)  / r.height - 0.5) * maxDeg * 2;
    });
    el.addEventListener('mouseleave', () => {
      live = false; tx = 0; ty = 0;
    });

    function loop() {
      rx += (tx - rx) * 0.11;
      ry += (ty - ry) * 0.11;
      const settled = !live && Math.abs(rx) < 0.04 && Math.abs(ry) < 0.04;
      if (settled) {
        el.style.transform  = '';
        el.style.transition = '';
        return;
      }
      el.style.transition = live ? '' : 'transform .55s cubic-bezier(.23,1,.32,1)';
      el.style.transform  = `perspective(900px) rotateY(${rx}deg) rotateX(${ry}deg) translateZ(${live ? scalePx : 0}px)`;
      rafId = requestAnimationFrame(loop);
    }
  }

  document.querySelectorAll('.tfi').forEach(el         => addTilt(el, 5, 5));
  document.querySelectorAll('.pricing-card').forEach(el => addTilt(el, 6, 6));
  const browser = document.querySelector('.hv-browser');
  if (browser) addTilt(browser, 4, 4);
})();

// ── MAGNETIC BUTTONS ─────────────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;

  document.querySelectorAll('.hero .btn-yellow, .hero .btn-ghost').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.24;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.24;
      btn.style.transition = 'transform .08s ease, background .2s, box-shadow .2s';
      btn.style.transform  = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .42s cubic-bezier(.23,1,.32,1), background .2s, box-shadow .2s';
      btn.style.transform  = '';
    });
  });
})();

// ── SCROLL REVEALS (tech · pricing · extras · kontakt) ───
(function () {
  // Stamp stagger indices
  document.querySelectorAll('.tfi').forEach((el, i)        => el.style.setProperty('--rv-i', i));
  document.querySelectorAll('.extra-item').forEach((el, i) => el.style.setProperty('--rv-i', i));

  // Pricing cards — manual stagger via transitionDelay
  document.querySelectorAll('.pricing-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 95}ms`;
    // Clear delay after reveal so hover transitions feel instant
    el.addEventListener('transitionend', () => {
      if (el.classList.contains('rv')) el.style.transitionDelay = '';
    }, { once: true });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('rv');
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  [
    '.tech-eyebrow', '.pricing-eyebrow', '.extras-heading', '.extras-sub',
    '.tfi', '.pricing-card', '.extra-item',
    '.kontakt-left', '.kontakt-right',
  ].forEach(sel => document.querySelectorAll(sel).forEach(el => io.observe(el)));
})();

// ── HERO PARALLAX — registered in unified scroll handler ──
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;
  const visual = document.querySelector('.hero-visual');
  const left   = document.querySelector('.hero-left');
  if (!visual || !left) return;
  // Pre-promote layers that get transform on every scroll tick
  visual.style.willChange = 'transform';
  left.style.willChange   = 'transform';
  window._heroParallax = { visual, left };
})();

// ── ANIMATED COUNT-UP (result-num) ────────────────────────
(function () {
  const nums = document.querySelectorAll('.result-num');
  if (!nums.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCount(e.target, parseInt(e.target.dataset.target, 10), '', 1600);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
})();

// ── FAQ ACCORDION ─────────────────────────────────────────
(function () {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const body = item.querySelector('.faq-a');
    if (!btn || !body) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close all
      document.querySelectorAll('.faq-item.open').forEach(o => {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = '0';
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

// ── STICKY CTA — state only, scroll handled below ────────
const _stickyCta = document.getElementById('stickyCta');
let   _stickyDismissed = false;
document.getElementById('stickyClose')?.addEventListener('click', () => {
  _stickyDismissed = true;
  _stickyCta?.classList.remove('show');
});

// ── UNIFIED SCROLL HANDLER ────────────────────────────────
// Single RAF-throttled listener replaces 4 separate scroll listeners.
// Handles: nav shadow, progress bar, hero parallax, sticky CTA.
(function () {
  const progressBar = window._scrollBar;
  const parallax    = window._heroParallax;
  let   ticking     = false;

  function tick() {
    const y   = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    // Nav shadow
    nav?.classList.toggle('scrolled', y > 20);

    // Progress bar — transform:scaleX() (no layout reflow)
    if (progressBar && max > 0) {
      progressBar.style.transform = `scaleX(${y / max})`;
    }

    // Hero parallax — only within hero viewport
    if (parallax && y <= 700) {
      parallax.visual.style.transform = `translateY(${y * 0.045}px)`;
      parallax.left.style.transform   = `translateY(${y * 0.028}px)`;
    } else if (parallax && y > 700) {
      parallax.visual.style.transform = '';
      parallax.left.style.transform   = '';
    }

    // Sticky CTA
    if (_stickyCta && !_stickyDismissed && max > 0) {
      _stickyCta.classList.toggle('show', y / max > 0.25);
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(tick); ticking = true; }
  }, { passive: true });

  tick(); // run once on load for initial state
})();

// ── LIVE FOMO NOTIFICATIONS ───────────────────────────────
(function () {
  const notif = document.getElementById('liveNotif');
  const txt   = document.getElementById('liveNotifTxt');
  if (!notif || !txt) return;

  const messages = [
    'Marko iz Sarajeva upravo zatražio ponudu',
    'Ana iz Mostara pregledava Standard paket',
    'Emir iz Zenice zatražio besplatnu konsultaciju',
    'Mirela iz Tuzle pogledala portfolio',
    'Damir iz Banje Luke upravo popunio kontakt formu',
    'Selma iz Bihaća zatražila ponudu za web shop',
    'Nikola iz Mostara pregledava Premium paket',
    'Lejla iz Sarajeva zatražila besplatnu konsultaciju',
  ];

  let i = 0;
  function show() {
    txt.innerHTML = '<strong>' + messages[i % messages.length] + '</strong>';
    notif.setAttribute('aria-hidden', 'false');
    notif.classList.add('show');
    i++;
    setTimeout(() => {
      notif.classList.remove('show');
      notif.setAttribute('aria-hidden', 'true');
    }, 4200);
  }

  setTimeout(() => {
    show();
    setInterval(show, 22000 + Math.random() * 8000);
  }, 8000);
})();

// ════════════════════════════════════════════════════════════
//  MAXIMUM ART DIRECTION — FINALNI SLOJ
// ════════════════════════════════════════════════════════════

// ── AURORA LIVING BACKGROUND ─────────────────────────────
(function () {
  const bg = document.createElement('div');
  bg.id = 'aurora-bg';
  bg.innerHTML = '<div class="ab ab-1"></div><div class="ab ab-2"></div><div class="ab ab-3"></div><div class="ab ab-4"></div>';
  document.body.prepend(bg);
})();

// ── HERO H1 CHARACTER SPLIT ───────────────────────────────
(function () {
  const h = document.querySelector('.hero-h');
  if (!h || matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  h.style.animation = 'none';
  h.style.opacity   = '1';

  // Group child nodes into lines, split on <br>
  const lines = [];
  let cur = [];
  [...h.childNodes].forEach(node => {
    if (node.nodeType === 1 && node.tagName === 'BR') {
      lines.push(cur); cur = [];
    } else {
      cur.push(node);
    }
  });
  lines.push(cur);

  h.innerHTML = '';
  let ci = 0;

  function addChars(parent, text) {
    text = text.replace(/\s+/g, ' ').trim();
    if (!text) return;
    [...text].forEach(c => {
      const s = document.createElement('span');
      if (c === ' ') {
        s.className = 'sc-sp'; s.textContent = ' ';
      } else {
        s.className = 'sc'; s.textContent = c;
        s.style.setProperty('--ci', ci++);
      }
      parent.appendChild(s);
    });
  }

  lines.forEach(seg => {
    const line = document.createElement('span');
    line.className = 'hero-h-line';
    seg.forEach(node => {
      if (node.nodeType === 3) {
        addChars(line, node.textContent);
      } else if (node.nodeType === 1) {
        const clone = node.cloneNode(false);
        clone.style.display = 'inline';
        [...node.childNodes].forEach(child => {
          if (child.nodeType === 3) addChars(clone, child.textContent);
        });
        line.appendChild(clone);
      }
    });
    h.appendChild(line);
  });
})();

// ── EDITORIAL SECTION NUMBERS ────────────────────────────
(function () {
  const map = [
    ['.tech-wrap',    '01'],
    ['.includes-sec', '02'],
    ['.pricing-sec',  '03'],
    ['.results-sec',  '04'],
    ['.testi-sec',    '05'],
    ['.faq-sec',      '06'],
    ['.kontakt-sec',  '07'],
  ];
  map.forEach(([sel, num]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.position = el.style.position || 'relative';
    const n = document.createElement('span');
    n.className = 'sec-num';
    n.setAttribute('aria-hidden', 'true');
    n.textContent = num;
    el.appendChild(n);
  });
})();

// ── WORD-BY-WORD REVEALS ON SECTION HEADINGS ─────────────
(function () {
  const sels = [
    '.tech-heading',
    '.pricing-heading',
    '.includes-inner h2',
    '.process-heading',
    '.testi-heading',
    '.faq-heading',
    '.results-eyebrow',
  ];

  function splitWords(el) {
    if (el.dataset.ws) return;
    el.dataset.ws = '1';

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(tn => {
      const parts = tn.textContent.split(/(\s+)/);
      const frag  = document.createDocumentFragment();
      parts.forEach(p => {
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else if (p) {
          const s = document.createElement('span');
          s.className = 'wr';
          s.textContent = p;
          frag.appendChild(s);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });

    el.querySelectorAll('.wr').forEach((s, i) => s.style.setProperty('--wi', i));
  }

  const targets = [];
  sels.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    splitWords(el);
    targets.push(el);
  }));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('words-up');
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });

  targets.forEach(el => io.observe(el));
})();

// ── HERO BOTTOM MARQUEE ──────────────────────────────────
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const items = ['Web Dizajn', 'E-Commerce', 'SEO Optimizacija', 'Branding', 'MotionVibe.ba', 'Bosna i Hercegovina', 'Landing Stranice', 'Web Aplikacije'];
  const buildTrack = () => items.map(t =>
    `<span class="hero-marquee-item">${t}<span class="hm-sep"></span></span>`
  ).join('');

  const strip = document.createElement('div');
  strip.className = 'hero-marquee';
  strip.innerHTML = `<div class="hero-marquee-track" id="hmTrack">${buildTrack()}${buildTrack()}</div>`;
  hero.appendChild(strip);
})();

// ── EXTENDED MAGNETIC BUTTONS ────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;

  document.querySelectorAll('.btn-yellow:not(.hero .btn-yellow), .pc-cta, .sticky-cta .btn-yellow').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.18;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.18;
      btn.style.transition = 'transform .1s ease, box-shadow .2s, filter .2s';
      btn.style.transform  = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1), box-shadow .2s, filter .2s';
      btn.style.transform  = '';
    });
  });
})();

// ── EXTRAS SECTION — ČAROLIJA ────────────────────────────
(function () {
  const grid = document.querySelector('.extras-grid');
  if (!grid) return;

  // ① Inject count badge next to heading
  const heading = document.querySelector('.extras-heading');
  const sub     = document.querySelector('.extras-sub');
  if (heading && sub) {
    const wrap = document.createElement('div');
    wrap.className = 'extras-header';
    heading.parentNode.insertBefore(wrap, heading);
    wrap.appendChild(heading);
    const badge = document.createElement('div');
    badge.className = 'extras-count-badge';
    badge.innerHTML = '<span>16</span> mogućnosti';
    wrap.appendChild(badge);
  }

  // ② Arrow inject + idle float stagger
  const SPARK_COLORS = ['#BF5FFF','#22D3EE','#EC4899','#A855F7','#F0ABFC'];
  const items = grid.querySelectorAll('.extra-item');

  items.forEach((el, i) => {
    // Arrow
    const arr = document.createElement('span');
    arr.className = 'ei-arrow';
    arr.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    el.appendChild(arr);

    // Idle float stagger
    el.style.setProperty('--fi-del',  (i * 0.22).toFixed(2) + 's');
    el.style.setProperty('--fi-dur',  (4.5 + (i % 5) * 0.4).toFixed(1) + 's');

    // ③ Mouse spotlight
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    });
    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    });

    // ④ Sparkle on mouseenter
    el.addEventListener('mouseenter', () => {
      const count = 5 + Math.floor(Math.random() * 4);
      for (let k = 0; k < count; k++) {
        const s     = document.createElement('span');
        s.className = 'ei-spark';
        const angle = Math.random() * Math.PI * 2;
        const dist  = 22 + Math.random() * 44;
        const size  = 2 + Math.random() * 3;
        const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
        s.style.cssText = [
          `left:${15 + Math.random() * 70}%`,
          `top:${15 + Math.random() * 70}%`,
          `width:${size}px`, `height:${size}px`,
          `color:${color}`, `background:${color}`,
          `--dx:${(Math.cos(angle) * dist).toFixed(1)}px`,
          `--dy:${(Math.sin(angle) * dist).toFixed(1)}px`,
          `animation-delay:${(k * 0.055).toFixed(3)}s`,
        ].join(';');
        el.appendChild(s);
        s.addEventListener('animationend', () => s.remove(), { once: true });
      }
    });
  });
})();

// ── AURORA MOUSE PARALLAX ────────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;
  const ab1 = document.querySelector('.ab-1');
  const ab2 = document.querySelector('.ab-2');
  if (!ab1 || !ab2) return;

  let tx1 = 0, ty1 = 0, tx2 = 0, ty2 = 0;
  let cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0;

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5);
    const ny = (e.clientY / window.innerHeight - 0.5);
    tx1 = nx * 40; ty1 = ny * 30;
    tx2 = nx * -30; ty2 = ny * -20;
  }, { passive: true });

  (function lerp() {
    cx1 += (tx1 - cx1) * 0.04;
    cy1 += (ty1 - cy1) * 0.04;
    cx2 += (tx2 - cx2) * 0.04;
    cy2 += (ty2 - cy2) * 0.04;
    ab1.style.transform = `translate(${cx1}px,${cy1}px)`;
    ab2.style.transform = `translate(${cx2}px,${cy2}px)`;
    requestAnimationFrame(lerp);
  })();
})();

// ════════════════════════════════════════════════════════════
//  FUTURISTIC LIVING BACKGROUND
// ════════════════════════════════════════════════════════════

// ── CANVAS PARTICLE CONSTELLATION ────────────────────────
// Disabled on mobile — saves GPU/CPU on low-power devices
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-field';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  let mx = -2000, my = -2000;

  const COLORS = [
    [191, 95, 255],
    [34, 211, 238],
    [236, 72, 153],
    [220, 230, 255],
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - .5) * .28,
      vy: (Math.random() - .5) * .28,
      r:  .7 + Math.random() * 1.1,
      a:  .12 + Math.random() * .28,
      ba: .12 + Math.random() * .28,
      c,
    };
  }

  function init() {
    resize();
    const N = Math.min(Math.max(Math.floor(W * H / 13000), 55), 130);
    particles = Array.from({ length: N }, makeParticle);
  }

  const MAX_D = 155;

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Lines
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d >= MAX_D) continue;
        const a = (1 - d / MAX_D) * .08;
        ctx.strokeStyle = `rgba(191,95,255,${a})`;
        ctx.lineWidth = .4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    // Particles
    particles.forEach(p => {
      // Mouse pull
      const dx = mx - p.x, dy = my - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 200) {
        const f = (200 - d) / 200 * .014;
        p.vx += dx * f * .08;
        p.vy += dy * f * .08;
        p.a   = Math.min(p.ba + (200 - d) / 200 * .45, .9);
      } else {
        p.a += (p.ba - p.a) * .04;
      }

      // Physics
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > 1.4) { p.vx *= .93; p.vy *= .93; }
      p.vx *= .999; p.vy *= .999;
      p.x  += p.vx;  p.y  += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.fill();

      // Glow halo
      if (p.a > .3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a * .12})`;
        ctx.fill();
      }
    });

    if (!document.hidden) requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); }, { passive: true });
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  window.addEventListener('mouseleave', () => { mx = -2000; my = -2000; });

  // Resume RAF when tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(tick);
  });

  init();
  tick();
})();

// ── HORIZONTAL SCAN LINE ─────────────────────────────────
(function () {
  const line = document.createElement('div');
  line.className = 'scan-line';
  document.body.appendChild(line);
})();

// ── CORNER GEOMETRIC ACCENTS ─────────────────────────────
(function () {
  ['tl', 'tr', 'bl', 'br'].forEach(pos => {
    const c = document.createElement('div');
    c.className = `corner-acc corner-${pos}`;
    document.body.appendChild(c);
  });
})();

// ── SHOOTING STARS ───────────────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;
  function shoot() {
    const star   = document.createElement('div');
    star.className = 'shooting-star';
    const len    = 60 + Math.random() * 120;
    const startX = Math.random() * 75 + 5;
    const startY = Math.random() * 45;
    const angle  = -(15 + Math.random() * 25);
    star.style.cssText =
      `left:${startX}%;top:${startY}%;width:${len}px;--sa:${angle}deg`;
    document.body.appendChild(star);
    star.addEventListener('animationend', () => star.remove(), { once: true });
    setTimeout(shoot, 3500 + Math.random() * 9000);
  }
  setTimeout(shoot, 1800 + Math.random() * 3000);
})();

// ════════════════════════════════════════════════════════════
//  MAGIC LAYER — +1000% HYPE
// ════════════════════════════════════════════════════════════


// ── CURSOR TRAIL SPARKS ───────────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;
  const COLORS = ['#BF5FFF', '#22D3EE', '#EC4899', '#A855F7'];
  let frame = 0;

  document.addEventListener('mousemove', e => {
    if (++frame % 5 !== 0) return;
    const s = document.createElement('div');
    s.className = 'cur-spark';
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    s.style.cssText = [
      `left:${e.clientX}px`, `top:${e.clientY}px`,
      `background:${color}`,
      `box-shadow:0 0 6px ${color}`,
      `--dx:${((Math.random() - .5) * 28).toFixed(1)}px`,
      `--dy:${(-(8 + Math.random() * 18)).toFixed(1)}px`,
    ].join(';');
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove(), { once: true });
  });
})();

// ── RGB GLITCH ON HERO HEADING ────────────────────────────
(function () {
  const h = document.querySelector('.hero-h');
  if (!h || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const baseGlow = '0 0 8px rgba(255,255,255,.9), 0 0 28px rgba(191,95,255,.75), 0 0 70px rgba(191,95,255,.4)';

  function glitch() {
    const r  = 3 + Math.random() * 4;
    const frames = [
      () => { h.style.textShadow = `${r}px 0 rgba(34,211,238,.95), -${r}px 0 rgba(236,72,153,.95), ${baseGlow}`; h.style.transform = `translateX(${r}px) skewX(-.5deg)`; },
      () => { h.style.textShadow = `-${r}px 0 rgba(34,211,238,.95), ${r}px 0 rgba(191,95,255,.95), ${baseGlow}`; h.style.transform = `translateX(-${r}px) skewX(.4deg)`; },
      () => { h.style.textShadow = baseGlow; h.style.transform = ''; },
    ];
    let i = 0;
    const run = () => {
      if (i < frames.length) { frames[i++](); setTimeout(run, 55 + Math.random() * 40); }
      else { h.style.textShadow = ''; h.style.transform = ''; }
    };
    run();
    setTimeout(glitch, 7000 + Math.random() * 11000);
  }
  setTimeout(glitch, 3500 + Math.random() * 3000);
})();

// ── MOUSE SPOTLIGHT ───────────────────────────────────────
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;
  const el = document.createElement('div');
  el.id = 'page-spotlight';
  document.body.appendChild(el);
  let tx = -1000, ty = -1000, cx = -1000, cy = -1000;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function lerp() {
    cx += (tx - cx) * .07; cy += (ty - cy) * .07;
    el.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(lerp);
  })();
})();

// ── SECURITY CARDS — mouse spotlight + reveal ────────────
(function () {
  document.querySelectorAll('.sec-card').forEach((card, i) => {
    card.style.setProperty('--rv-i', i);
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
    });
  });
})();

// ── EXTENDED STAGGER REVEALS ──────────────────────────────
(function () {
  const groups = [
    '.result-card', '.testi-item', '.trust-item', '.process-item', '.faq-item', '.sec-card',
  ];
  groups.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => el.style.setProperty('--rv-i', i));
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('rv');
      io.unobserve(e.target);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

  groups.forEach(sel => document.querySelectorAll(sel).forEach(el => io.observe(el)));
})();

