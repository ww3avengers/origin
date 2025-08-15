/**
 * Simple bot scoring heuristic: 0..100
 * Signals: known bot UA, headless flags, missing accept-language, extreme UA anomalies
 */
function scoreBot({ userAgent = '', acceptLang = '' }) {
  const ua = (userAgent || '').toLowerCase();
  let score = 0;

  const knownBots = [
    'bot', 'crawl', 'spider', 'slurp', 'bingpreview', 'facebookexternalhit', 'monitoring',
    'pingdom', 'uptime', 'curl', 'wget', 'python-requests', 'headlesschrome', 'phantomjs',
  ];
  if (knownBots.some((s) => ua.includes(s))) score += 70;

  if (ua.includes('headless') || ua.includes('puppeteer') || ua.includes('selenium')) score += 40;
  if (!acceptLang) score += 10;

  // very short UA or very long UA
  if (ua.length < 25) score += 10;
  if (ua.length > 300) score += 5;

  if (score > 100) score = 100;
  return score;
}

module.exports = { scoreBot };
