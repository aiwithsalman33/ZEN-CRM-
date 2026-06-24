import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { BarChart3, Download } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, Tabs, StatCard, DateRangePicker, Avatar, type DateRange } from '@/components/ui';
import { DollarSign, Trophy, Percent, Users, Phone, Clock } from 'lucide-react';
import { formatCurrency, formatCurrencyFull, formatDuration, toCSV, download } from '@/lib/utils';
import { SOURCE_COLORS } from '@/features/dashboard/metrics';

const tabKeys = ['Sales', 'Leads', 'Calls', 'Activity', 'Team', 'Custom'] as const;
type Tab = typeof tabKeys[number];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="card p-5"><h3 className="text-sm font-semibold text-ink mb-4">{title}</h3>{children}</div>
);

const ReportsPage: React.FC = () => {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('Sales');
  const [range, setRange] = useState<DateRange>({ preset: 'This Month' });

  const won = state.deals.filter((d) => d.status === 'won');
  const lost = state.deals.filter((d) => d.status === 'lost');
  const revenue = won.reduce((a, d) => a + d.value, 0);

  return (
    <div>
      <PageHeader title="Reports & Analytics" icon={<BarChart3 size={20} />} actions={<><DateRangePicker value={range} onChange={setRange} /><Button variant="outline" onClick={() => download('report.csv', 'mock,export\n1,2')}><Download size={16} /> Export</Button></>} />
      <Tabs className="mb-5" active={tab} onChange={(k) => setTab(k as Tab)} tabs={tabKeys.map((t) => ({ key: t, label: t }))} />

      {tab === 'Sales' && <SalesReport won={won} lost={lost} revenue={revenue} />}
      {tab === 'Leads' && <LeadsReport />}
      {tab === 'Calls' && <CallsReport />}
      {tab === 'Activity' && <ActivityReport />}
      {tab === 'Team' && <TeamReport />}
      {tab === 'Custom' && <CustomBuilder />}
    </div>
  );
};

const SalesReport: React.FC<{ won: any[]; lost: any[]; revenue: number }> = ({ won, lost, revenue }) => {
  const { state } = useStore();
  const winRate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  const byMonth = MONTHS.map((m, i) => ({ month: m, revenue: Math.round(revenue * (0.5 + i * 0.1)), target: Math.round(revenue * 0.85), won: 2 + (i % 4), lost: 1 + (i % 2) }));
  const byAgent = state.team.map((a) => { const aw = state.deals.filter((d) => d.assignedTo === a.id && d.status === 'won'); const al = state.deals.filter((d) => d.assignedTo === a.id && d.status === 'lost'); return { name: a.name, deals: aw.length + al.length, won: aw.length, lost: al.length, revenue: a.stats.revenue, rate: aw.length + al.length ? Math.round((aw.length / (aw.length + al.length)) * 100) : 0 }; });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Revenue" value={formatCurrency(revenue)} accent="#22C55E" />
        <StatCard icon={Trophy} label="Deals Won" value={won.length} accent="#FF6B35" />
        <StatCard icon={DollarSign} label="Avg Deal Value" value={formatCurrency(won.length ? Math.round(revenue / won.length) : 0)} accent="#3B82F6" />
        <StatCard icon={Percent} label="Win Rate" value={`${winRate}%`} accent="#2DD4BF" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Revenue by Month">
          <ResponsiveContainer width="100%" height={240}><BarChart data={byMonth} margin={{ left: -8 }}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} /><Tooltip formatter={(v: number) => formatCurrencyFull(v)} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Line type="monotone" dataKey="target" stroke="#0F172A" strokeDasharray="5 5" strokeWidth={2} dot={false} /><Bar dataKey="revenue" fill="#FF6B35" radius={[6, 6, 0, 0]} barSize={24} /></BarChart></ResponsiveContainer>
        </Card>
        <Card title="Won vs Lost by Month">
          <ResponsiveContainer width="100%" height={240}><BarChart data={byMonth} margin={{ left: -16 }}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="won" name="Won" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={16} /><Bar dataKey="lost" name="Lost" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={16} /></BarChart></ResponsiveContainer>
        </Card>
      </div>
      <Card title="Deal Breakdown by Agent">
        <table className="w-full text-sm"><thead><tr className="text-xs uppercase tracking-wide text-muted border-b border-line"><th className="text-left font-semibold py-2">Agent</th><th className="text-right font-semibold py-2">Deals</th><th className="text-right font-semibold py-2">Won</th><th className="text-right font-semibold py-2">Lost</th><th className="text-right font-semibold py-2">Revenue</th><th className="text-right font-semibold py-2">Win Rate</th></tr></thead>
          <tbody className="divide-y divide-line">{byAgent.map((a) => <tr key={a.name}><td className="py-2.5"><div className="flex items-center gap-2"><Avatar name={a.name} size="xs" /><span className="text-ink">{a.name}</span></div></td><td className="text-right text-muted">{a.deals}</td><td className="text-right text-success">{a.won}</td><td className="text-right text-danger">{a.lost}</td><td className="text-right font-medium text-ink">{formatCurrency(a.revenue)}</td><td className="text-right text-muted">{a.rate}%</td></tr>)}</tbody></table>
      </Card>
    </div>
  );
};

