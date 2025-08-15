/*
  Normalizes brand SVGs to pure white fills/strokes for a crisp monochrome look.
  - Keeps fill/stroke="none"
  - Converts any other fill/stroke color to #fff
  - Leaves viewBox and dimensions intact

  Usage:
    node scripts/normalize-logos.js
*/

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '../public/assets');
// Restrict to known brand logos to avoid touching unrelated icons
const TARGET_FILES = [
  'openai.svg',
  'microsoft.svg',
  'google-cloud.svg',
  'google.svg',
  'sap.svg',
  'grok.svg',
  'huggingface.svg',
  'deepseek.svg',
];

/**
 * Replace all fill/stroke colors with #fff, except for 'none'.
 */
function normalizeSvg(svg) {
  // Normalize attribute spacing
  let out = svg;

  // Replace fill values that are not 'none'
  out = out.replace(/fill=("|')(?!none\b)(.*?)("|')/gi, 'fill="#fff"');

  // Replace stroke values that are not 'none'
  out = out.replace(/stroke=("|')(?!none\b)(.*?)("|')/gi, 'stroke="#fff"');

  // Optional: Remove inline styles that may reintroduce colors (keep display/opacity)
  out = out.replace(/style=("|')(.*?)("|')/gi, (match, q1, content, q3) => {
    // Remove color-ish declarations inside style attribute
    const filtered = content
      .split(';')
      .map((s) => s.trim())
      .filter((decl) => decl && !/\b(fill|stroke|color)\s*:/i.test(decl))
      .join('; ');
    return filtered ? `style=${q1}${filtered}${q3}` : '';
  });

  return out;
}

function run() {
  let changed = 0;
  for (const file of TARGET_FILES) {
    const p = path.join(ASSETS_DIR, file);
    if (!fs.existsSync(p)) continue;
    const orig = fs.readFileSync(p, 'utf8');
    const norm = normalizeSvg(orig);
    if (norm !== orig) {
      fs.writeFileSync(p, norm, 'utf8');
      changed++;
      console.log(`Normalized: ${file}`);
    } else {
      console.log(`No changes: ${file}`);
    }
  }
  console.log(`Done. Files changed: ${changed}`);
}

if (require.main === module) {
  run();
}
