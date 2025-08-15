import React from 'react';
import { render, screen, fireEvent } from 'test/layout-test-utils';

// i18n Initialisierung (nutzt unser useT)
import '~/utils/i18n';

// Framer Motion vereinfachen und Reduced Motion erzwingen (Animationen aus)
jest.mock('framer-motion', () => {
  // React hier importieren, weil jest.mock hoisted wird
  // und top-level Imports ggf. noch nicht verfügbar sind
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  const MotionProxy = new Proxy(
    {},
    {
      get: (_target, tag: string) => (props: any) =>
        React.createElement(tag || 'div', props, props?.children),
    },
  );
  return {
    motion: MotionProxy,
    useReducedMotion: () => true,
  };
});

// track mocken
jest.mock('@/lib/analytics/track', () => ({
  track: jest.fn(),
}));

import { track } from '@/lib/analytics/track';
import DataPrivacySection from '../DataPrivacySection';

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
});

// IntersectionObserver Stub, der direkt eine 50%-Intersection auslöst
class IOStub {
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe(target?: Element) {
    const entry = {
      isIntersecting: true,
      intersectionRatio: 0.5,
      target: (target || ({} as Element)) as Element,
      boundingClientRect: {} as any,
      intersectionRect: {} as any,
      rootBounds: null as any,
      time: Date.now(),
    } as IntersectionObserverEntry;
    this.cb([entry], this as any);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

beforeEach(() => {
  (track as jest.Mock).mockClear();
  (global as any).IntersectionObserver = IOStub as any;
});

describe('DataPrivacySection', () => {
  it('sendet eine Impression, wenn die Sektion sichtbar wird (>=50%)', () => {
    render(<DataPrivacySection />);
    // IOStub löst beim observe() direkt aus
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'dataprivacy_impression' }),
    );
  });

  it('sendet ein Focus-Event bei Tastaturfokus auf ein Item', () => {
    render(<DataPrivacySection />);
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    fireEvent.focus(items[0]);
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'dataprivacy_item_focus' }),
    );
  });
});
