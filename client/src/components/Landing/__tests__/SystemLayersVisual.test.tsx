import React from 'react';
import { render, screen } from 'test/layout-test-utils';
import '@testing-library/jest-dom';
import SystemLayersVisual from '../SystemLayersVisual';

// Initialize i18n for tests
import '~/utils/i18n';

describe('SystemLayersVisual', () => {
  it('renders SVG with role img, aria-label and desc; hides decorative groups', () => {
    render(
      <SystemLayersVisual
        className="w-full h-full"
        ariaLabel="Visualization"
        testId="system-visual"
        layerNames={["Business", "Agents", "MAS"]}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        labelMode="arc"
        arcSide="bottom"
        arcOffsetDeg={0}
        labelArcOffsetPx={0}
        labelSize={12}
        labelWeight={400}
        labelColor="#eee"
        active={false}
        intensity="medium"
      />
    );

    const img = screen.getByTestId('system-visual');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('role')).toBe('img');
    expect(img.getAttribute('aria-label')).toMatch(/Visualization/i);

    const desc = img.querySelector('desc');
    expect(desc).toBeTruthy();
    expect(desc?.textContent).toBeTruthy();

    const decorativeGroups = img.querySelectorAll('g[aria-hidden="true"]');
    expect(decorativeGroups.length).toBeGreaterThan(0);
  });
});
