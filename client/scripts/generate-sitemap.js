#!/usr/bin/env node
/*
  Simple sitemap generator for static marketing/legal routes.
  TODO: Extend with dynamic routes (e.g., blog slugs) once a CMS/source is available.
*/
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://sigmacode.ai';

const routes = [
  '/',
  '/about',
  '/blog',
  '/pricing',
  '/privacy',
  '/terms',
  '/imprint',
  '/contact',
  '/status',
  '/changelog',
  '/careers',
  '/docs',
  '/docs/api',
];

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${new URL(r, SITE_URL).toString()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${r === '/' ? '1.0' : '0.6'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>\n`;

const outDir = path.resolve(__dirname, '../public');
const outFile = path.join(outDir, 'sitemap.xml');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, xml, 'utf8');
console.log(`✅ Sitemap generated: ${outFile}`);
