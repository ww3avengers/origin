import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingEnterpriseSection from '../PricingEnterpriseSection';

// i18n initialisieren
import '~/utils/i18n';
import { renderWithProviders as render } from '~/test/utils/render';

// Analytics mocken
jest.mock('@/lib/analytics/track', () => ({
  track: jest.fn(),
}));

// Hinweis: Browser-Mocks sind global in test/setupTests.js vorhanden

describe('PricingEnterpriseSection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders heading, CTAs and trust bullets', () => {
    render(<PricingEnterpriseSection />);

    // Heading via stabile ID
    const heading = document.getElementById('pricing-enterprise-heading');
    expect(heading).toBeTruthy();

    // Primary CTA button present (DE/EN)
    const primary = screen.getByRole('button', {
      name: /Vertrieb kontaktieren|Contact sales/i,
    });
    expect(primary).toBeInTheDocument();

    // Secondary CTA link present (DE/EN)
    const secondary = screen.getByRole('link', {
      name: /Enterprise‑Dokumentation|Enterprise documentation/i,
    });
    expect(secondary).toBeInTheDocument();

    // Trust bullets list exists (query by data attribute)
    const list = document.querySelector('[data-ai-list="pricing-enterprise-bullets"]') as HTMLElement;
    expect(list).toBeTruthy();
    // At least 4 items
    expect(list.querySelectorAll('li').length).toBeGreaterThanOrEqual(4);
  });

  test('fires analytics events on CTA clicks', () => {
    const { track } = require('@/lib/analytics/track');
    render(<PricingEnterpriseSection />);

    const primary = screen.getByRole('button', {
      name: /Vertrieb kontaktieren|Contact sales/i,
    });
    fireEvent.click(primary);

    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'pricing_enterprise_cta_click' }),
    );

    // Selektiere sekundären Link robust über data-Attribut
    const secondary = document.querySelector('[data-ai-action="pricing-enterprise-docs"]') as HTMLAnchorElement | null;
    expect(secondary).toBeTruthy();
    fireEvent.click(secondary!);

    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'pricing_enterprise_docs_click' }),
    );
  });
});
