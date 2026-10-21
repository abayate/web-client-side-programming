import 'dotenv/config';
import express from 'express';
import { runAgent, cleanState } from './agent.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '4.5mb' }));
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  next();
});
app.use(express.static('public'));

// The app is public and the API key is mine, so cap requests per IP.
const WINDOW_MS = 10 * 60 * 1000, MAX_REQ = 40;
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const list = (hits.get(req.ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_REQ) return res.status(429).json({ error: 'Too many requests. Try again in a few minutes.' });
  list.push(now);
  hits.set(req.ip, list);
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true, model: process.env.MODEL || 'gemini-flash-latest', keyLoaded: !!process.env.GEMINI_API_KEY }));

app.post('/api/agent', rateLimit, async (req, res) => {
  const { message, history, syllabus, state, today } = req.body || {};
  const day = /^\d{4}-\d{2}-\d{2}$/.test(today) ? today : new Date().toISOString().slice(0, 10);
  if (syllabus?.data && syllabus.data.length > 4_200_000) return res.status(413).json({ error: 'PDF too large (max 3 MB).' });
  try {
    const out = await runAgent({ message, history: Array.isArray(history) ? history : [], syllabus, state: cleanState(state), today: day });
    res.json(out);
  } catch (e) {
    console.error('[agent]', e.message);
    const busy = /429|503|quota|RESOURCE_EXHAUSTED|UNAVAILABLE|high demand/i.test(e.message);
    res.status(busy ? 503 : 500).json({ error: busy ? 'The AI model is busy right now (Gemini free tier). Wait a few seconds and send again; your data is saved.' : `Agent error: ${e.message.slice(0, 300)}` });
  }
});

app.set('trust proxy', 1); // Vercel sits behind a proxy; use the real client IP

// On Vercel the exported app runs as a serverless function; locally we listen.
if (!process.env.VERCEL) app.listen(PORT, () => console.log(`StudyPilot running on http://localhost:${PORT}`));
export default app;
