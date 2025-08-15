import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAnalyticsEnabled, setAnalyticsEnabled } from '@/lib/analytics/track';

type Settings = {
  id: number;
  retention_days: number;
  bot_threshold: number;
  allow_raw_ip: boolean;
  updated_at: string;
};

type BlockItem = {
  id: number;
  type: 'ip' | 'user_agent' | 'referrer';
  pattern: string;
  reason: string | null;
  created_at: string;
};

type Webhook = { id: number; url: string; event: string; is_enabled: boolean; created_at: string };

type ApiKey = {
  id: number;
  label: string | null;
  scope: string;
  created_at: string;
  revoked_at: string | null;
};

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function AdminSettings() {
  const qc = useQueryClient();
  const { t: tBase } = useTranslation();
  // Ensure typed string return for all translations to satisfy strict i18n typings
  const t = (key: string, options?: Record<string, unknown>) =>
    tBase(key as any, options) as string;
  const [tab, setTab] = useState<'settings' | 'blocklist' | 'webhooks' | 'keys'>('settings');

  // Settings
  const settingsQ = useQuery({
    queryKey: ['analytics', 'admin', 'settings'],
    queryFn: () => getJSON<Settings>('/api/analytics/admin/settings'),
  });
  const updateSettings = useMutation({
    mutationFn: async (body: Partial<Settings>) => {
      const res = await fetch('/api/analytics/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics', 'admin', 'settings'] }),
  });

  // Blocklist
  const blocklistQ = useQuery({
    queryKey: ['analytics', 'admin', 'blocklist'],
    queryFn: () => getJSON<BlockItem[]>('/api/analytics/admin/blocklist'),
  });
  const addBlock = useMutation({
    mutationFn: async (body: { type: BlockItem['type']; pattern: string; reason?: string }) => {
      const res = await fetch('/api/analytics/admin/blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics', 'admin', 'blocklist'] }),
  });
  const delBlock = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/analytics/admin/blocklist/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics', 'admin', 'blocklist'] }),
  });

  // Webhooks
  const webhooksQ = useQuery({
    queryKey: ['analytics', 'admin', 'webhooks'],
    queryFn: () => getJSON<Webhook[]>('/api/analytics/admin/webhooks'),
  });
  const addWebhook = useMutation({
    mutationFn: async (body: { url: string; event: string; secret?: string }) => {
      const res = await fetch('/api/analytics/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics', 'admin', 'webhooks'] }),
  });
  const delWebhook = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/analytics/admin/webhooks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics', 'admin', 'webhooks'] }),
  });

  // API Keys
  const keysQ = useQuery({
    queryKey: ['analytics', 'admin', 'api-keys'],
    queryFn: () => getJSON<ApiKey[]>('/api/analytics/admin/api-keys'),
  });
  const createKey = useMutation({
    mutationFn: async (body: { label?: string; scope?: string }) => {
      const res = await fetch('/api/analytics/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{
        id: number;
        label: string | null;
        scope: string;
        created_at: string;
        api_key: string;
      }>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics', 'admin', 'api-keys'] }),
  });
  const delKey = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/analytics/admin/api-keys/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      return true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['analytics', 'admin', 'api-keys'] }),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('analytics.admin.title')}</h1>
      </div>

      <div className="tabs tabs-boxed w-fit" role="tablist" aria-label={t('analytics.admin.title')}>
        <button
          className={`tab ${tab === 'settings' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={tab === 'settings'}
          aria-label={t('analytics.admin.tabs.settings')}
          onClick={() => setTab('settings')}
        >
          {t('analytics.admin.tabs.settings')}
        </button>
        <button
          className={`tab ${tab === 'blocklist' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={tab === 'blocklist'}
          aria-label={t('analytics.admin.tabs.blocklist')}
          onClick={() => setTab('blocklist')}
        >
          {t('analytics.admin.tabs.blocklist')}
        </button>
        <button
          className={`tab ${tab === 'webhooks' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={tab === 'webhooks'}
          aria-label={t('analytics.admin.tabs.webhooks')}
          onClick={() => setTab('webhooks')}
        >
          {t('analytics.admin.tabs.webhooks')}
        </button>
        <button
          className={`tab ${tab === 'keys' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={tab === 'keys'}
          aria-label={t('analytics.admin.tabs.keys')}
          onClick={() => setTab('keys')}
        >
          {t('analytics.admin.tabs.keys')}
        </button>
      </div>

      {tab === 'settings' && (
        <section className="card bg-base-200 max-w-xl space-y-4 p-4">
          {settingsQ.isLoading ? (
            <div>{t('analytics.admin.common.loading')}</div>
          ) : settingsQ.isError ? (
            <div className="text-red-500">{t('analytics.admin.common.error')}</div>
          ) : settingsQ.data ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                updateSettings.mutate({
                  retention_days: Number(fd.get('retention_days')),
                  bot_threshold: Number(fd.get('bot_threshold')),
                  allow_raw_ip: fd.get('allow_raw_ip') === 'on',
                });
              }}
              className="space-y-3"
            >
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    {t('analytics.admin.settings.retention_label')}
                  </span>
                </div>
                <input
                  name="retention_days"
                  type="number"
                  defaultValue={settingsQ.data.retention_days}
                  className="input input-bordered"
                  min={1}
                />
              </label>
              <label className="form-control">
                <div className="label">
                  <span className="label-text">
                    {t('analytics.admin.settings.bot_threshold_label')}
                  </span>
                </div>
                <input
                  name="bot_threshold"
                  type="number"
                  defaultValue={settingsQ.data.bot_threshold}
                  className="input input-bordered"
                  min={0}
                  max={100}
                />
              </label>
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  name="allow_raw_ip"
                  type="checkbox"
                  defaultChecked={settingsQ.data.allow_raw_ip}
                  className="checkbox"
                />
                <span className="label-text">
                  {t('analytics.admin.settings.allow_raw_ip_label')}
                </span>
              </label>

              {/* Client-side analytics toggle (local only) */}
              <div className="divider" />
              <div className="flex items-start gap-3">
                <input
                  id="client-analytics"
                  type="checkbox"
                  className="checkbox mt-1"
                  defaultChecked={isAnalyticsEnabled()}
                  onChange={(e) => setAnalyticsEnabled(e.currentTarget.checked)}
                />
                <label htmlFor="client-analytics" className="flex flex-col">
                  <span className="label-text font-medium">
                    {t('analytics.admin.settings.client_analytics_label')}
                  </span>
                  <span className="text-xs opacity-70">
                    {t('analytics.admin.settings.client_analytics_hint')}
                  </span>
                </label>
              </div>

              <button className="btn btn-primary" type="submit" disabled={updateSettings.isLoading}>
                {t('analytics.admin.settings.save')}
              </button>
            </form>
          ) : null}
        </section>
      )}

      {tab === 'blocklist' && (
        <section className="space-y-4">
          <form
            className="card bg-base-200 grid max-w-4xl grid-cols-1 gap-3 p-4 md:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addBlock.mutate({
                type: fd.get('type') as any,
                pattern: String(fd.get('pattern') || ''),
                reason: String(fd.get('reason') || '') || undefined,
              });
              e.currentTarget.reset();
            }}
          >
            <select
              name="type"
              className="select select-bordered"
              defaultValue="ip"
              aria-label={t('analytics.admin.blocklist.type')}
            >
              <option value="ip">{t('analytics.admin.blocklist.type_ip')}</option>
              <option value="user_agent">{t('analytics.admin.blocklist.type_user_agent')}</option>
              <option value="referrer">{t('analytics.admin.blocklist.type_referrer')}</option>
            </select>
            <input
              name="pattern"
              className="input input-bordered"
              placeholder={t('analytics.admin.blocklist.add_placeholder_pattern')}
              aria-label={t('analytics.admin.blocklist.add_placeholder_pattern')}
              required
            />
            <input
              name="reason"
              className="input input-bordered"
              placeholder={t('analytics.admin.blocklist.add_placeholder_reason')}
              aria-label={t('analytics.admin.blocklist.add_placeholder_reason')}
            />
            <button
              className="btn btn-primary"
              type="submit"
              aria-label={t('analytics.admin.blocklist.add_button')}
              disabled={addBlock.isLoading}
            >
              {t('analytics.admin.blocklist.add_button')}
            </button>
          </form>

          <div className="card bg-base-200 p-4">
            {blocklistQ.isLoading ? (
              <div>{t('analytics.admin.common.loading')}</div>
            ) : blocklistQ.isError ? (
              <div className="text-red-500">{t('analytics.admin.common.error')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-sm table">
                  <thead>
                    <tr>
                      <th scope="col">{t('analytics.admin.blocklist.type')}</th>
                      <th scope="col">{t('analytics.admin.blocklist.pattern')}</th>
                      <th scope="col">{t('analytics.admin.blocklist.reason')}</th>
                      <th scope="col">{t('analytics.admin.blocklist.created')}</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocklistQ.data?.map((b) => (
                      <tr key={b.id}>
                        <td>{b.type}</td>
                        <td className="max-w-[360px] truncate" title={b.pattern}>
                          {b.pattern}
                        </td>
                        <td className="max-w-[260px] truncate" title={b.reason || ''}>
                          {b.reason || '-'}
                        </td>
                        <td>{new Date(b.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-xs btn-error"
                            aria-label={t('analytics.admin.blocklist.delete')}
                            onClick={() => delBlock.mutate(b.id)}
                            disabled={delBlock.isLoading}
                          >
                            {t('analytics.admin.blocklist.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'webhooks' && (
        <section className="space-y-4">
          <form
            className="card bg-base-200 grid max-w-4xl grid-cols-1 gap-3 p-4 md:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addWebhook.mutate({
                url: String(fd.get('url') || ''),
                event: String(fd.get('event') || ''),
                secret: String(fd.get('secret') || '') || undefined,
              });
              e.currentTarget.reset();
            }}
          >
            <input
              name="url"
              className="input input-bordered"
              placeholder={t('analytics.admin.webhooks.add_placeholder_url')}
              aria-label={t('analytics.admin.webhooks.add_placeholder_url')}
              required
            />
            <input
              name="event"
              className="input input-bordered"
              placeholder={t('analytics.admin.webhooks.add_placeholder_event')}
              aria-label={t('analytics.admin.webhooks.add_placeholder_event')}
              required
            />
            <input
              name="secret"
              className="input input-bordered"
              placeholder={t('analytics.admin.webhooks.add_placeholder_secret')}
              aria-label={t('analytics.admin.webhooks.add_placeholder_secret')}
            />
            <button
              className="btn btn-primary"
              type="submit"
              aria-label={t('analytics.admin.webhooks.add_button')}
              disabled={addWebhook.isLoading}
            >
              {t('analytics.admin.webhooks.add_button')}
            </button>
          </form>

          <div className="card bg-base-200 p-4">
            {webhooksQ.isLoading ? (
              <div>{t('analytics.admin.common.loading')}</div>
            ) : webhooksQ.isError ? (
              <div className="text-red-500">{t('analytics.admin.common.error')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-sm table">
                  <thead>
                    <tr>
                      <th scope="col">{t('analytics.admin.webhooks.url')}</th>
                      <th scope="col">{t('analytics.admin.webhooks.event')}</th>
                      <th scope="col">{t('analytics.admin.webhooks.enabled')}</th>
                      <th scope="col">{t('analytics.admin.webhooks.created')}</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooksQ.data?.map((w) => (
                      <tr key={w.id}>
                        <td className="max-w-[300px] truncate" title={w.url}>
                          {w.url}
                        </td>
                        <td>{w.event}</td>
                        <td>
                          {w.is_enabled
                            ? t('analytics.admin.booleans.yes')
                            : t('analytics.admin.booleans.no')}
                        </td>
                        <td>{new Date(w.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-xs btn-error"
                            aria-label={t('analytics.admin.webhooks.delete')}
                            onClick={() => delWebhook.mutate(w.id)}
                            disabled={delWebhook.isLoading}
                          >
                            {t('analytics.admin.webhooks.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'keys' && (
        <section className="space-y-4">
          <CreateKey
            t={t}
            onCreate={async (label, scope) => {
              const r = await createKey.mutateAsync({ label, scope });

              alert(t('analytics.admin.keys.create.alert', { key: r.api_key }));
            }}
            creating={createKey.isLoading}
          />

          <div className="card bg-base-200 p-4">
            {keysQ.isLoading ? (
              <div>{t('analytics.admin.common.loading')}</div>
            ) : keysQ.isError ? (
              <div className="text-red-500">{t('analytics.admin.common.error')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-sm table">
                  <thead>
                    <tr>
                      <th scope="col">{t('analytics.admin.keys.list.label')}</th>
                      <th scope="col">{t('analytics.admin.keys.list.scope')}</th>
                      <th scope="col">{t('analytics.admin.keys.list.created')}</th>
                      <th scope="col">{t('analytics.admin.keys.list.status')}</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {keysQ.data?.map((k) => (
                      <tr key={k.id}>
                        <td>{k.label || '-'}</td>
                        <td>{k.scope}</td>
                        <td>{new Date(k.created_at).toLocaleString()}</td>
                        <td>
                          {k.revoked_at
                            ? t('analytics.admin.keys.list.status_revoked')
                            : t('analytics.admin.keys.list.status_active')}
                        </td>
                        <td>
                          <button
                            className="btn btn-xs btn-error"
                            aria-label={t('analytics.admin.keys.list.delete')}
                            onClick={() => delKey.mutate(k.id)}
                            disabled={delKey.isLoading}
                          >
                            {t('analytics.admin.keys.list.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function CreateKey({
  t,
  onCreate,
  creating,
}: {
  t: (key: string, options?: Record<string, unknown>) => string;
  onCreate: (label?: string, scope?: string) => void | Promise<void>;
  creating: boolean;
}) {
  const [label, setLabel] = useState('');
  const [scope, setScope] = useState('admin');
  return (
    <form
      className="card bg-base-200 grid max-w-3xl grid-cols-1 gap-3 p-4 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        onCreate(label || undefined, scope || undefined);
        setLabel('');
        setScope('admin');
      }}
    >
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="input input-bordered"
        placeholder={t('analytics.admin.keys.create.placeholder_label')}
      />
      <select
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className="select select-bordered"
      >
        <option value="admin">admin</option>
      </select>
      <button className="btn btn-primary" type="submit" disabled={creating}>
        {t('analytics.admin.keys.create.button')}
      </button>
    </form>
  );
}
