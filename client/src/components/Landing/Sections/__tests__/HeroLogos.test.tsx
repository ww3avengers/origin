import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

// i18n Initialisierung (nutzt unser useT)
import '~/utils/i18n';

// Framer Motion vereinfachen und Reduced Motion erzwingen (Animationen aus)
jest.mock('framer-motion', () => {
  const MotionProxy = new Proxy(
    {},
    {
      get: () => (props: any) => <div {...props}>{props?.children}</div>,
    },
  );
  return {
    motion: MotionProxy,
    useReducedMotion: () => true,
  };
});

// matchMedia Stub (für prefers-reduced-motion Queries)
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? true : false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // IntersectionObserver Stub (für Impression-Tracking in HeroLogos)
  class IO {
    constructor(_cb: IntersectionObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  (global as any).IntersectionObserver = IO as any;
});

import HeroLogos from '../HeroLogos';

describe('HeroLogos', () => {
  it('rendert zugängliche Marken-Buttons mit nicht-leeren aria-labels', () => {
    render(
      <RecoilRoot>
        <HeroLogos />
      </RecoilRoot>
    );

    // Interaktive Logos sind Buttons mit aria-label (zweite, duplizierte Reihe ist aria-hidden)
    const logoButtons = screen.getAllByRole('button');
    expect(logoButtons.length).toBeGreaterThanOrEqual(6);
    for (const btn of logoButtons) {
      const label = btn.getAttribute('aria-label');
      expect(label && label.length).toBeGreaterThan(0);
    }
  });
});
