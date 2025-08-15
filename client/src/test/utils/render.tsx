import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '~/locales/i18n';
import { RecoilRoot } from 'recoil';

export const renderWithProviders = (ui: React.ReactElement): ReturnType<typeof render> => {
  const qc = new QueryClient();
  return render(
    <I18nextProvider i18n={i18n}>
      <RecoilRoot>
        <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
      </RecoilRoot>
    </I18nextProvider>,
  );
};

export * from '@testing-library/react';
