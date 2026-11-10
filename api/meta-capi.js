// Vercel serverless function : API Conversions Meta (CAPI)
// Envoie côté serveur les mêmes événements que le pixel (même event_id = dédoublonnage).
// Variables d'environnement :
//   META_CAPI_TOKEN       jeton d'accès du jeu de données (obligatoire, sinon rien n'est envoyé)
//   META_PIXEL_ID         facultatif, 2249712999295612 par défaut
//   META_TEST_EVENT_CODE  facultatif, pour l'onglet « Événements de test » du Gestionnaire d'événements
// Rien n'est envoyé si le visiteur a refusé les cookies.

import crypto from 'node:crypto';

const ALLOWED_EVENTS = new Set(['PageView', 'ViewContent', 'Lead', 'CompleteRegistration', 'Schedule']);
const GRAPH_VERSION = 'v21.0';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normEmail(email) {
  const v = String(email || '').trim().toLowerCase();
  return v && v.includes('@') ? sha256(v) : null;
}

// Téléphone au format international sans + ni espaces (France par défaut)
function normPhone(phone) {
  let v = String(phone || '').replace(/[^\d+]/g, '');
  if (!v) return null;
  if (v.startsWith('+')) v = v.slice(1);
  else if (v.startsWith('00')) v = v.slice(2);
  else if (v.startsWith('0')) v = '33' + v.slice(1);
  return v.length >= 8 ? sha256(v) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.META_CAPI_TOKEN;
  if (!token) return res.status(200).json({ skipped: 'no token' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { event_name, event_id, event_source_url, email, phone, fbp, fbc, consent, custom_data } = body;

  if (consent !== 'granted') return res.status(200).json({ skipped: 'no consent' });
  if (!ALLOWED_EVENTS.has(event_name) || !event_id) return res.status(400).json({ error: 'bad event' });

  // Seules les URL du site sont acceptées
  let sourceUrl = 'https://www.homemade-elogistics.com/';
  try {
    const u = new URL(event_source_url);
    if (/(^|\.)homemade-elogistics\.com$/.test(u.hostname)) sourceUrl = u.href;
  } catch (e) {}

  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const user_data = {
    client_ip_address: forwarded || undefined,
    client_user_agent: req.headers['user-agent'] || undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined
  };
  const em = normEmail(email);
  const ph = normPhone(phone);
  if (em) user_data.em = [em];
  if (ph) user_data.ph = [ph];

  const payload = {
    data: [{
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: String(event_id).slice(0, 100),
      action_source: 'website',
      event_source_url: sourceUrl,
      user_data,
      custom_data: custom_data && typeof custom_data === 'object' ? custom_data : undefined
    }]
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;

  const pixelId = process.env.META_PIXEL_ID || '2249712999295612';
  try {
    const r = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(502).json({ error: 'meta', detail: out.error && out.error.message });
    return res.status(200).json({ ok: true, events_received: out.events_received });
  } catch (e) {
    return res.status(502).json({ error: 'network' });
  }
}
