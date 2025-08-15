import { useQuery } from '@tanstack/react-query';

export type DateRange = { from?: string; to?: string };

function qs(params?: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function useSummary(range?: DateRange) {
  const q = qs({ from: range?.from, to: range?.to });
  return useQuery({
    queryKey: ['analytics', 'admin', 'summary', range?.from, range?.to],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/admin/metrics/summary${q}`);
      if (!res.ok) throw new Error('summary_failed');
      return res.json() as Promise<
        Array<{ day: string; visits: number; bot_visits: number; human_visits: number }>
      >;
    },
  });
}

export function useEventCounts(type?: string, range?: DateRange) {
  const q = qs({ type, from: range?.from, to: range?.to });
  return useQuery({
    queryKey: ['analytics', 'admin', 'events', type, range?.from, range?.to],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/admin/metrics/events${q}`);
      if (!res.ok) throw new Error('events_failed');
      return res.json() as Promise<Array<{ day: string; type: string; cnt: number }>>;
    },
  });
}

export function useFunnelMasToFaq(range?: DateRange) {
  const q = qs({ from: range?.from, to: range?.to });
  return useQuery({
    queryKey: ['analytics', 'admin', 'funnel_mas_to_faq', range?.from, range?.to],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/admin/metrics/funnels/mas_to_faq${q}`);
      if (!res.ok) throw new Error('funnel_failed');
      return res.json() as Promise<
        Array<{ day: string; visits: number; faq_mas: number; conv_rate_pct: number }>
      >;
    },
  });
}

export function useSocialReferrals(platform?: string, range?: DateRange) {
  const q = qs({ platform, from: range?.from, to: range?.to });
  return useQuery({
    queryKey: ['analytics', 'admin', 'social_referrals', platform, range?.from, range?.to],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/admin/metrics/referrals/social${q}`);
      if (!res.ok) throw new Error('referrals_failed');
      return res.json() as Promise<
        Array<{ day: string; platform: string; sm_user: string; visits: number }>
      >;
    },
  });
}
