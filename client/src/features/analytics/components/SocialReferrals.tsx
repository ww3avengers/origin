import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useSocialReferrals } from '../adminApi';

export default function SocialReferrals() {
  const [platform, setPlatform] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useSocialReferrals(platform);

  const grouped = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data ?? []) {
      const key = r.platform || 'unknown';
      m.set(key, (m.get(key) || 0) + Number(r.visits || 0));
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-medium">Social Referrals</h2>
        <select
          className="rounded border border-white/20 bg-transparent px-2 py-1 text-sm"
          value={platform ?? ''}
          onChange={(e) => setPlatform(e.target.value || undefined)}
        >
          <option value="">Alle Plattformen</option>
          <option value="twitter">Twitter/X</option>
          <option value="linkedin">LinkedIn</option>
          <option value="github">GitHub</option>
          <option value="reddit">Reddit</option>
          <option value="youtube">YouTube</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-4">Lade Referrals…</div>
      ) : error ? (
        <div className="p-4 text-red-500">Fehler beim Laden der Referrals.</div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grouped}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
