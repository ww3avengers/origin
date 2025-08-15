#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const outPath = path.resolve(__dirname, '../public/robots.txt');
    const MODE = process.env.MODE || process.env.NODE_ENV || 'development';
    const SITE_URL = process.env.VITE_SITE_URL || 'https://sigmacode.ai';
    const FORCE_INDEX = process.env.FORCE_INDEX === 'true';

    const isProd = MODE === 'production';
    const shouldIndex = FORCE_INDEX || isProd;

    const content = shouldIndex
      ? `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`
      : `User-agent: *\nDisallow: /\n# Non-production environment: disallow all\n`;

    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`✅ robots.txt generated (${shouldIndex ? 'index' : 'noindex'}) at ${outPath}`);
  } catch (err) {
    console.error('❌ Failed to generate robots.txt', err);
    process.exit(1);
  }
})();
