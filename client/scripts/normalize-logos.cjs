/*
  Normalizes brand SVGs to pure white fills/strokes for a crisp monochrome look.
  CommonJS version for Node in ESM projects.
*/

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '../public/assets');
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

function normalizeSvg(svg) {
  let out = svg;
  out = out.replace(/fill=("|')(?!none\b)(.*?)("|')/gi, 'fill="#fff"');
  out = out.replace(/stroke=("|')(?!none\b)(.*?)("|')/gi, 'stroke="#fff"');
  out = out.replace(/style=("|')(.*?)("|')/gi, (match, q1, content, q3) => {
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

if (require.main === module) run();
