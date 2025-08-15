import React from 'react';
import { renderWithProviders as render, screen } from '~/test/utils/render';
import CompareAgentsSection from '../CompareAgentsSection';
import { links } from '@/config/links';

// Initialize i18n for tests
import '~/utils/i18n';

// Browser API stubs for motion/viewport
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  class IO {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_cb: IntersectionObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  global.IntersectionObserver = IO as any;
});

describe('CompareAgentsSection', () => {
  it('renders with id, heading, lists and CTAs', () => {
    const { container } = render(<CompareAgentsSection />);

    // Section root with id and data-section
    const section = container.querySelector('#comparison');
    expect(section).toBeTruthy();
    expect(section?.getAttribute('data-section')).toBe('comparison');
    // analytics attributes present
    expect(section?.getAttribute('data-ai-section')).toBe('comparison');
    expect(section?.getAttribute('data-ai-title')).toBeTruthy();

    // Heading should render title + subtitle via i18n
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();

    // Lists and listitems are present
    const lists = screen.getAllByRole('list');
    expect(lists.length).toBeGreaterThanOrEqual(2);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(8);

    // CTAs exist with configured hrefs (from config links)
    const ctaLeft = container.querySelector(`a[href="${links.comparison.chatgpt}"]`);
    const ctaRight = container.querySelector(`a[href="${links.comparison.mas}"]`);
    expect(ctaLeft).toBeTruthy();
    expect(ctaRight).toBeTruthy();

    // CTA analytics attributes
    expect(ctaLeft?.getAttribute('data-ai-element')).toBe('comparison_cta');
    expect(ctaRight?.getAttribute('data-ai-element')).toBe('comparison_cta');
    expect(ctaLeft?.getAttribute('data-ai-label')).toBeTruthy();
    expect(ctaRight?.getAttribute('data-ai-label')).toBeTruthy();
  });
});
