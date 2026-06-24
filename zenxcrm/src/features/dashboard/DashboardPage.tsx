import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  PhoneIncoming, Briefcase, DollarSign, Phone, Clock, Trophy, Phone as PhoneCall,
} from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam } from '@/store/selectors';
import { StatCard, ProgressBar, Avatar, StatusBadge, Button } from '@/components/ui';
import { formatCurrency, formatCurrencyFull, formatDate, formatTime, timeAgo } from '@/lib/utils';
import { dashboardMetrics, SOURCE_COLORS } from './metrics';
import { TeamStatusBar } from './TeamStatusBar';

const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, action, children, className }) => (
  <div className={`card p-5 ${className ?? ''}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const rankMedal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

const DashboardPage: React.FC = () => {
  const { state } = useStore();
  const { nameOf } = useTeam();
  const m = useMemo(() => dashboardMetrics(state), [state]);
  const [range, setRange] = useState<'Today' | 'Week' | 'Month'>('Month');
  const maxFunnel = Math.max(...m.funnel.map((f) => f.value), 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-ink">Welcome back, {nameOf(state.currentUserId).split(' ')[0]} 👋</h2>
          <p className="text-sm text-muted mt-0.5">Here's your revenue snapshot for today.</p>
        </div>
        <span className="text-sm text-muted">{formatDate(new Date().toISOString())}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={PhoneIncoming} label="Total Leads" value={m.totalLeads} change={12} accent="#3B82F6" />
        <StatCard icon={Briefcase} label="Active Deals" value={m.activeDeals} sub={formatCurrency(m.activeValue)} change={8} accent="#FF6B35" />
        <StatCard icon={DollarSign} label="Revenue (Month)" value={formatCurrency(m.revenueThisMonth)} change={15} accent="#22C55E" />
        <StatCard icon={Phone} label="Calls Today" value={m.callsToday} change={5} accent="#8B5CF6" />
        <StatCard icon={Clock} label="Follow-ups Due" value={m.followUpsDue} change={-3} accent="#F59E0B" />
        <StatCard icon={Trophy} label="Won Deals (Week)" value={m.wonThisWeek} change={20} accent="#2DD4BF" />
      </div>

      <TeamStatusBar />

      {/* Row 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Left 60% */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          <Section
            title="Pipeline Overview"
            action={
              <div className="inline-flex items-center p-0.5 rounded-lg bg-bg border border-line text-xs">
                {(['Today', 'Week', 'Month'] as const).map((r) => (
                  <button key={r} onClick={() => setRange(r)} className={`px-2.5 py-1 rounded-md font-medium ${range === r ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>{r}</button>
                ))}
              </div>
            }
          >
            <div className="flex flex-col gap-2.5">
              {m.funnel.map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-ink shrink-0">{f.name}</span>
                  <span className="w-8 text-xs font-semibold text-muted shrink-0">{f.value}</span>
                  <div className="flex-1 h-7 rounded-lg bg-bg overflow-hidden">
                    <div className="h-full rounded-lg flex items-center justify-end px-2 transition-all duration-500" style={{ width: `${Math.max(8, (f.value / maxFunnel) * 100)}%`, background: `linear-gradient(90deg, ${f.color}cc, ${f.color})` }}>
                      <span className="text-[11px] font-semibold text-white">{f.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Revenue vs Target">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={m.revenueTrend} margin={{ left: -8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => formatCurrencyFull(v)} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Actual Revenue" fill="#FF6B35" radius={[6, 6, 0, 0]} barSize={28} />
                <Line type="monotone" dataKey="target" name="Target" stroke="#0F172A" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* Right 40% */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          <Section title="Today's Activity">
            <div className="max-h-[280px] overflow-y-auto -mr-2 pr-2">
              {m.todaysActivities.length === 0 ? (
                <p className="text-sm text-muted py-4 text-center">No activity logged today.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {m.todaysActivities.map((a) => (
                    <li key={a.id} className="flex items-start gap-2.5">
                      <span className="text-[11px] text-muted w-10 shrink-0 pt-0.5">{timeAgo(a.timestamp)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink">{nameOf(a.agentId).split(' ')[0]} · {a.title}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>

          <Section title="Follow-ups Today" action={<span className="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">{m.upcomingFollowUps.length}</span>}>
            <ul className="flex flex-col gap-2">
              {m.upcomingFollowUps.map((l) => (
                <li key={l.id} className="flex items-center gap-2.5">
                  <Avatar name={l.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/leads/${l.id}`} className="text-sm font-medium text-ink truncate hover:text-primary block">{l.name}</Link>
                    <p className="text-xs text-muted">{l.phone} · {formatTime(l.nextFollowUp)}</p>
                  </div>
                  <Button size="sm" variant="secondary"><PhoneCall size={13} /> Call</Button>
                </li>
              ))}
              {m.upcomingFollowUps.length === 0 && <p className="text-sm text-muted py-2 text-center">No follow-ups due.</p>}
            </ul>
          </Section>

          <Section title="Lead Sources">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={m.leadSources} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {m.leadSources.map((e, i) => <Cell key={i} fill={SOURCE_COLORS[e.name] ?? '#94A3B8'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {m.leadSources.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: SOURCE_COLORS[s.name] ?? '#94A3B8' }} />
                  <span className="text-muted">{s.name}</span>
                  <span className="text-ink font-medium ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Section title="Agent Leaderboard" action={<span className="text-xs font-medium text-muted bg-bg px-2 py-1 rounded-md">This Month</span>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted border-b border-line">
                  <th className="text-left font-semibold py-2">#</th>
                  <th className="text-left font-semibold py-2">Agent</th>
                  <th className="text-right font-semibold py-2">Calls</th>
                  <th className="text-right font-semibold py-2">Conn.</th>
                  <th className="text-right font-semibold py-2">Won</th>
                  <th className="text-right font-semibold py-2">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {m.leaderboard.map((p, i) => (
                  <tr key={p.id}>
                    <td className="py-2.5 text-base">{rankMedal(i)}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2"><Avatar name={p.name} size="sm" /><span className="font-medium text-ink">{p.name}</span></div>
                    </td>
                    <td className="text-right text-muted">{p.calls}</td>
                    <td className="text-right text-muted">{p.connected}</td>
                    <td className="text-right text-muted">{p.dealsWon}</td>
                    <td className="text-right">
                      <span className="font-semibold text-ink block">{formatCurrency(p.revenue)}</span>
                      <ProgressBar value={p.pct} size="sm" className="mt-1 w-24 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Recent Deals" action={<Link to="/deals" className="text-xs font-medium text-primary hover:underline">View all</Link>}>
          <ul className="flex flex-col divide-y divide-line">
            {m.recentDeals.map((d) => (
              <li key={d.id}>
                <Link to={`/deals/${d.id}`} className="flex items-center gap-3 py-2.5 hover:bg-bg -mx-2 px-2 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{d.title}</p>
                    <p className="text-xs text-muted">{d.contactName} · {timeAgo(d.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary shrink-0">{formatCurrency(d.value)}</span>
                  <StatusBadge value={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
};

export default DashboardPage;
