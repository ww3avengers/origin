import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFunnelMasToFaq } from '../adminApi';

export default function Funnels() {
  const { data, isLoading, error } = useFunnelMasToFaq();

  if (isLoading) return <div className="p-4">Lade Funnel…</div>;
  if (error) return <div className="p-4 text-red-500">Fehler beim Laden des Funnels.</div>;

  const chartData = (data ?? []).map((d) => ({
    d: d.day,
    visits: d.visits,
    faq: d.faq_mas,
    conv: d.conv_rate_pct,
  }));

  return (
    <div className="rounded-xl bg-white/5 p-4">
      <h2 className="mb-2 font-medium">Funnel: MAS → FAQ</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
            <XAxis dataKey="d" hide />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="visits" stroke={"rgb(var(--rgb-brand-purple))"} name="Besuche" />
            <Line yAxisId="left" type="monotone" dataKey="faq" stroke="#f472b6" name="FAQ (mas)" />
            <Line yAxisId="right" type="monotone" dataKey="conv" stroke="#34d399" name="Conv %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
