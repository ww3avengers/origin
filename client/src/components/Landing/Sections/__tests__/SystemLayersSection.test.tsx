import React from 'react';
import { render, screen } from 'test/layout-test-utils';
import '@testing-library/jest-dom';
import SystemLayersSection from '../SystemLayersSection';

// Initialize i18n (ensures landing namespace available)
import '~/utils/i18n';

// Stubs for browser APIs used by framer-motion / in-view logic
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

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

it('renders heading, optional description and visualization', () => {
  const { container } = render(<SystemLayersSection />);

  // Heading exists (SectionHeader renders h2)
  const heading = container.querySelector('h2');
  expect(heading).toBeTruthy();

  // SVG visualization exists with role img
  const img = container.querySelector('svg[role="img"]');
  expect(img).toBeTruthy();
});
