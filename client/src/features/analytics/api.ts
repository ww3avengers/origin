import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const OverviewPoint = z
  .object({
    d: z.string().or(z.date()).optional(),
    visits: z.number().optional(),
    uniques: z.number().optional(),
    bots: z.number().optional(),
    total: z.number().optional(),
  })
  .partial();
const TopItem = z.object({ url: z.string().nullable().optional(), c: z.number() });
const UTMItem = z.object({ source: z.string(), c: z.number() });

const OverviewResponse = z.object({
  visits: z.array(z.object({ d: z.string(), visits: z.number() })).default([]),
  uniques: z.array(z.object({ d: z.string(), uniques: z.number() })).default([]),
  topPages: z.array(TopItem).default([]),
  utm: z.array(UTMItem).default([]),
  bots: z.array(z.object({ d: z.string(), bots: z.number(), total: z.number() })).default([]),
  from: z.any().optional(),
  to: z.any().optional(),
});

export function useAnalyticsOverview(params?: { from?: string; to?: string }) {
  const sp = new URLSearchParams();
  if (params?.from) sp.set('from', params.from);
  if (params?.to) sp.set('to', params.to);
  const qs = sp.toString();

  return useQuery({
    queryKey: ['analytics', 'overview', params?.from, params?.to],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/overview${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch analytics overview');
      const json = await res.json();
      return OverviewResponse.parse(json);
    },
  });
}
