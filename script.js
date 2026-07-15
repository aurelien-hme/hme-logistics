/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

navBurger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

/* ── HERO CANVAS — PARTICLE FIELD ── */
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrame;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initParticles() {
  particles = [];
  const count = Math.floor((canvas.width * canvas.height) / 38000); // ~70% fewer
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 0.9 + 0.3,
      a: Math.random() * 0.18 + 0.05, // max opacity ~0.23 instead of 0.6
    });
  }
}

let mouseX = -9999, mouseY = -9999;
window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    // Mouse repulsion
    const dx = p.x - mouseX, dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120) {
      const force = (120 - dist) / 120;
      p.x += dx / dist * force * 1.5;
      p.y += dy / dist * force * 1.5;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(216,154,43,${p.a * 0.4})`;
    ctx.fill();

    // Connect nearby — sparser, more transparent
    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const dx2 = p.x - q.x, dy2 = p.y - q.y;
      const d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      if (d < 90) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(216,154,43,${0.025 * (1 - d / 90)})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }
  animFrame = requestAnimationFrame(drawParticles);
}

resize();
initParticles();
drawParticles();
window.addEventListener('resize', () => { resize(); initParticles(); }, { passive: true });

// Stop canvas when hero is out of view
const heroObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) {
    cancelAnimationFrame(animFrame);
  } else {
    drawParticles();
  }
}, { threshold: 0 });
heroObserver.observe(document.getElementById('hero'));

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => {
  if (el.closest('.hero')) {
    el.classList.add('revealed');
  } else {
    revealObserver.observe(el);
  }
});

/* ── COUNTERS ── */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  const isLarge = target > 9999;
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const value = Math.floor(ease * target);
    if (isLarge) {
      el.textContent = (value / 1000000).toFixed(1).replace('.', ',') + ' M+';
    } else {
      el.textContent = value.toLocaleString('fr-FR') + suffix;
    }
    if (progress < 1) requestAnimationFrame(update);
    else {
      if (isLarge) el.textContent = '3 000 000+';
    }
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count || el.dataset.target);
    if (!isNaN(target)) animateCounter(el, target);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count], .counter[data-target]').forEach(el => counterObserver.observe(el));

/* ── PARALLAX ── */
const parallaxEls = document.querySelectorAll('.hero-title, .hero-sub, .hero-badge');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY < window.innerHeight) {
    const factor = scrollY * 0.25;
    parallaxEls.forEach(el => {
      el.style.transform = `translateY(${factor * 0.3}px)`;
    });
    document.querySelector('.hero-gradient').style.transform = `translateY(${factor * 0.1}px)`;
  }
}, { passive: true });

/* ── COMPARATIF TABLE HOVER ── */
const comparatifRows = document.querySelectorAll('.comparatif-col:not(.comparatif-col-header) .comparatif-cell:not(.comparatif-cell-header)');
const headerCells = document.querySelectorAll('.comparatif-col-header .comparatif-cell:not(.comparatif-cell-header)');

document.querySelectorAll('.comparatif-cell:not(.comparatif-cell-header)').forEach((cell, i) => {
  cell.addEventListener('mouseenter', () => {
    const rowIndex = i % 9;
    const allCols = document.querySelectorAll('.comparatif-col');
    allCols.forEach(col => {
      const cells = col.querySelectorAll('.comparatif-cell:not(.comparatif-cell-header)');
      if (cells[rowIndex]) cells[rowIndex].style.background = 'rgba(216,154,43,0.05)';
    });
  });
  cell.addEventListener('mouseleave', () => {
    document.querySelectorAll('.comparatif-cell:not(.comparatif-cell-header)').forEach(c => {
      c.style.background = '';
    });
  });
});

/* ── SMOOTH SCROLL OFFSET ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── MANIFESTE STAGGER ── */
const manifesteItems = document.querySelectorAll('.manifeste-item');
const manifesteObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    manifesteItems.forEach((item, i) => {
      setTimeout(() => item.classList.add('revealed'), i * 120);
    });
    manifesteObserver.disconnect();
  });
}, { threshold: 0.2 });
if (manifesteItems.length) manifesteObserver.observe(manifesteItems[0]);

/* ── STEP PROGRESS ANIMATION ── */
const stepsWrapper = document.querySelector('.steps-wrapper');
if (stepsWrapper) {
  const stepObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.step').forEach((step, i) => {
      setTimeout(() => step.classList.add('revealed'), i * 180);
    });
    stepObserver.disconnect();
  }, { threshold: 0.3 });
  stepObserver.observe(stepsWrapper);
  document.querySelectorAll('.step').forEach(s => s.setAttribute('data-reveal', ''));
}

/* ── GOLD GLOW CURSOR TRAIL ── */
let lastTrailTime = 0;
document.addEventListener('mousemove', e => {
  const now = Date.now();
  if (now - lastTrailTime < 60) return;
  lastTrailTime = now;

  const dot = document.createElement('div');
  dot.style.cssText = `
    position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
    width: 4px; height: 4px; border-radius: 50%;
    background: rgba(216,154,43,0.6);
    pointer-events: none; z-index: 9999;
    transform: translate(-50%,-50%);
    animation: trailFade 0.6s forwards;
  `;
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 600);
});

const trailStyle = document.createElement('style');
trailStyle.textContent = '@keyframes trailFade { to { opacity: 0; transform: translate(-50%,-50%) scale(0); } }';
document.head.appendChild(trailStyle);

/* ── HOME MADE CARD TILT ── */
document.querySelectorAll('.home-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ── RESULTAT CARDS TILT ── */
document.querySelectorAll('.resultat-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ── EXIT INTENT ── */
(function () {
  const overlay   = document.getElementById('exitIntent');
  const closeBtn  = document.getElementById('exitIntentClose');
  const form      = document.getElementById('exitIntentForm');
  const success   = document.getElementById('exitIntentSuccess');
  if (!overlay) return;

  let shown       = false;
  let timeReady   = false;   // 45s elapsed
  let scrollReady = false;   // 50% scrolled

  // Condition check
  function maybeShow() {
    if (!shown && timeReady && scrollReady) triggerPopup();
  }

  // 45-second timer
  setTimeout(() => { timeReady = true; maybeShow(); }, 45000);

  // 50% scroll
  window.addEventListener('scroll', () => {
    if (scrollReady) return;
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    if (scrolled >= 0.5) { scrollReady = true; maybeShow(); }
  }, { passive: true });

  // Mouse leaves viewport (top only — classic exit intent)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0 && timeReady && scrollReady && !shown) triggerPopup();
  });

  function triggerPopup() {
    shown = true;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('ei-visible');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    overlay.classList.remove('ei-visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closePopup(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('#ei-email');
    if (!email.value || !email.validity.valid) {
      email.focus(); return;
    }

    const data = Object.fromEntries(new FormData(form));

    // SIO — créer contact + tag
    try {
      const res = await fetch('/api/sio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createContact', email: data.email, phone: '' })
      });
      const d = await res.json();
      if (d.id) {
        await fetch('/api/sio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addTag', contactId: d.id, tag: 'HME - LEAD EXIT INTENT' })
        });
      }
    } catch(err) {}

    // Notification email → aurelien+HME@famillia.fr
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: 'a35060be-ea69-45cd-a6c4-abd3e2517de3',
          subject: '🎯 Nouveau lead HME — Exit intent',
          from_name: 'HME Site Web',
          replyto: data.email,
          to: 'aurelien+HME@famillia.fr',
          message: [
            '🎯 NOUVEAU LEAD HME — Popup exit intent',
            '',
            `Email     : ${data.email || '—'}`,
            `Site      : ${data.site || '—'}`,
            `CA annuel : ${data.ca || '—'}`,
            `Commandes : ${data.orders || '—'}`,
          ].join('\n')
        })
      });
    } catch(err) {}

    form.hidden = true;
    success.hidden = false;
    setTimeout(closePopup, 3500);
  });
})();

/* ── SYSTEME.IO — CONFIG ── */
const HME_SIO = {
  makeWebhook: '',

  async createContact(email, phone) {
    try {
      const res = await fetch('/api/sio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createContact', email, phone })
      });
      const d = await res.json();
      return d.id || null;
    } catch(e) { console.error('[SIO] createContact', e); return null; }
  },

  async addTag(contactId, tagName) {
    try {
      await fetch('/api/sio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addTag', contactId, tag: tagName })
      });
    } catch(e) { console.error('[SIO] addTag', e); }
  },

  async notifyMake(step, data) {
    if (!this.makeWebhook) return;
    try {
      await fetch(this.makeWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'aurelien+HME@famillia.fr', step, delay: '5 minutes', data })
      });
    } catch(e) { console.error('[SIO] makeWebhook', e); }
  }
};

/* ── AUDIT FORM — ÉTAPE 1 → 2 ── */
(function () {
  const form = document.getElementById('auditForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const emailInput = form.querySelector('#af-email');
    if (!emailInput.value || !emailInput.validity.valid) { emailInput.focus(); return; }

    // Désactiver le bouton pendant le traitement
    const btn = form.querySelector('.audit-submit');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    const data = Object.fromEntries(new FormData(this));
    sessionStorage.setItem('hme_diag_step1', JSON.stringify(data));

    // SIO — créer contact + tag étape 1
    const contactId = await HME_SIO.createContact(data.email, data.tel || '');
    if (contactId) {
      sessionStorage.setItem('hme_sio_id', contactId);
      await HME_SIO.addTag(contactId, 'HME - LEAD SITE WEB 1/2');
    }

    // Notifier Make.com (qui attendra 5 min et enverra l'email)
    await HME_SIO.notifyMake(1, data);

    // Redirect étape 2
    window.location.href = 'diagnostic.html';
  });
})();

/* ── FAQ ACCORDÉON ── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    // Fermer tous les autres
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
    });

    // Ouvrir celui-ci si fermé
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});