const LeadsReport: React.FC = () => {
  const { state } = useStore();
  const sourceMap = new Map<string, number>();
  state.leads.forEach((l) => sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1));
  const sources = [...sourceMap.entries()].map(([name, value]) => ({ name, value }));
  const weekly = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w, i) => ({ week: w, leads: 4 + ((i * 3) % 9) }));
  const funnel = [
    { name: 'Total Leads', value: state.leads.length },
    { name: 'Contacted', value: state.leads.filter((l) => l.status !== 'New').length },
    { name: 'Qualified', value: state.leads.filter((l) => ['Qualified', 'Converted'].includes(l.status)).length },
    { name: 'Proposal', value: state.deals.filter((d) => d.stage === 'proposal').length },
    { name: 'Won', value: state.deals.filter((d) => d.status === 'won').length },
  ];
  const maxF = Math.max(...funnel.map((f) => f.value), 1);
  const converted = state.leads.filter((l) => l.status === 'Converted').length;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Leads" value={state.leads.length} accent="#3B82F6" />
        <StatCard icon={Trophy} label="Converted" value={converted} accent="#22C55E" />
        <StatCard icon={Percent} label="Conversion Rate" value={`${Math.round((converted / state.leads.length) * 100)}%`} accent="#FF6B35" />
        <StatCard icon={Clock} label="Avg Time to Convert" value="6 days" accent="#8B5CF6" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Leads by Source"><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={sources} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>{sources.map((e, i) => <Cell key={i} fill={SOURCE_COLORS[e.name] ?? '#94A3B8'} />)}</Pie><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" /></PieChart></ResponsiveContainer></Card>
        <Card title="Leads Added per Week"><ResponsiveContainer width="100%" height={240}><LineChart data={weekly} margin={{ left: -16 }}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Line type="monotone" dataKey="leads" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></Card>
      </div>
      <Card title="Conversion Funnel">
        <div className="flex flex-col gap-2.5">{funnel.map((f) => <div key={f.name} className="flex items-center gap-3"><span className="w-28 text-sm text-ink shrink-0">{f.name}</span><div className="flex-1 h-7 rounded-lg bg-bg overflow-hidden"><div className="h-full rounded-lg bg-gradient-to-r from-primary/70 to-primary flex items-center justify-end px-2" style={{ width: `${Math.max(8, (f.value / maxF) * 100)}%` }}><span className="text-[11px] font-semibold text-white">{f.value}</span></div></div></div>)}</div>
      </Card>
    </div>
  );
};

const CallsReport: React.FC = () => {
  const { state } = useStore();
  const days = Array.from({ length: 14 }).map((_, i) => ({ day: `D${i + 1}`, calls: 8 + ((i * 5) % 20), connected: 4 + ((i * 3) % 12) }));
  const byAgent = state.team.map((a) => { const tc = state.callLogs.filter((c) => c.agentId === a.id); return { name: a.name.split(' ')[0], total: tc.length, connected: tc.filter((c) => c.outcome === 'Connected').length }; });
  // heatmap 7x12
  const hours = Array.from({ length: 12 }).map((_, i) => `${8 + i}`);
  const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heat = (d: number, h: number) => (Math.abs(Math.sin(d * 2 + h)) * 0.9 + 0.1);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Phone} label="Total Calls" value={state.callLogs.length} accent="#FF6B35" />
        <StatCard icon={Phone} label="Connected" value={state.callLogs.filter((c) => c.outcome === 'Connected').length} accent="#22C55E" />
        <StatCard icon={Clock} label="Avg Duration" value={formatDuration(Math.round(state.callLogs.reduce((a, c) => a + c.duration, 0) / Math.max(1, state.callLogs.length)))} accent="#8B5CF6" />
        <StatCard icon={Percent} label="Not Picked %" value={`${Math.round((state.callLogs.filter((c) => c.outcome === 'Not Picked').length / state.callLogs.length) * 100)}%`} accent="#EF4444" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Calls per Day (14 days)"><ResponsiveContainer width="100%" height={240}><BarChart data={days} margin={{ left: -20 }}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Bar dataKey="calls" fill="#FFD2C2" radius={[4, 4, 0, 0]} /><Bar dataKey="connected" fill="#FF6B35" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card>
        <Card title="By Agent: Total vs Connected"><ResponsiveContainer width="100%" height={240}><BarChart data={byAgent} margin={{ left: -20 }}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Legend wrapperStyle={{ fontSize: 12 }} /><Bar dataKey="total" name="Total" fill="#CBD5E1" radius={[4, 4, 0, 0]} /><Bar dataKey="connected" name="Connected" fill="#22C55E" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      </div>
      <Card title="Call Activity Heatmap">
        <div className="overflow-x-auto"><div className="inline-flex flex-col gap-1">
          <div className="flex gap-1"><div className="w-10" />{hours.map((h) => <div key={h} className="w-7 text-[10px] text-muted text-center">{h}</div>)}</div>
          {dows.map((d, di) => <div key={d} className="flex gap-1 items-center"><div className="w-10 text-[11px] text-muted">{d}</div>{hours.map((_, hi) => { const v = heat(di, hi); return <div key={hi} className="w-7 h-7 rounded" style={{ background: `rgba(255,107,53,${v.toFixed(2)})` }} title={`${Math.round(v * 20)} calls`} />; })}</div>)}
        </div></div>
      </Card>
    </div>
  );
};

