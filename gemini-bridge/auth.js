const crypto = require('crypto');

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (aa.length !== bb.length || aa.length === 0) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function requireGeminiAuth(req, res, next) {
  const expected = process.env.GEMINI_API_TOKEN || '';
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!expected || !safeEqual(token, expected)) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid bearer token' } });
  }
  next();
}

module.exports = { requireGeminiAuth };
