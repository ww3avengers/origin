import 'test/matchMedia.mock';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { LangSelector } from './General';
import { RecoilRoot } from 'recoil';

describe('LangSelector', () => {
  let mockOnChange: (value: string) => void;

  beforeEach(() => {
    mockOnChange = jest.fn();
  });

  it('renders correctly', () => {
    global.ResizeObserver = class MockedResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    };
    const { getByText, getByRole } = render(
      <RecoilRoot>
        <LangSelector langcode="en-US" onChange={mockOnChange} />
      </RecoilRoot>,
    );

    // i18n-agnostisch: akzeptiere Klartext oder Key-Fallback
    expect(getByText(/(Language|com_nav_language)/i)).toBeInTheDocument();
    const dropdownButton = getByRole('combobox');
    expect(dropdownButton).toHaveTextContent(/(English|com_nav_lang_english)/i);
  });

  it('calls onChange when the select value changes', async () => {
    global.ResizeObserver = class MockedResizeObserver {
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    };
    const { getByRole, getByTestId } = render(
      <RecoilRoot>
        <LangSelector langcode="en-US" onChange={mockOnChange} />
      </RecoilRoot>,
    );

    expect(getByRole('combobox')).toHaveTextContent(/(English|com_nav_lang_english)/i);

    const dropdownButton = getByTestId('dropdown-menu');

    fireEvent.click(dropdownButton);

    const italianOption = getByRole('option', { name: /(Italiano|com_nav_lang_italian)/i });
    fireEvent.click(italianOption);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('it-IT');
    });
  });
});