const ActivityReport: React.FC = () => {
  const { state } = useStore();
  const typeMap = new Map<string, number>();
  state.activities.forEach((a) => typeMap.set(a.type, (typeMap.get(a.type) ?? 0) + 1));
  const colors = ['#FF6B35', '#3B82F6', '#F59E0B', '#22C55E', '#8B5CF6', '#2DD4BF', '#EC4899', '#EF4444'];
  const types = [...typeMap.entries()].map(([name, value]) => ({ name, value }));
  const vol = MONTHS.map((m, i) => ({ month: m, activities: 20 + ((i * 7) % 30) }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card title="Activity by Type"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={types} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>{types.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" /></PieChart></ResponsiveContainer></Card>
      <Card title="Activity Volume Over Time"><ResponsiveContainer width="100%" height={260}><LineChart data={vol} margin={{ left: -16 }}><CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Line type="monotone" dataKey="activities" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></Card>
    </div>
  );
};

const TeamReport: React.FC = () => {
  const { state } = useStore();
  const data = ['Calls', 'Deals', 'Revenue', 'Tasks', 'Emails'].map((metric) => {
    const row: Record<string, number | string> = { metric };
    state.team.slice(0, 3).forEach((a) => {
      row[a.name.split(' ')[0]] = metric === 'Calls' ? a.stats.calls : metric === 'Deals' ? a.stats.dealsWon * 8 : metric === 'Revenue' ? Math.round(a.stats.revenue / 20000) : metric === 'Tasks' ? a.stats.tasks * 10 : a.stats.connected;
    });
    return row;
  });
  const colors = ['#FF6B35', '#3B82F6', '#22C55E'];
  return (
    <Card title="Team Comparison (Radar)">
      <ResponsiveContainer width="100%" height={360}><RadarChart data={data}><PolarGrid stroke="#E2E8F0" /><PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748B' }} /><PolarRadiusAxis tick={{ fontSize: 10, fill: '#94A3B8' }} /><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} /><Legend wrapperStyle={{ fontSize: 12 }} />{state.team.slice(0, 3).map((a, i) => <Radar key={a.id} name={a.name.split(' ')[0]} dataKey={a.name.split(' ')[0]} stroke={colors[i]} fill={colors[i]} fillOpacity={0.25} />)}</RadarChart></ResponsiveContainer>
    </Card>
  );
};

const CustomBuilder: React.FC = () => {
  const { state, toast } = useStore();
  const [module, setModule] = useState<'Leads' | 'Deals' | 'Contacts'>('Leads');
  const fieldsByModule: Record<string, string[]> = { Leads: ['name', 'phone', 'source', 'status', 'priority', 'leadScore'], Deals: ['title', 'company', 'value', 'stage', 'probability'], Contacts: ['name', 'company', 'designation', 'email'] };
  const [fields, setFields] = useState<string[]>(['name']);
  const [ran, setRan] = useState(false);
  const rows: any[] = module === 'Leads' ? state.leads : module === 'Deals' ? state.deals : state.contacts;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm font-semibold text-ink mb-2">1. Select Module</p>
          {(['Leads', 'Deals', 'Contacts'] as const).map((m) => <label key={m} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer"><input type="radio" checked={module === m} onChange={() => { setModule(m); setFields([fieldsByModule[m][0]]); setRan(false); }} className="accent-primary" /> {m}</label>)}
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-ink mb-2">2. Select Fields</p>
          {fieldsByModule[module].map((f) => <label key={f} className="flex items-center gap-2 py-1.5 text-sm cursor-pointer"><input type="checkbox" checked={fields.includes(f)} onChange={() => setFields((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f])} className="accent-primary" /> {f}</label>)}
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-ink mb-2">3. Filters</p>
          <p className="text-xs text-muted mb-3">Add field + operator + value rows (mock).</p>
          <Button className="w-full" onClick={() => setRan(true)}>Run Report</Button>
        </div>
      </div>
      {ran && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-line"><h3 className="text-sm font-semibold text-ink">Preview ({rows.length} rows)</h3><Button size="sm" variant="outline" onClick={() => { download('custom-report.csv', toCSV(rows.map((r) => Object.fromEntries(fields.map((f) => [f, r[f]]))))); toast('Exported'); }}><Download size={14} /> Export CSV</Button></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-line bg-bg/40 text-xs uppercase text-muted">{fields.map((f) => <th key={f} className="text-left font-semibold px-4 py-2">{f}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">{rows.slice(0, 10).map((r, i) => <tr key={i}>{fields.map((f) => <td key={f} className="px-4 py-2 text-ink">{String(r[f])}</td>)}</tr>)}</tbody></table></div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
