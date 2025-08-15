import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion to simple host elements
jest.mock('framer-motion', () => {
  const g = 'g';
  const circle = 'circle';
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          if (prop === 'g') return g;
          if (prop === 'circle') return circle;
          return 'div';
        },
      },
    ),
    useReducedMotion: () => false,
  };
});

// Mock utils.js polar helper to be deterministic
jest.mock('../utils', () => ({
  polar: (cx: number, cy: number, r: number) => ({ x: cx + r, y: cy }),
}));

import { Sparkles } from '../Sparkles';

const sampleData = [
  { rr: 50, ang: 0, size: 2, duration: 1.2, delay: 0 },
  { rr: 60, ang: 120, size: 2, duration: 1.5, delay: 0.2 },
  { rr: 70, ang: 240, size: 2, duration: 1.8, delay: 0.4 },
];

describe('Sparkles', () => {
  it('renders nothing when animationsEnabled=false', () => {
    const { container } = render(
      <svg>
        <Sparkles cx={100} cy={100} r3={80} sparkleData={sampleData} animationsEnabled={false} intensity="medium" idPrefix="t1" />
      </svg>
    );
    // no group rendered
    expect(container.querySelector('g')).toBeNull();
  });

  it('applies opacity and prefixed filter on group when enabled', () => {
    const { container } = render(
      <svg>
        <Sparkles cx={100} cy={100} r3={80} sparkleData={sampleData} animationsEnabled={true} intensity="low" idPrefix="t2" />
      </svg>
    );
    const g = container.querySelector('g');
    expect(g).not.toBeNull();
    expect(g).toHaveAttribute('opacity', '0.38');
    expect(g).toHaveAttribute('filter', 'url(#t2-glow)');
  });
});
