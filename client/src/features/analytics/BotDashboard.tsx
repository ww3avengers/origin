import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

function formatDateLabel(v: string | number | Date) {
  const d = new Date(v);
  return d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
}

async function fetchOverview(): Promise<{
  from: string;
  to: string;
  timeseries: Array<{ d: string; bots: number; total: number }>;
  score_hist: Array<{ bucket: number; range: string; c: number }>;
  top_user_agents: Array<{ user_agent: string; c: number }>;
  top_referrers: Array<{ referrer: string; c: number }>;
  recent: Array<{
    id: number;
    ip: string;
    user_agent: string;
    url: string;
    referrer: string | null;
    bot_score: number | null;
    created_at: string;
  }>;
}> {
  const params = new URLSearchParams({});
  const res = await fetch(`/api/analytics/bots/overview?${params.toString()}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load bot overview');
  return res.json();
}

export default function BotDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', 'bots', 'overview'],
    queryFn: fetchOverview,
    staleTime: 60_000,
  });

  if (isLoading) return <div className="p-6">Lade Bot-Metriken…</div>;
  if (isError)
    return <div className="p-6 text-red-500">Fehler beim Laden: {(error as Error)?.message}</div>;
  if (!data) return null;

  const { timeseries, score_hist, top_user_agents, top_referrers, recent } = data;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bot-Dashboard</h1>
        <button className="btn btn-sm" onClick={() => refetch()}>
          Aktualisieren
        </button>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card bg-base-200 p-4">
          <h2 className="mb-2 font-medium">Bot‑Traffic über Zeit</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={timeseries} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="d" tickFormatter={formatDateLabel} />
                <YAxis />
                <Tooltip labelFormatter={(v) => formatDateLabel(v as string)} />
                <Line
                  type="monotone"
                  dataKey="bots"
                  stroke="#ef4444"
                  name="Bots"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  name="Gesamt"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-200 p-4">
          <h2 className="mb-2 font-medium">Bot‑Score Histogramm</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={score_hist} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="c" name="Anzahl" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card bg-base-200 p-4">
          <h2 className="mb-3 font-medium">Top User‑Agents (Bots)</h2>
          <ol className="list-inside list-decimal space-y-1">
            {top_user_agents?.map((ua) => (
              <li key={ua.user_agent} className="truncate">
                <span className="opacity-70">{ua.c}×</span> — {ua.user_agent}
              </li>
            ))}
          </ol>
        </div>

        <div className="card bg-base-200 p-4">
          <h2 className="mb-3 font-medium">Top Referrer (Bots)</h2>
          <ol className="list-inside list-decimal space-y-1">
            {top_referrers?.map((r) => (
              <li key={r.referrer} className="truncate">
                <span className="opacity-70">{r.c}×</span> — {r.referrer}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="card bg-base-200 p-4">
        <h2 className="mb-3 font-medium">Letzte Bot‑Hits</h2>
        <div className="overflow-x-auto">
          <table className="table-sm table">
            <thead>
              <tr>
                <th>Zeit</th>
                <th>IP</th>
                <th>Score</th>
                <th>User‑Agent</th>
                <th>URL</th>
                <th>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {recent?.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.ip}</td>
                  <td>{r.bot_score ?? '-'}</td>
                  <td className="max-w-[320px] truncate" title={r.user_agent}>
                    {r.user_agent}
                  </td>
                  <td className="max-w-[280px] truncate" title={r.url}>
                    {r.url}
                  </td>
                  <td className="max-w-[280px] truncate" title={r.referrer || ''}>
                    {r.referrer || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
