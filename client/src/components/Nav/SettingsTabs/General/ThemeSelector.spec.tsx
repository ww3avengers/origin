// ThemeSelector.spec.tsx
import 'test/matchMedia.mock';

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RecoilRoot } from 'recoil';

// Mock the UI kit Dropdown to a simple <select> for stable testing
jest.mock('@librechat/client', () => {
  const React = require('react');
  return {
    __esModule: true,
    Dropdown: ({
      value,
      onChange,
      options,
      testId,
    }: {
      value: string;
      onChange: (v: string) => void;
      options: Array<{ value: string; label: React.ReactNode }>;
      testId?: string;
    }) => (
      <select
        data-testid={testId}
        aria-label="theme"
        role="combobox"
        value={value}
        onChange={(e) => onChange((e.target as HTMLSelectElement).value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    ),
    ThemeContext: React.createContext({ theme: 'system', setTheme: () => {} }),
  };
});

import { ThemeSelector } from './General';

describe('ThemeSelector', () => {
  let mockOnChange: jest.Mock;

  beforeEach(() => {
    mockOnChange = jest.fn();
  });

  it('renders correctly', () => {
    global.ResizeObserver = class MockedResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    };
    const { getByTestId } = render(
      <RecoilRoot>
        <ThemeSelector theme="system" onChange={mockOnChange} />
      </RecoilRoot>,
    );

    // ensure our test id is present for interactions
    expect(getByTestId('theme-selector')).toBeInTheDocument();
  });

  it('calls onChange when the select value changes', async () => {
    global.ResizeObserver = class MockedResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    };
    const { getByTestId, getByRole } = render(
      <RecoilRoot>
        <ThemeSelector theme="system" onChange={mockOnChange} />
      </RecoilRoot>,
    );

    // Change selection via native change event on the mocked <select>
    const selectEl = getByTestId('theme-selector') as HTMLSelectElement;
    expect(selectEl).toBeInTheDocument();
    fireEvent.change(selectEl, { target: { value: 'dark' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('dark');
    });
  });
});
