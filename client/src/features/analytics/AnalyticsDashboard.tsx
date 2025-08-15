import { useAnalyticsOverview } from './api';
import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import Funnels from './components/Funnels';
import SocialReferrals from './components/SocialReferrals';

export default function AnalyticsDashboard() {
  const { data, isLoading, error } = useAnalyticsOverview();

  const visitsData = useMemo(
    () => data?.visits?.map((v) => ({ d: v.d, visits: v.visits })) ?? [],
    [data],
  );
  const uniquesData = useMemo(
    () => data?.uniques?.map((v) => ({ d: v.d, uniques: v.uniques })) ?? [],
    [data],
  );

  if (isLoading) return <div className="p-6">Lade Analytics…</div>;
  if (error) return <div className="p-6 text-red-500">Fehler beim Laden.</div>;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Analytics Übersicht</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-foreground/5 p-4">
          <h2 className="mb-2 font-medium">Besuche</h2>
          <div className="h-64 text-muted-foreground/30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitsData}>
                <defs>
                  <linearGradient id="visits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                <XAxis dataKey="d" hide />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#34d399"
                  fillOpacity={1}
                  fill="url(#visits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-foreground/5 p-4">
          <h2 className="mb-2 font-medium">Unique Visitors</h2>
          <div className="h-64 text-muted-foreground/30">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uniquesData}>
                <defs>
                  <linearGradient id="uniques" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                <XAxis dataKey="d" hide />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="uniques"
                  stroke="#60a5fa"
                  fillOpacity={1}
                  fill="url(#uniques)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-foreground/5 p-4">
          <h2 className="mb-2 font-medium">Top Seiten</h2>
          <div className="h-64 text-muted-foreground/30">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(data?.topPages ?? []).map((t) => ({
                  name: t.url ?? '(direct)',
                  value: t.c,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-foreground/5 p-4">
          <h2 className="mb-2 font-medium">Top UTM Sources</h2>
          <div className="h-64 text-muted-foreground/30">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.utm ?? []).map((t) => ({ name: t.source, value: t.c }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Funnels />
        <SocialReferrals />
      </div>
    </div>
  );
}
