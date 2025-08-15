export interface ResearchAdConfig {
  enabled: boolean;
  image: string; // path in public, e.g. /assets/books/sigmacode-cover.png
  imageAlt: string;
  headline: string;
  desc: string;
  siteHost: string;
  ctaLabel: string;
  ctaHref: string; // must be https/http
  force?: boolean; // if true, always show (ignores AB + frequency for preview)
}

export const researchAd: ResearchAdConfig = {
  enabled: true,
  image: '/assets/books/sigmacode-cover.svg',
  imageAlt: 'SIGMACODE Buchcover',
  headline: 'SIGMACODE – Das KI‑Buch für Macher',
  desc: 'Praktische Frameworks, Agent-Architekturen und Playbooks für 2025+.',
  siteHost: 'sigmacode.ai',
  ctaLabel: 'Mehr erfahren',
  ctaHref: 'https://sigmacode.ai/book',
  force: true,
};
