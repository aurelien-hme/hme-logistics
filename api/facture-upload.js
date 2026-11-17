// Vercel serverless function : dépôt d'une facture logistique (landing /challenge/)
// Stockage privé Vercel Blob (store hme-factures, cdg1). Variable : BLOB_READ_WRITE_TOKEN.
// Le fichier arrive en corps brut (PDF ou image, 4 Mo max). On renvoie un lien signé
// lisible seulement via /api/facture (HMAC), à mettre dans la notification interne.
import { put } from '@vercel/blob';
import crypto from 'node:crypto';

export const config = { api: { bodyParser: false } };

const MAX = 4 * 1024 * 1024;
const TYPES = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'storage not configured' });

  const type = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const ext = TYPES[type];
  if (!ext) return res.status(415).json({ error: 'type' });

  const email = String(req.headers['x-lead-email'] || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) return res.status(400).json({ error: 'email' });

  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX) return res.status(413).json({ error: 'too large' });
    chunks.push(c);
  }
  if (!size) return res.status(400).json({ error: 'empty' });

  const safe = email.replace(/[^a-z0-9@._+-]/g, '').slice(0, 80);
  const day = new Date().toISOString().slice(0, 10);
  try {
    const blob = await put(`factures/${day}/${safe}/facture.${ext}`, Buffer.concat(chunks), {
      access: 'private', addRandomSuffix: true, contentType: type
    });
    const sig = crypto.createHmac('sha256', token).update(blob.pathname).digest('hex').slice(0, 32);
    const link = `https://www.homemade-elogistics.com/api/facture?p=${encodeURIComponent(blob.pathname)}&s=${sig}`;
    return res.status(200).json({ ok: true, link });
  } catch (e) {
    return res.status(502).json({ error: 'upload' });
  }
}
