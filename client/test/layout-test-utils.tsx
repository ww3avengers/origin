import './matchMedia.mock';
import React, { type ReactElement, type ReactNode } from 'react';
import { render as rtlRender } from '@testing-library/react';
import type { RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from '~/hooks/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

const client = new QueryClient();

type RenderOptions = Parameters<typeof rtlRender>[1] | undefined;

function renderWithProvidersWrapper(ui: ReactElement, options?: RenderOptions): RenderResult {
  function Wrapper({ children }: { children?: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <RecoilRoot>
          <Router>
            <AuthContextProvider
              authConfig={{
                loginRedirect: '',
                test: true,
              }}
            >
              {children}
            </AuthContextProvider>
          </Router>
        </RecoilRoot>
      </QueryClientProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}
export * from '@testing-library/react';
export { renderWithProvidersWrapper as render };
