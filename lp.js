/* ══ LANDING PAGE GOOGLE ADS — qualification à chaud ══ */

/* ── CONFIG ── */
const LP_CONFIG = {
  // Google Ads : à renseigner une fois les actions de conversion créées (ex. 'AW-123456789')
  adsId: 'AW-18543734285',
  // Libellés « send_to » des deux actions (partie après le « / »)
  conversionLead: '',       // tout lead envoyé (secondaire)
  conversionQualified: '',  // lead chaud ou tiède (principal)
  // Lien de prise de RDV proposé aux leads chauds (Calendly, Google Agenda…) — vide = masqué
  bookingUrl: '',
  web3formsKey: 'a35060be-ea69-45cd-a6c4-abd3e2517de3',
  notifyTo: 'aurelien+HME@famillia.fr'
};

/* ── ATTRIBUTION (même stockage que script.js) ── */
const LP_ATTR = (function () {
  const KEY = 'hme_attr';
  const params = new URLSearchParams(window.location.search);
  const fresh = {};
  ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    .forEach(f => { if (params.get(f)) fresh[f] = params.get(f); });
  try {
    if (Object.keys(fresh).length) localStorage.setItem(KEY, JSON.stringify({ ...fresh, ts: Date.now() }));
  } catch (e) {}
  let a = {};
  try { a = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const isAds = !!a.gclid || (a.utm_source === 'google' && a.utm_medium === 'cpc');
  return { data: a, isAds };
})();

/* ── BALISE GOOGLE ADS ── */
if (LP_CONFIG.adsId) {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + LP_CONFIG.adsId;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', LP_CONFIG.adsId);
}

function trackConversion(label) {
  if (!LP_CONFIG.adsId || !label || typeof gtag !== 'function') return;
  gtag('event', 'conversion', { send_to: LP_CONFIG.adsId + '/' + label });
}

/* ── SCORING ── */
function scoreLead(d) {
  const cold = d.ca === '<1M' || d.type_produit === 'Autre' || d.actuel === 'Pas encore lancé';
  if (cold) return 'FROID';
  if (d.timing === 'Immédiatement' || d.timing === 'Sous 3 mois') return 'CHAUD';
  return 'TIEDE';
}

/* ── ENVOIS (Systeme.io, hme-crm, email) ── */
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function sendLead(d, score) {
  const a = LP_ATTR.data;
  const source = LP_ATTR.isAds ? 'Google Ads' : (a.utm_source || 'Direct');
  const lines = [
    `🎯 Lead ${score} — Landing page (${source})`,
    '',
    `Nom         : ${d.nom || '—'}`,
    `Marque      : ${d.marque || '—'}`,
    `Email       : ${d.email || '—'}`,
    `Téléphone   : ${d.tel || '—'}`,
    `Site        : ${d.site || '—'}`,
    `Produits    : ${d.type_produit || '—'}`,
    `CA annuel   : ${d.ca || '—'}`,
    `Commandes   : ${d.commandes || '—'} /mois`,
    `Logistique  : ${d.actuel || '—'}${d.prestataire ? ' (' + d.prestataire + ')' : ''}`,
    `Timing      : ${d.timing || '—'}`,
    '',
    `Acquisition : ${source}`,
    `Campagne    : ${a.utm_campaign || '—'}`,
    `Mot-clé     : ${a.utm_term || '—'}`,
    `GCLID       : ${a.gclid || '—'}`
  ];
  const note = lines.join('\n');

  const sio = (async () => {
    const c = await postJSON('/api/sio', { action: 'createContact', email: d.email, phone: d.tel });
    if (!c.id) return;
    const tags = [
      LP_ATTR.isAds ? 'HME - LEAD GOOGLE ADS' : 'HME - LEAD LANDING PAGE',
      'HME - LEAD ' + score
    ];
    for (const tag of tags) await postJSON('/api/sio', { action: 'addTag', contactId: c.id, tag });
  })();

  const crm = postJSON('/api/sio', { action: 'crmLead', email: d.email, site: d.site || '', note });

  const mail = postJSON('https://api.web3forms.com/submit', {
    access_key: LP_CONFIG.web3formsKey,
    subject: (score === 'CHAUD' ? '🔥 LEAD CHAUD — rappeler dans l\'heure — ' : '🎯 Lead ' + score + ' — ') + (d.marque || d.email),
    from_name: 'HME Landing page',
    replyto: d.email,
    to: LP_CONFIG.notifyTo,
    message: note
  });

  await Promise.allSettled([sio, crm, mail]);
}

/* ── FORMULAIRE MULTI-ÉTAPES ── */
(function () {
  const form = document.getElementById('lpQualif');
  if (!form) return;

  const steps = [...form.querySelectorAll('.lp-step')];
  const nextBtn = document.getElementById('lpNext');
  const backBtn = document.getElementById('lpBack');
  const error = document.getElementById('lpError');
  const label = document.getElementById('lpStepLabel');
  const progress = document.getElementById('lpProgress');
  let current = 0;

  // Sélection visuelle des options
  form.querySelectorAll('.diag-option input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      input.closest('.diag-options').querySelectorAll('.diag-option')
        .forEach(o => o.classList.remove('selected'));
      input.closest('.diag-option').classList.add('selected');
    });
  });

  function show(i) {
    steps.forEach((s, n) => { s.hidden = n !== i; });
    current = i;
    label.textContent = `Étape ${i + 1} sur ${steps.length}`;
    progress.style.width = `${((i + 1) / steps.length) * 100}%`;
    backBtn.hidden = i === 0;
    nextBtn.textContent = i === steps.length - 1 ? 'Recevoir mon étude gratuite →' : 'Continuer →';
    error.hidden = true;
  }

  function stepValid(step) {
    const radios = new Set([...step.querySelectorAll('input[type="radio"][required]')].map(r => r.name));
    for (const name of radios) {
      if (!step.querySelector(`input[name="${name}"]:checked`)) return false;
    }
    return [...step.querySelectorAll('input:not([type="radio"])')].every(i => i.checkValidity());
  }

  backBtn.addEventListener('click', () => show(current - 1));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!stepValid(steps[current])) { error.hidden = false; return; }
    if (current < steps.length - 1) { show(current + 1); return; }

    nextBtn.disabled = true;
    nextBtn.textContent = 'Envoi en cours…';

    const d = Object.fromEntries(new FormData(form));
    const score = scoreLead(d);

    trackConversion(LP_CONFIG.conversionLead);
    if (score !== 'FROID') trackConversion(LP_CONFIG.conversionQualified);

    try { await sendLead(d, score); } catch (err) { console.error('[LP] envoi', err); }

    form.hidden = true;
    label.hidden = true;
    progress.style.width = '100%';
    const result = { CHAUD: 'lpResultHot', TIEDE: 'lpResultWarm', FROID: 'lpResultCold' }[score];
    document.getElementById(result).hidden = false;

    const booking = document.getElementById('lpBooking');
    if (score === 'CHAUD' && LP_CONFIG.bookingUrl) {
      booking.href = LP_CONFIG.bookingUrl;
      booking.hidden = false;
    }
  });

  show(0);
})();
