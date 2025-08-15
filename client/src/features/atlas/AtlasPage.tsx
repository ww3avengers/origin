import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { track } from '~/lib/analytics/track';

// Einfache API-Utils (fetch-basiert) – könnte später durch axios/http-client ersetzt werden
async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

export default function AtlasPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<{ ok: boolean; service: string; version: string } | null>(
    null,
  );
  const [datasets, setDatasets] = useState<
    Array<{ id: string; label: string; dims: number; vectors: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Page impression
    track({ name: 'atlas_view', props: {} });
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [s, d] = await Promise.all([
          apiGet<{ ok: boolean; service: string; version: string }>('/api/atlas/status'),
          apiGet<Array<{ id: string; label: string; dims: number; vectors: number }>>(
            '/api/atlas/datasets',
          ),
        ]);
        if (!cancelled) {
          setStatus(s);
          setDatasets(d);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pageTitle = useMemo(() => t('admin.atlas.title'), [t]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.atlas.subtitle')}</p>
      </div>

      {loading && (
        <div role="status" aria-live="polite" className="text-sm">
          {t('admin.atlas.loading')}
        </div>
      )}

      {error && (
        <div role="alert" className="text-sm text-red-600">
          {t('admin.atlas.error')}: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="col-span-1 rounded-lg border p-4">
            <h2 className="mb-2 font-medium">{t('admin.atlas.status.title')}</h2>
            {status ? (
              <ul className="space-y-1 text-sm">
                <li>
                  <span className="text-muted-foreground">{t('admin.atlas.status.service')}:</span>{' '}
                  {status.service}
                </li>
                <li>
                  <span className="text-muted-foreground">{t('admin.atlas.status.version')}:</span>{' '}
                  {status.version}
                </li>
                <li>
                  <span className="text-muted-foreground">{t('admin.atlas.status.ok')}:</span>{' '}
                  {String(status.ok)}
                </li>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t('admin.atlas.status.unavailable')}</p>
            )}
          </section>

          <section className="col-span-2 rounded-lg border p-4">
            <h2 className="mb-2 font-medium">{t('admin.atlas.datasets.title')}</h2>
            {datasets.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.atlas.datasets.empty')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">{t('admin.atlas.datasets.cols.id')}</th>
                      <th className="py-2 pr-4">{t('admin.atlas.datasets.cols.label')}</th>
                      <th className="py-2 pr-4">{t('admin.atlas.datasets.cols.dims')}</th>
                      <th className="py-2 pr-4">{t('admin.atlas.datasets.cols.vectors')}</th>
                      <th className="py-2 pr-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map((d) => (
                      <tr key={d.id} className="border-t">
                        <td className="py-2 pr-4 font-mono">{d.id}</td>
                        <td className="py-2 pr-4">{d.label}</td>
                        <td className="py-2 pr-4">{d.dims}</td>
                        <td className="py-2 pr-4">{d.vectors.toLocaleString()}</td>
                        <td className="py-2 pr-4">
                          <button
                            className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground hover:opacity-90"
                            onClick={async () => {
                              try {
                                track({
                                  name: 'atlas_nn_search',
                                  props: { datasetId: d.id, k: 5 },
                                });
                                const res = await apiPost<{ results: any[] }>(
                                  '/api/atlas/nn-search',
                                  {
                                    datasetId: d.id,
                                    queryVector: Array.from({ length: d.dims }).map(() => 0),
                                    k: 5,
                                  },
                                );
                                // Placeholder: Zeige Anzahl als Bestätigung
                                alert(`${t('admin.atlas.search.ok')}: ${res.results?.length ?? 0}`);
                              } catch (e: any) {
                                alert(`${t('admin.atlas.search.fail')}: ${e?.message || 'Error'}`);
                              }
                            }}
                          >
                            {t('admin.atlas.actions.previewSearch')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
