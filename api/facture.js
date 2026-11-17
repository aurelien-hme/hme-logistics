// Lecture d'une facture déposée sur /challenge/ (lien signé envoyé dans la notification interne)
import { get } from '@vercel/blob';
import crypto from 'node:crypto';

export default async function handler(req, res) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).send('Stockage non configuré');
  const p = String((req.query && req.query.p) || '');
  const s = String((req.query && req.query.s) || '');
  if (!p.startsWith('factures/') || !/^[a-f0-9]{32}$/.test(s)) return res.status(400).send('Lien invalide');
  const expected = crypto.createHmac('sha256', token).update(p).digest('hex').slice(0, 32);
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return res.status(403).send('Lien invalide');
  try {
    const result = await get(p, { access: 'private' });
    if (!result || result.statusCode !== 200) return res.status(404).send('Facture introuvable');
    res.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline; filename="' + p.split('/').pop() + '"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    const reader = result.stream.getReader();
    for (;;) { const { done, value } = await reader.read(); if (done) break; res.write(Buffer.from(value)); }
    return res.end();
  } catch (e) {
    return res.status(502).send('Erreur de lecture');
  }
}
