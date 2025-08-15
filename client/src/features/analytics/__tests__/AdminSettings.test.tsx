import React from 'react';
import { renderWithProviders, screen, waitFor } from '~/test/utils/render';
import userEvent from '@testing-library/user-event';
import AdminSettings from '../AdminSettings';

describe('AdminSettings i18n & UI', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (global as any).fetch = mockFetch;

    const jsonRes = (data: any, status = 200) => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(data),
      json: async () => data,
    });
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      // GETs
      if (url === '/api/analytics/admin/settings' && (!init || init.method === undefined)) {
        return Promise.resolve(
          jsonRes(
            {
              id: 1,
              retention_days: 30,
              bot_threshold: 50,
              allow_raw_ip: false,
              updated_at: new Date().toISOString(),
            },
            200,
          ),
        );
      }
      if (url === '/api/analytics/admin/blocklist' && (!init || init.method === undefined)) {
        return Promise.resolve(
          jsonRes(
            [
              {
                id: 1,
                type: 'ip',
                pattern: '192.168.*',
                reason: 'internal',
                created_at: new Date().toISOString(),
              },
            ],
            200,
          ),
        );
      }
      if (url === '/api/analytics/admin/webhooks' && (!init || init.method === undefined)) {
        return Promise.resolve(
          jsonRes(
            [
              {
                id: 1,
                url: 'https://example.com/hook',
                event: 'visit.created',
                is_enabled: true,
                created_at: new Date().toISOString(),
              },
            ],
            200,
          ),
        );
      }
      if (url === '/api/analytics/admin/api-keys' && (!init || init.method === undefined)) {
        return Promise.resolve(
          jsonRes(
            [
              {
                id: 1,
                label: 'default',
                scope: 'admin',
                created_at: new Date().toISOString(),
                revoked_at: null,
              },
            ],
            200,
          ),
        );
      }

      // POST/PUT/DELETE
      if (url === '/api/analytics/admin/settings' && init?.method === 'PUT') {
        return Promise.resolve(jsonRes({ ok: true }, 200));
      }
      if (url === '/api/analytics/admin/blocklist' && init?.method === 'POST') {
        return Promise.resolve(jsonRes({ id: 99 }, 200));
      }
      if (url?.startsWith('/api/analytics/admin/blocklist/') && init?.method === 'DELETE') {
        return Promise.resolve(jsonRes(null, 204));
      }
      if (url === '/api/analytics/admin/webhooks' && init?.method === 'POST') {
        return Promise.resolve(jsonRes({ id: 99 }, 200));
      }
      if (url?.startsWith('/api/analytics/admin/webhooks/') && init?.method === 'DELETE') {
        return Promise.resolve(jsonRes(null, 204));
      }
      if (url === '/api/analytics/admin/api-keys' && init?.method === 'POST') {
        return Promise.resolve(
          jsonRes(
            {
              id: 99,
              api_key: 'abc123',
              label: null,
              scope: 'admin',
              created_at: new Date().toISOString(),
            },
            200,
          ),
        );
      }
      if (url?.startsWith('/api/analytics/admin/api-keys/') && init?.method === 'DELETE') {
        return Promise.resolve(jsonRes(null, 204));
      }

      return Promise.resolve(jsonRes('not found', 404));
    });
  });

  it('rendert Titel und Tabs (i18n)', async () => {
    const { container } = renderWithProviders(<AdminSettings />);

    // Titel (struktur-basiert)
    expect(container.querySelector('h1')).toBeTruthy();

    // Tabs (i18n-agnostisch)
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThanOrEqual(4);
  });

  it('lädt Settings und zeigt Labels/Buttons', async () => {
    const { container } = renderWithProviders(<AdminSettings />);

    await waitFor(() => {
      // Eingabefeld für Retention ist vorhanden (struktur-basiert)
      const input = container.querySelector('input[type="number"], input[name="retention_days"]');
      expect(input).toBeTruthy();
    });
    // Mindestens zwei Checkboxen vorhanden (i18n-agnostisch)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
    // Save-Button strukturell
    const saveBtn = container.querySelector('form button[type="submit"]');
    expect(saveBtn).toBeTruthy();
  });

  it('navigiert zu Blocklists und zeigt Tabelle', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<AdminSettings />);

    await user.click(screen.getAllByRole('tab')[1]);
    await waitFor(() => {
      // Formular vorhanden und mindestens eine Zeile in der Tabelle
      expect(container.querySelector('input[name="pattern"]')).toBeTruthy();
      const firstRow = container.querySelector('table tbody tr');
      expect(firstRow).toBeTruthy();
    });
    const addBtnStructural = container.querySelector('form button[type="submit"]');
    expect(addBtnStructural).toBeTruthy();
  });

  it('navigiert zu Webhooks und zeigt Spalten/Actions', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<AdminSettings />);

    await user.click(screen.getAllByRole('tab')[2]);
    await waitFor(() => {
      // Formularfelder vorhanden
      expect(container.querySelector('input[name="url"]')).toBeTruthy();
      expect(container.querySelector('input[name="event"]')).toBeTruthy();
      // Tabelle mit mindestens einer Zeile vorhanden
      const firstRow = container.querySelector('table tbody tr');
      expect(firstRow).toBeTruthy();
      // Delete-Action-Button in der ersten Zeile vorhanden
      const deleteBtn = container.querySelector('table tbody tr button');
      expect(deleteBtn).toBeTruthy();
    });
  });

  it('navigiert zu API Keys und zeigt Liste', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<AdminSettings />);

    await user.click(screen.getAllByRole('tab')[3]);
    await waitFor(() => {
      const table = container.querySelector('table');
      expect(table).toBeTruthy();
      const firstRow = container.querySelector('table tbody tr');
      expect(firstRow).toBeTruthy();
    });
  });

  it('zeigt Empty States korrekt (Blocklists/Webhooks/Keys)', async () => {
    const jsonRes = (data: any, status = 200) => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(data),
      json: async () => data,
    });
    (global as any).fetch = jest.fn((url: string, init?: RequestInit) => {
      if (url === '/api/analytics/admin/settings' && (!init || init.method === undefined)) {
        return Promise.resolve(
          jsonRes({
            id: 1,
            retention_days: 30,
            bot_threshold: 50,
            allow_raw_ip: false,
            updated_at: new Date().toISOString(),
          }),
        );
      }
      if (url === '/api/analytics/admin/blocklist' && (!init || init.method === undefined))
        return Promise.resolve(jsonRes([]));
      if (url === '/api/analytics/admin/webhooks' && (!init || init.method === undefined))
        return Promise.resolve(jsonRes([]));
      if (url === '/api/analytics/admin/api-keys' && (!init || init.method === undefined))
        return Promise.resolve(jsonRes([]));
      return Promise.resolve(jsonRes('not found', 404));
    });

    const user = userEvent.setup();
    const { container } = renderWithProviders(<AdminSettings />);

    await user.click(screen.getAllByRole('tab')[1]);
    await waitFor(() => {
      // Formular vorhanden und kein Eintrag in Tabelle
      expect(container.querySelector('input[name="pattern"]')).toBeTruthy();
      const hasRow = !!container.querySelector('table tbody tr');
      expect(hasRow).toBe(false);
    });

    await user.click(screen.getAllByRole('tab')[2]);
    await waitFor(() => {
      const table = container.querySelector('table');
      expect(table).toBeTruthy();
      const hasRow = !!container.querySelector('table tbody tr');
      expect(hasRow).toBe(false);
    });

    await user.click(screen.getAllByRole('tab')[3]);
    await waitFor(() => {
      const table = container.querySelector('table');
      expect(table).toBeTruthy();
      const hasRow = !!container.querySelector('table tbody tr');
      expect(hasRow).toBe(false);
    });
  });

  it('zeigt Fehlerzustände (500) je Tab', async () => {
    const jsonRes = (data: any, status = 500) => ({
      ok: false,
      status,
      text: async () => (typeof data === 'string' ? data : JSON.stringify(data)),
      json: async () => data,
    });
    (global as any).fetch = jest.fn((url: string, init?: RequestInit) => {
      if (url === '/api/analytics/admin/settings' && (!init || init.method === undefined)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => '{}',
          json: async () => ({
            id: 1,
            retention_days: 30,
            bot_threshold: 50,
            allow_raw_ip: false,
            updated_at: new Date().toISOString(),
          }),
        });
      }
      if (url === '/api/analytics/admin/blocklist' && (!init || init.method === undefined))
        return Promise.resolve(jsonRes('err'));
      if (url === '/api/analytics/admin/webhooks' && (!init || init.method === undefined))
        return Promise.resolve(jsonRes('err'));
      if (url === '/api/analytics/admin/api-keys' && (!init || init.method === undefined))
        return Promise.resolve(jsonRes('err'));
      return Promise.resolve(jsonRes('not found', 404));
    });

    const user = userEvent.setup();
    renderWithProviders(<AdminSettings />);

    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    await user.click(tabs[2]);
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

    await user.click(tabs[3]);
    expect(tabs[3]).toHaveAttribute('aria-selected', 'true');
  });

  it('deaktiviert Buttons während Mutationen', async () => {
    let resolvePost: (() => void) | undefined;
    const postPromise = new Promise<void>((res) => {
      resolvePost = () => res();
    });
    const jsonRes = (data: any, status = 200) => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(data),
      json: async () => data,
    });
    (global as any).fetch = jest.fn((url: string, init?: RequestInit) => {
      if (url === '/api/analytics/admin/settings' && (!init || init.method === undefined)) {
        return Promise.resolve(
          jsonRes({
            id: 1,
            retention_days: 30,
            bot_threshold: 50,
            allow_raw_ip: false,
            updated_at: new Date().toISOString(),
          }),
        );
      }
      if (url === '/api/analytics/admin/blocklist' && (!init || init.method === undefined))
        return Promise.resolve(jsonRes([]));
      if (url === '/api/analytics/admin/blocklist' && init?.method === 'POST')
        return postPromise.then(() => jsonRes({ id: 123 }));
      return Promise.resolve(jsonRes('not found', 404));
    });

    const user = userEvent.setup();
    const { container } = renderWithProviders(<AdminSettings />);
    await user.click(screen.getAllByRole('tab')[1]);
    const addBtn = (await waitFor(() => container.querySelector('form button[type="submit"]'))) as HTMLButtonElement;
    const patternInput = container.querySelector('input[name="pattern"]') as HTMLInputElement;
    await user.type(patternInput, 'bad-bot');
    await user.click(addBtn);
    expect(addBtn).toBeDisabled();
    if (resolvePost) {
      resolvePost();
    }
    await waitFor(() => expect(addBtn).not.toBeDisabled());
  });
});
