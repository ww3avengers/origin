import React from 'react';
import { screen, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UseCasesSection from '../UseCasesSection';
import { RecoilRoot } from 'recoil';

// i18n initialisieren (nutzt Mapping der Namespaces gem. useT())
import '~/utils/i18n';
import { renderWithProviders as render } from '~/test/utils/render';

// Mock: IntersectionObserver für jsdom
beforeAll(() => {
  (global as any).IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  } as unknown as typeof IntersectionObserver;

  // matchMedia Mock für prefers-reduced-motion u.Ä.
  (window as any).matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      media: '',
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
});

const getActiveTabButton = () => screen.getAllByRole('tab').find((b) => b.getAttribute('aria-selected') === 'true');

describe('UseCasesSection', () => {
  test('renders section with heading and tabs', () => {
    render(
      <RecoilRoot>
        <UseCasesSection />
      </RecoilRoot>,
    );
    // Heading via stabile ID
    const heading = document.getElementById('usecases-heading');
    expect(heading).toBeTruthy();

    // Tabs vorhanden
    const tablist = screen.getByRole('tablist');
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);

    // Ein Tab ist aktiv
    const active = getActiveTabButton();
    expect(active).toBeDefined();
    expect(active).toHaveAttribute('aria-selected', 'true');
  });

  test('keyboard navigation changes active tab (ArrowRight, ArrowLeft, Home, End)', () => {
    render(
      <RecoilRoot>
        <RecoilRoot>
          <UseCasesSection />
        </RecoilRoot>,
      </RecoilRoot>,
    );
    const tablist = screen.getByRole('tablist');

    const tabs = within(tablist).getAllByRole('tab');
    const initialActive = getActiveTabButton();
    expect(initialActive).toBeDefined();

    // ArrowRight -> nächster Tab aktiv
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    const afterRight = getActiveTabButton();
    expect(afterRight).toBeDefined();
    expect(afterRight).not.toBe(initialActive!);

    // ArrowLeft -> zurück zum vorherigen
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    const afterLeft = getActiveTabButton();
    expect(afterLeft).toBeDefined();

    // Home -> erster Tab
    fireEvent.keyDown(tablist, { key: 'Home' });
    const activeHome = getActiveTabButton();
    expect(activeHome).toHaveAttribute('id', expect.stringMatching(/^usecase-tab-/));

    // End -> letzter Tab
    fireEvent.keyDown(tablist, { key: 'End' });
    const activeEnd = getActiveTabButton();
    expect(activeEnd).toHaveAttribute('id', expect.stringMatching(/^usecase-tab-/));
  });

  test('deep-linking via URL param selects correct tab', () => {
    // developers per Query setzen
    window.history.pushState({}, '', '/?use-cases=developers');
    render(
      <RecoilRoot>
        <UseCasesSection />
      </RecoilRoot>,
    );

    // aktives Panel ist developers
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'usecase-panel-developers');

    // und der zugehörige Tab ist ausgewählt (stabile ID)
    const tab = document.getElementById('usecase-tab-developers');
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  test('renders JSON-LD ItemList with items', () => {
    render(
      <RecoilRoot>
        <UseCasesSection />
      </RecoilRoot>,
    );
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);
    const json = JSON.parse(scripts[0].textContent || '{}');
    expect(json['@type']).toBe('ItemList');
    expect(Array.isArray(json.itemListElement)).toBe(true);
    expect(json.itemListElement.length).toBeGreaterThan(0);
  });
});
