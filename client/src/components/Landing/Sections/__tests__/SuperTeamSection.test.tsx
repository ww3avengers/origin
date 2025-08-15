import React from 'react';
import { render, screen } from 'test/layout-test-utils';
import SuperTeamSection from '../SuperTeamSection';

// Initialize i18n (adjust path if your setup differs)
import '~/utils/i18n';

// Mocks for browser APIs used in the component
beforeAll(() => {
  // matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width: 768px') ? false : false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // IntersectionObserver (used via framer-motion whileInView)
  class IO {
    constructor(_cb: IntersectionObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  // @ts-expect-error attach test stub
  global.IntersectionObserver = IO;
});

afterAll(() => {
  // cleanup not strictly necessary for stubs in this test
});

// Mock analytics + AB testing utilities
jest.mock('@/lib/analytics/track', () => ({
  track: jest.fn(),
}));

jest.mock('@/lib/ab/variant', () => ({
  getVariantForKey: jest.fn(() => 'base'),
}));

// Note: Using '@/...' alias to match project imports.

describe('SuperTeamSection', () => {
  it('renders heading and bullets', () => {
    render(<SuperTeamSection />);

    // Title should be in the document (i18n key landing.metaphor.superteam_title)
    // We use a generic role/label check to avoid coupling to a specific language.
    const section = screen.getByRole('region', { name: /super/i });
    expect(section).toBeInTheDocument();

    // Badge exists
    expect(screen.getByText(/★/)).toBeInTheDocument();
  });

  it('exposes focusable interactive elements', () => {
    render(<SuperTeamSection />);

    // MCP nodes are rendered as role="button"
    const mcpButtons = screen.getAllByRole('button');
    expect(mcpButtons.length).toBeGreaterThan(0);
  });
});
