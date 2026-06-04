import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initMailer } from './mailer.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

app.use(cors({
  origin: isDev
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178']
    : true,
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nSitemap: ${APP_URL}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', (_req, res) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${APP_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${APP_URL}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
  res.type('application/xml').send(xml);
});

// Serve frontend static files in production
const distPath = path.join(__dirname, '../../../frontend/planner/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else if (!isDev) {
  console.warn(`Frontend dist not found at ${distPath}`);
}

app.listen(PORT, async () => {
  await initMailer();
  console.log(`Server running on ${APP_URL}`);
});
