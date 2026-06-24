import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { RefreshCw, Plus, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { useStore } from '@/store/store';
import {
  PageHeader, Button, DataTable, StatusBadge, Avatar, Modal, Field, Input, Select, type Column,
} from '@/components/ui';
import { formatCurrency, formatCurrencyFull, formatDate, uid } from '@/lib/utils';
import type { Subscription, BillingCycle } from '@/types';

const SubscriptionsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [add, setAdd] = useState(false);
  const [form, setForm] = useState<Subscription>({ id: '', contactName: '', plan: '', mrr: 0, billingCycle: 'Monthly', startDate: new Date().toISOString(), renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(), status: 'Active', autoRenew: true, seats: 1 });

  const active = state.subscriptions.filter((s) => s.status === 'Active' || s.status === 'Trial');
  const totalMrr = active.reduce((a, s) => a + s.mrr, 0);
  const totalArr = totalMrr * 12;
  const newMrr = state.subscriptions.filter((s) => Date.now() - new Date(s.startDate).getTime() < 30 * 86400000).reduce((a, s) => a + s.mrr, 0);
  const churnedMrr = state.subscriptions.filter((s) => s.status === 'Cancelled').reduce((a, s) => a + s.mrr, 0);
  const netGrowth = newMrr - churnedMrr;

  const trend = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({ month: m, mrr: Math.round(totalMrr * (0.45 + i * 0.05)) }));

  const save = () => {
    if (!form.contactName.trim() || !form.plan.trim()) { toast('Contact & plan required', 'error'); return; }
    dispatch({ type: 'ADD', key: 'subscriptions', item: { ...form, id: uid('s') }, prepend: true });
    toast('Subscription added'); setAdd(false);
  };

  const columns: Column<Subscription>[] = [
    { key: 'contactName', header: 'Contact', sortable: true, sortValue: (s) => s.contactName, render: (s) => <div className="flex items-center gap-2.5"><Avatar name={s.contactName} size="sm" /><span className="font-medium text-ink">{s.contactName}</span></div> },
    { key: 'plan', header: 'Plan', render: (s) => <span className="text-muted">{s.plan}</span> },
    { key: 'mrr', header: 'MRR', align: 'right', sortable: true, sortValue: (s) => s.mrr, render: (s) => <span className="font-semibold text-ink">{formatCurrencyFull(s.mrr)}</span> },
    { key: 'arr', header: 'ARR', align: 'right', render: (s) => <span className="text-muted">{formatCurrency(s.mrr * 12)}</span> },
    { key: 'billingCycle', header: 'Billing', render: (s) => <span className="text-muted">{s.billingCycle}</span> },
    { key: 'startDate', header: 'Start', render: (s) => <span className="text-muted text-xs">{formatDate(s.startDate)}</span> },
    { key: 'renewalDate', header: 'Renewal', sortable: true, sortValue: (s) => s.renewalDate, render: (s) => { const soon = new Date(s.renewalDate).getTime() - Date.now() < 7 * 86400000; return <span className={`text-xs font-medium ${soon ? 'text-danger' : 'text-muted'}`}>{formatDate(s.renewalDate)}</span>; } },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge value={s.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Subscriptions & MRR" icon={<RefreshCw size={20} />} actions={<Button onClick={() => setAdd(true)}><Plus size={16} /> Add Subscription</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[
          { label: 'Total MRR', value: formatCurrency(totalMrr), icon: Wallet, color: '#FF6B35' },
          { label: 'Total ARR', value: formatCurrency(totalArr), icon: Calendar, color: '#3B82F6' },
          { label: 'New MRR', value: formatCurrency(newMrr), icon: TrendingUp, color: '#22C55E' },
          { label: 'Churned MRR', value: formatCurrency(churnedMrr), icon: TrendingDown, color: '#EF4444' },
          { label: 'Net Growth', value: formatCurrency(netGrowth), icon: TrendingUp, color: '#2DD4BF' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}1a`, color: s.color }}><s.icon size={18} /></div>
            <div><p className="text-xs text-muted">{s.label}</p><p className="text-lg font-bold text-ink">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-5">
        <h3 className="text-sm font-semibold text-ink mb-4">MRR Trend (12 months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trend} margin={{ left: -8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip formatter={(v: number) => formatCurrencyFull(v)} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
            <Line type="monotone" dataKey="mrr" name="MRR" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <DataTable columns={columns} rows={state.subscriptions} rowKey={(s) => s.id} pageSize={10} />

      <Modal open={add} onClose={() => setAdd(false)} title="Add Subscription" size="lg" footer={<><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact" required><Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} /></Field>
          <Field label="Plan Name" required><Input value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} /></Field>
          <Field label="MRR (₹)" required><Input type="number" value={form.mrr} onChange={(e) => setForm({ ...form, mrr: Number(e.target.value) })} /></Field>
          <Field label="Billing Cycle"><Select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>{['Monthly', 'Quarterly', 'Yearly'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Seats"><Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} /></Field>
          <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Subscription['status'] })}>{['Active', 'Trial', 'Paused', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Start Date"><Input type="date" value={form.startDate.slice(0, 10)} onChange={(e) => setForm({ ...form, startDate: new Date(e.target.value).toISOString() })} /></Field>
          <Field label="Renewal Date"><Input type="date" value={form.renewalDate.slice(0, 10)} onChange={(e) => setForm({ ...form, renewalDate: new Date(e.target.value).toISOString() })} /></Field>
          <label className="flex items-center gap-2 text-sm text-muted col-span-2"><input type="checkbox" checked={form.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} className="accent-primary" /> Auto-renewal</label>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;
