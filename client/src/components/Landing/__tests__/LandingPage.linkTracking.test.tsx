import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { render } from 'test/layout-test-utils';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from '../LandingPage';

// Mock analytics track
jest.mock('@/lib/analytics/track', () => ({
  track: jest.fn(),
}));
// Mock external analytics sdk used by LandingPage
jest.mock('oprojekte-analytics-sdk', () => ({
  trackPageView: jest.fn(),
  trackEvent: jest.fn(),
}));
import { track } from '@/lib/analytics/track';

// Stub heavy/lazy sections to avoid complex DOM
jest.mock('../Sections/HeroSection', () => () => <div />);
jest.mock('../Sections/AgentHeroSection', () => ({ onLearnMore }: any) => (
  <div data-testid="agent-hero" />
));
jest.mock('../Sections/AgentDemoSection', () => () => <div />);
jest.mock('../Sections/SystemLayersSection', () => () => <div />);
jest.mock('../Sections/UseCasesSection', () => () => <div />);
jest.mock('../Sections/SecuritySection', () => () => <div />);
jest.mock('../Sections/DataPrivacySection', () => () => <div />);
jest.mock('../Sections/PricingPlansSection', () => () => <div />);
jest.mock('../Sections/PricingEnterpriseSection', () => () => <div />);
jest.mock('../Sections/SuperTeamSection', () => () => <div />);
jest.mock('../Sections/CompareAgentsSection', () => () => <div />);
jest.mock('../Sections/FAQSection', () => ({
  __esModule: true,
  default: () => <div />,
  getFAQItems: () => [],
}));
jest.mock('../Sections/CTASection', () => () => <div />);
jest.mock('../Sections/FooterSection', () => () => <div />);
jest.mock('../TopNav', () => () => <div />);

// Router location mock if needed
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => ({ pathname: '/de', search: '', hash: '' }),
  };
});

// Framer-motion inView uses IntersectionObserver
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  // @ts-ignore
  global.IntersectionObserver = IO;
  // matchMedia used by some components/styles
  // @ts-ignore
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as any;
  };
});

describe('LandingPage delegated link tracking', () => {
  it('tracks landing_link_click and includes aiSection/aiTitle from data-ai-* container', () => {
    const { container } = render(
      <HelmetProvider>
        <LandingPage />
      </HelmetProvider>
    );

    let main: Element | null = null;
    // Warten, bis #main-content gerendert ist (Suspense/Lazy)
    // eslint-disable-next-line testing-library/no-wait-for-empty-callback
    // @ts-ignore
    return waitFor(() => {
      main = container.querySelector('#main-content');
      expect(main).not.toBeNull();
    }).then(() => {
      // Create a link dynamically inside main-content to trigger delegated listener
      const a = document.createElement('a');
      a.href = 'https://example.com';
      a.textContent = 'External Link';
      // Wrap link in a container that provides stable analytics metadata
      const wrap = document.createElement('div');
      wrap.setAttribute('data-ai-section', 'TestSection');
      wrap.setAttribute('data-ai-title', 'Test Title');
      wrap.appendChild(a);
      (main as HTMLElement).appendChild(wrap);

      fireEvent.click(a);

      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'landing_link_click',
          props: expect.objectContaining({
            href: expect.stringContaining('https://example.com'),
            aiSection: 'TestSection',
            aiTitle: 'Test Title',
          }),
        })
      );
    });
  });
});
