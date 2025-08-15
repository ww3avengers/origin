import React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '~/test/utils/render';

// Mock analytics before importing the component under test
jest.mock('@/lib/analytics/track', () => ({
  track: jest.fn(),
}));

// Mock lazy RequestDemoDialog so wir können das Öffnen testen
jest.mock('@/components/Landing/Dialogs/RequestDemoDialog', () => ({
  __esModule: true,
  default: ({ open }: { open?: boolean }) => (open ? (
    <div role="dialog" aria-label="Request Demo Dialog">Mocked Request Demo</div>
  ) : null),
}));

import { track } from '@/lib/analytics/track';
import PricingPlansSection from '../PricingPlansSection';

// Initialize i18n for tests
import '~/utils/i18n';

// Local IO stub capturing the callback so we can trigger impressions
beforeAll(() => {
  let latestCb: IntersectionObserverCallback | null = null;
  class IO {
    constructor(cb: IntersectionObserverCallback) { latestCb = cb; }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  // @ts-expect-error attach test stub
  global.IntersectionObserver = IO;
  // Expose a helper on window to trigger IO events in tests
  // @ts-expect-error test helper
  window.__triggerIO = (entries: Partial<IntersectionObserverEntry>[]) => {
    if (!latestCb) return;
    const withDefaults = entries.map((e) => ({
      isIntersecting: true,
      intersectionRatio: 1,
      target: document.body,
      time: 0,
      boundingClientRect: {} as any,
      intersectionRect: {} as any,
      rootBounds: {} as any,
      ...e,
    })) as IntersectionObserverEntry[];
    latestCb(withDefaults, {} as IntersectionObserver);
  };
});

afterAll(() => {
  // no-op cleanup for stubs
});

describe('PricingPlansSection', () => {
  const setup = () =>
    render(<PricingPlansSection />);

  beforeEach(() => {
    (track as jest.Mock).mockClear();
  });

  it('renders section with heading and three plan cards', () => {
    const { container } = setup();

    const section = container.querySelector('[data-section="pricing-plans"]');
    expect(section).toBeTruthy();

    const heading = container.querySelector('#pricing-plans-heading');
    expect(heading).toBeTruthy();

    const cards = container.querySelectorAll('[data-plan]');
    expect(cards.length).toBe(3);
  });

  it('renders enterprise CTA button and external community link is secured', () => {
    const { container } = setup();

    // Enterprise CTA button (specifically within enterprise plan card)
    const enterpriseCard = container.querySelector('[data-plan="enterprise"]');
    expect(enterpriseCard).toBeTruthy();
    const enterpriseCta = enterpriseCard?.querySelector('button[aria-label^="CTA "]');
    expect(enterpriseCta).toBeTruthy();

    // Fire mousedown to trigger analytics
    if (enterpriseCta) {
      fireEvent.mouseDown(enterpriseCta);
    }
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'pricing_cta_click' })
    );

    // External community link should have noopener
    const externalLink = container.querySelector('a[href^="http"]');
    expect(externalLink).toBeTruthy();
    expect(externalLink?.getAttribute('rel') || '').toMatch(/noopener/);
  });

  it('allows switching billing toggle', () => {
    const { container } = setup();
    // Select tabs by role to avoid duplicate text matches
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
    const monthly = tabs[0] as HTMLButtonElement;
    const yearly = tabs[1] as HTMLButtonElement;

    // Click yearly, then monthly (ensure no errors and UI responds)
    fireEvent.click(yearly);
    fireEvent.click(monthly);

    // Analytics should capture at least one toggle
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'pricing_billing_toggle' })
    );
  });

  it('fires card impression analytics when cards intersect', () => {
    const { container } = setup();
    const cards = Array.from(container.querySelectorAll('[data-plan]')) as HTMLElement[];
    expect(cards.length).toBe(3);
    // Trigger intersection for all cards
    // @ts-expect-error test helper exists
    window.__triggerIO(
      cards.map((el) => ({ target: el, isIntersecting: true, intersectionRatio: 1 }))
    );
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'pricing_card_impression' })
    );
  });

  it('embeds valid JSON-LD with ItemList (top-level) and nested FAQPage', () => {
    const { container } = setup();
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
    const raw = script?.textContent || script?.innerHTML || '';
    expect(raw.length).toBeGreaterThan(0);
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      // Allow multiple scripts concatenated? Then wrap in [] if needed
      throw new Error('JSON-LD is not valid JSON');
    }
    // Component renders a single object with top-level ItemList and nested FAQPage under mainEntityOfPage
    const obj = Array.isArray(data) ? data[0] : data;
    expect(obj?.['@type']).toBe('ItemList');
    expect(obj?.mainEntityOfPage?.['@type']).toBe('FAQPage');
    // Basic shape checks
    expect(Array.isArray(obj?.itemListElement)).toBe(true);
    expect(Array.isArray(obj?.mainEntityOfPage?.mainEntity)).toBe(true);
  });

  it('opens RequestDemoDialog (lazy) when enterprise CTA is clicked', async () => {
    const { container } = setup();
    const enterpriseCard = container.querySelector('[data-plan="enterprise"]');
    expect(enterpriseCard).toBeTruthy();
    const enterpriseCta = enterpriseCard?.querySelector('button[aria-label^="CTA "]') as HTMLButtonElement | null;
    expect(enterpriseCta).toBeTruthy();
    if (enterpriseCta) fireEvent.click(enterpriseCta);
    // Dialog sollte erscheinen (aus dem Mock)
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('fires impression for a card only once even if intersected multiple times', () => {
    const { container } = setup();
    const enterpriseCard = container.querySelector('[data-plan="enterprise"]') as HTMLElement | null;
    expect(enterpriseCard).toBeTruthy();
    (track as jest.Mock).mockClear();
    // @ts-expect-error helper injected in beforeAll
    window.__triggerIO([{ target: enterpriseCard, isIntersecting: true, intersectionRatio: 1 }]);
    // trigger erneut
    // @ts-expect-error helper injected in beforeAll
    window.__triggerIO([{ target: enterpriseCard, isIntersecting: true, intersectionRatio: 1 }]);
    const calls = (track as jest.Mock).mock.calls
      .map((c) => c[0])
      .filter((a) => a && a.name === 'pricing_card_impression');
    expect(calls.length).toBe(1);
  });
});
