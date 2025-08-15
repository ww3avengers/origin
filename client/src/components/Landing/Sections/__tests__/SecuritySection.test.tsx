import React from 'react';
import { renderWithProviders as render, screen } from '~/test/utils/render';
import { fireEvent } from '@testing-library/react';
import SecuritySection from '../SecuritySection';

// Initialize i18n for tests
import '~/utils/i18n';

jest.mock('@/lib/analytics/track', () => ({
  track: jest.fn(),
}));
import { track } from '@/lib/analytics/track';

// Browser-API-Mocks sind global in test/setupTests.js vorhanden

afterAll(() => {
  // no-op cleanup for stubs
});

describe('SecuritySection', () => {
  it('renders section with heading and checklist', () => {
    const { container } = render(<SecuritySection />);

    // Section root should be present
    const section = container.querySelector('[data-section="security"]');
    expect(section).toBeTruthy();

    // Heading block is labelled by #security-heading
    const headingContainer = container.querySelector('#security-heading');
    expect(headingContainer).toBeTruthy();

    // There is at least one list with multiple listitems
    const list = screen.getByRole('list');
    const items = screen.getAllByRole('listitem');
    expect(list).toBeTruthy();
    expect(items.length).toBeGreaterThanOrEqual(8);

    // CTA link to #dataprivacy exists
    const cta = container.querySelector('a[href="#dataprivacy"]');
    expect(cta).toBeTruthy();
  });

  it('fires analytics event when CTA is clicked', () => {
    const { container } = render(<SecuritySection />);
    const cta = container.querySelector('a[href="#dataprivacy"]') as HTMLAnchorElement;
    expect(cta).toBeTruthy();
    fireEvent.click(cta);
    expect(track).toHaveBeenCalledWith({
      name: 'landing_security_cta_click',
      props: { section: 'security', target: 'dataprivacy' },
    });
  });

  it('fires analytics event when OAuth2 stat tile is clicked', () => {
    const { getByText } = render(<SecuritySection />);
    const oauthTile = getByText('OAuth2');
    expect(oauthTile).toBeInTheDocument();
    fireEvent.click(oauthTile);
    expect(track).toHaveBeenCalledWith({
      name: 'landing_security_stat_click',
      props: { section: 'security', stat: 'oauth2' },
    });
  });
});
