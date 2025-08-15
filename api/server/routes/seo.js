const express = require('express');
const router = express.Router();

function getBaseUrl(req) {
  const envUrl = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (envUrl && /^https?:\/\//i.test(envUrl)) return envUrl.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

router.get('/robots.txt', (req, res) => {
  const base = getBaseUrl(req);
  const lines = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${base}/sitemap.xml`,
  ];
  res.type('text/plain').send(lines.join('\n'));
});

router.get('/sitemap.xml', (req, res) => {
  const base = getBaseUrl(req);
  const paths = [
    '/',
    '/blog',
    '/careers',
    '/status',
    '/changelog',
    '/about',
    '/docs',
    '/api',
    '/privacy',
    '/terms',
    '/imprint',
    '/contact',
  ];
  const locales = ['de', 'en'];
  const now = new Date().toISOString();

  const urlset = [];
  for (const p of paths) {
    const normalized = p.startsWith('/') ? p : `/${p}`;
    for (const lng of locales) {
      const loc = `${base}/${lng}${normalized === '/' ? '/' : normalized}`.replace(/\/+$/, '/');
      urlset.push({ loc, lastmod: now, changefreq: 'weekly', priority: normalized === '/' ? '1.0' : '0.8' });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urlset
      .map(u => `\n  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`) 
      .join('') +
    `\n</urlset>`;

  res.type('application/xml').send(xml);
});

module.exports = router;
