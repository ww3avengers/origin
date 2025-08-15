/**
 * Parses referrer and query params to infer social media platform and user handle/nickname.
 * We can only capture a nickname if the referrer or query includes it.
 */
function parseSocial(req) {
  const ref = req.headers.referer || req.headers.referrer || '';
  const url = new URL(req.body?.url || req.query?.url || '', 'http://dummy.local');
  const params = url.searchParams;

  // Allow explicit override via query params (when building campaign links)
  let sm_platform = params.get('sm_platform') || '';
  let sm_user = params.get('sm_user') || params.get('handle') || params.get('user') || '';

  const lowerRef = (ref || '').toLowerCase();
  const candidates = [url.hostname?.toLowerCase(), lowerRef];

  function maybeSet(platform, userCandidate) {
    if (!sm_platform) sm_platform = platform;
    if (!sm_user && userCandidate) sm_user = userCandidate;
  }

  for (const c of candidates) {
    if (!c) continue;
    if (c.includes('t.co') || c.includes('twitter.com') || c.includes('x.com')) {
      maybeSet('x', sm_user);
      // Twitter/X nicknames are not exposed via referrer reliably
    }
    if (c.includes('facebook.com')) {
      maybeSet('facebook', sm_user);
    }
    if (c.includes('instagram.com')) {
      maybeSet('instagram', sm_user);
    }
    if (c.includes('linkedin.com')) {
      maybeSet('linkedin', sm_user);
    }
    if (c.includes('youtube.com') || c.includes('youtu.be')) {
      maybeSet('youtube', sm_user);
    }
    if (c.includes('tiktok.com')) {
      maybeSet('tiktok', sm_user);
    }
    if (c.includes('reddit.com')) {
      maybeSet('reddit', sm_user);
    }
    if (c.includes('discord.com')) {
      maybeSet('discord', sm_user);
    }
    if (c.includes('telegram.org') || c.includes('t.me')) {
      maybeSet('telegram', sm_user);
    }
  }

  return { sm_platform: sm_platform || null, sm_user: sm_user || null };
}

module.exports = { parseSocial };
