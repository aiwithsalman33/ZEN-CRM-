import type { AppState } from '@/store/store';

const isToday = (iso?: string) => {
  if (!iso) return false;
  const d = new Date(iso); const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};
const withinDays = (iso: string, days: number) => Date.now() - new Date(iso).getTime() <= days * 86400000;

export function dashboardMetrics(s: AppState) {
  const activeDeals = s.deals.filter((d) => d.status === 'open');
  const activeValue = activeDeals.reduce((a, d) => a + d.value, 0);
  const wonDeals = s.deals.filter((d) => d.status === 'won');
  const lostDeals = s.deals.filter((d) => d.status === 'lost');
  const revenueThisMonth = wonDeals.reduce((a, d) => a + d.value, 0);
  const followUpsDue = s.leads.filter((l) => l.nextFollowUp && new Date(l.nextFollowUp).getTime() <= Date.now() + 86400000 && l.status !== 'Junk' && l.status !== 'Not Interested').length;
  const callsToday = s.callLogs.filter((c) => isToday(c.timestamp)).length;
  const wonThisWeek = wonDeals.filter((d) => withinDays(d.lastActivity, 7)).length;

  // Pipeline funnel
  const funnel = [
    { name: 'New Leads', value: s.leads.filter((l) => l.status === 'New').length, color: '#3B82F6' },
    { name: 'Contacted', value: s.leads.filter((l) => l.status === 'Contacted').length, color: '#8B5CF6' },
    { name: 'Qualified', value: s.leads.filter((l) => l.status === 'Qualified').length, color: '#FF6B35' },
    { name: 'Proposal', value: s.deals.filter((d) => d.stage === 'proposal').length, color: '#F59E0B' },
    { name: 'Negotiation', value: s.deals.filter((d) => d.stage === 'negotiation').length, color: '#2DD4BF' },
    { name: 'Won', value: wonDeals.length, color: '#22C55E' },
  ];

  // Lead source breakdown
  const sourceMap = new Map<string, number>();
  s.leads.forEach((l) => sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1));
  const leadSources = [...sourceMap.entries()].map(([name, value]) => ({ name, value }));

  // Revenue vs target — last 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const base = Math.max(revenueThisMonth, 700000);
  const revenueTrend = months.map((mo, i) => ({
    month: mo,
    revenue: Math.round(base * (0.55 + i * 0.09 + (i % 2 ? 0.04 : -0.02))),
    target: Math.round(base * 0.9),
  }));

  // Leaderboard
  const teamRevenue = s.team.reduce((a, m) => a + m.stats.revenue, 0);
  const leaderboard = [...s.team]
    .sort((a, b) => b.stats.revenue - a.stats.revenue)
    .map((m) => ({ id: m.id, name: m.name, calls: m.stats.calls, connected: m.stats.connected, dealsWon: m.stats.dealsWon, revenue: m.stats.revenue, pct: teamRevenue ? Math.round((m.stats.revenue / teamRevenue) * 100) : 0 }));

  // Feeds
  const todaysActivities = s.activities
    .filter((a) => isToday(a.timestamp))
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .slice(0, 12);
  const upcomingFollowUps = s.leads
    .filter((l) => l.nextFollowUp && new Date(l.nextFollowUp).getTime() >= Date.now() - 2 * 86400000)
    .sort((a, b) => +new Date(a.nextFollowUp!) - +new Date(b.nextFollowUp!))
    .slice(0, 5);
  const recentDeals = [...s.deals]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 8);

  return {
    totalLeads: s.leads.length,
    activeDeals: activeDeals.length,
    activeValue,
    revenueThisMonth,
    revenueTarget: 6000000,
    followUpsDue,
    callsToday,
    wonThisWeek,
    winRate: wonDeals.length + lostDeals.length ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100) : 0,
    funnel,
    leadSources,
    revenueTrend,
    leaderboard,
    todaysActivities,
    upcomingFollowUps,
    recentDeals,
  };
}

export const SOURCE_COLORS: Record<string, string> = {
  'FB Ads': '#3B82F6',
  Instagram: '#EC4899',
  WhatsApp: '#22C55E',
  'Web Form': '#64748B',
  Referral: '#8B5CF6',
  'Cold Call': '#FF6B35',
  Google: '#EF4444',
};
