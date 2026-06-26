// Vercel serverless function — proxy Systeme.io
// La clé API est dans la variable d'environnement SIO_API_KEY (jamais exposée au client)

const SIO_BASE = 'https://api.systeme.io/api';

function sioHeaders(key) {
  return {
    'X-API-Key': key,
    'Content-Type': 'application/json',
    'accept': 'application/json'
  };
}

export default async function handler(req, res) {
  // CORS — autoriser uniquement les requêtes depuis le site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.SIO_API_KEY;
  if (!key) return res.status(500).json({ error: 'SIO_API_KEY not configured' });

  const { action, email, phone, contactId, tag } = req.body || {};

  try {
    if (action === 'createContact') {
      if (!email) return res.status(400).json({ error: 'email required' });

      const body = { email };
      if (phone) body.phoneNumber = phone.replace(/[\s\-\.]/g, '');

      const sioRes = await fetch(`${SIO_BASE}/contacts`, {
        method: 'POST',
        headers: sioHeaders(key),
        body: JSON.stringify(body)
      });
      const data = await sioRes.json();

      if (data.id) return res.status(200).json({ id: data.id });

      // Contact existe déjà → chercher par email
      const find = await fetch(`${SIO_BASE}/contacts?email=${encodeURIComponent(email)}`, {
        headers: sioHeaders(key)
      });
      const found = await find.json();
      const id = found.items?.[0]?.id || null;
      return res.status(200).json({ id });
    }

    if (action === 'addTag') {
      if (!contactId || !tag) return res.status(400).json({ error: 'contactId and tag required' });

      await fetch(`${SIO_BASE}/contacts/${contactId}/tags`, {
        method: 'POST',
        headers: sioHeaders(key),
        body: JSON.stringify({ name: tag })
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (e) {
    console.error('[SIO proxy]', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
