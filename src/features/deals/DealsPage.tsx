import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Plus, Columns3, Table2, TrendingUp, Handshake, ChevronDown } from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam } from '@/store/selectors';
import {
  PageHeader, Button, ViewToggle, KanbanBoard, DataTable, Modal, Avatar, StatusBadge, Tabs,
  ProgressBar, EmptyState, type Column, type KanbanColumn,
} from '@/components/ui';
import { formatCurrency, formatCurrencyFull, formatDate, timeAgo, uid } from '@/lib/utils';
import type { Deal } from '@/types';
import { DealCard } from './DealCard';
import { DealForm, emptyDeal, validateDeal, type DealFormValues } from './DealForm';

const DealsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const { nameOf } = useTeam();
  const navigate = useNavigate();
  const location = useLocation();

  const [pipelineId, setPipelineId] = useState(state.pipelines[0].id);
  const [view, setView] = useState<'kanban' | 'list' | 'forecast'>('kanban');
  const [tab, setTab] = useState<'All' | 'Open' | 'Won' | 'Lost'>('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DealFormValues>(emptyDeal(state.pipelines[0].id, 'new', state.currentUserId));
  const [errors, setErrors] = useState<Partial<Record<keyof DealFormValues, string>>>({});

  const pipeline = state.pipelines.find((p) => p.id === pipelineId)!;
  const allDeals = useMemo(() => state.deals.filter((d) => d.pipelineId === pipelineId), [state.deals, pipelineId]);
  const deals = useMemo(() => allDeals.filter((d) => tab === 'All' || (tab === 'Open' && d.status === 'open') || (tab === 'Won' && d.status === 'won') || (tab === 'Lost' && d.status === 'lost')), [allDeals, tab]);

  useEffect(() => {
    if ((location.state as { openAdd?: boolean })?.openAdd) { openForm(); navigate('/deals', { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const totalValue = allDeals.reduce((a, d) => a + d.value, 0);
  const won = allDeals.filter((d) => d.status === 'won');
  const lost = allDeals.filter((d) => d.status === 'lost');
  const winRate = won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
  const avgDeal = allDeals.length ? Math.round(totalValue / allDeals.length) : 0;
  const avgCycle = 24;

  const kanbanColumns: KanbanColumn[] = pipeline.stages.map((s) => {
    const stageDeals = deals.filter((d) => d.stage === s.key);
    return { key: s.key, title: s.name, accent: s.color, subtitle: formatCurrency(stageDeals.reduce((a, d) => a + d.value, 0)) };
  });

  function openForm(stage = pipeline.stages[0].key) { setForm(emptyDeal(pipelineId, stage, state.currentUserId)); setErrors({}); setShowForm(true); }

  const saveDeal = () => {
    const errs = validateDeal(form); setErrors(errs);
    if (Object.keys(errs).length) return;
    const now = new Date().toISOString();
    const deal: Deal = {
      id: uid('d'), ...form, currency: state.settings.currency, expectedCloseDate: new Date(form.expectedCloseDate).toISOString(),
      status: form.stage === 'won' ? 'won' : form.stage === 'lost' ? 'lost' : 'open', productIds: form.productIds ?? [],
      lastActivity: now, createdAt: now, activityCounts: { call: 0, email: 0, note: 0 },
    };
    dispatch({ type: 'ADD', key: 'deals', item: deal, prepend: true });
    toast(`Deal "${deal.title}" created`); setShowForm(false);
  };

  const moveDeal = (id: string, stage: string) => {
    const st = pipeline.stages.find((s) => s.key === stage)!;
    const status: Deal['status'] = stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'open';
    dispatch({ type: 'UPDATE', key: 'deals', id, patch: { stage, probability: st.probability, status, lastActivity: new Date().toISOString() } });
    dispatch({ type: 'ADD', key: 'activities', prepend: true, item: { id: uid('act'), type: 'stage', entityType: 'deal', entityId: id, title: `Moved to ${st.name}`, agentId: state.currentUserId, timestamp: new Date().toISOString() } });
    const deal = state.deals.find((d) => d.id === id);
    if (deal) {
      if (status === 'won') { dispatch({ type: 'ADD', key: 'notifications', prepend: true, item: { id: uid('n'), type: 'deal_won', message: `🏆 Deal WON: ${deal.title} ${formatCurrency(deal.value)}`, timestamp: new Date().toISOString(), read: false, link: `/deals/${id}` } }); toast(`🏆 ${deal.title} won!`); }
      else toast(`${deal.title} → ${st.name}`);
    }
  };

  const columns: Column<Deal>[] = [
    { key: 'title', header: 'Deal', sortable: true, sortValue: (d) => d.title, render: (d) => <div><p className="font-medium text-ink">{d.title}</p><p className="text-xs text-muted">{d.contactName}</p></div> },
    { key: 'company', header: 'Company', render: (d) => <span className="text-muted">{d.company}</span> },
    { key: 'value', header: 'Value', sortable: true, align: 'right', sortValue: (d) => d.value, render: (d) => <span className="font-semibold text-ink">{formatCurrencyFull(d.value, d.currency)}</span> },
    { key: 'stage', header: 'Stage', render: (d) => <StatusBadge value={pipeline.stages.find((s) => s.key === d.stage)?.name ?? d.stage} tone="indigo" /> },
    { key: 'probability', header: 'Prob.', align: 'right', sortable: true, sortValue: (d) => d.probability, render: (d) => <div className="flex items-center gap-2 justify-end"><ProgressBar value={d.probability} size="sm" className="w-16" /><span className="text-muted text-xs">{d.probability}%</span></div> },
    { key: 'expectedCloseDate', header: 'Close Date', sortable: true, sortValue: (d) => d.expectedCloseDate, render: (d) => <span className="text-muted text-xs">{formatDate(d.expectedCloseDate)}</span> },
    { key: 'assignedTo', header: 'Assigned', render: (d) => <div className="flex items-center gap-1.5"><Avatar name={nameOf(d.assignedTo)} size="xs" /><span className="text-xs text-muted">{nameOf(d.assignedTo).split(' ')[0]}</span></div> },
    { key: 'lastActivity', header: 'Activity', render: (d) => <span className="text-xs text-muted">{timeAgo(d.lastActivity)}</span> },
  ];

  // Forecast data
  const forecast = pipeline.stages.filter((s) => s.key !== 'lost').map((s) => {
    const sd = allDeals.filter((d) => d.stage === s.key);
    const val = sd.reduce((a, d) => a + d.value, 0);
    return { stage: s.name, count: sd.length, value: val, weighted: Math.round(val * (s.probability / 100)) };
  });
  const forecastTotals = forecast.reduce((a, f) => ({ count: a.count + f.count, value: a.value + f.value, weighted: a.weighted + f.weighted }), { count: 0, value: 0, weighted: 0 });

  return (
    <div>
      <PageHeader
        title="Pipeline"
        icon={<Handshake size={20} />}
        actions={
          <>
            <div className="relative">
              <select value={pipelineId} onChange={(e) => setPipelineId(e.target.value)} className="appearance-none h-10 pl-3 pr-9 rounded-lg border border-line bg-white text-sm font-medium text-ink cursor-pointer outline-none focus:border-primary">
                {state.pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
            <span className="hidden md:inline-flex items-center h-10 px-3 rounded-lg bg-primary-light text-primary text-sm font-semibold">{formatCurrencyFull(totalValue)}</span>
            <Button onClick={() => openForm()}><Plus size={16} /> Add Deal</Button>
          </>
        }
      />

      {/* Metrics bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Total Deals', value: allDeals.length },
          { label: 'Total Value', value: formatCurrency(totalValue) },
          { label: 'Win Rate', value: `${winRate}%` },
          { label: 'Avg Deal Size', value: formatCurrency(avgDeal) },
          { label: 'Avg Cycle', value: `${avgCycle} days` },
        ].map((s) => (
          <div key={s.label} className="card p-3"><p className="text-xs text-muted">{s.label}</p><p className="text-lg font-bold text-ink">{s.value}</p></div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Tabs tabs={[{ key: 'All', label: 'All', count: allDeals.length }, { key: 'Open', label: 'Open', count: allDeals.filter((d) => d.status === 'open').length }, { key: 'Won', label: 'Won', count: won.length }, { key: 'Lost', label: 'Lost', count: lost.length }]} active={tab} onChange={(k) => setTab(k as typeof tab)} />
        <ViewToggle active={view} onChange={(v) => setView(v as typeof view)} options={[{ key: 'kanban', icon: <Columns3 size={15} />, label: 'Kanban' }, { key: 'list', icon: <Table2 size={15} />, label: 'List' }, { key: 'forecast', icon: <TrendingUp size={15} />, label: 'Forecast' }]} />
      </div>

      {deals.length === 0 && view !== 'forecast' ? (
        <div className="card"><EmptyState icon={Handshake} title="No deals here" description="Add your first deal to get started." actionLabel="Add Deal" onAction={() => openForm()} /></div>
      ) : view === 'kanban' ? (
        <KanbanBoard<Deal> columns={kanbanColumns} items={deals} itemKey={(d) => d.id} itemColumn={(d) => d.stage} renderCard={(d) => <DealCard deal={d} onClick={() => navigate(`/deals/${d.id}`)} />} onMove={moveDeal} onAddCard={(stage) => openForm(stage)} />
      ) : view === 'list' ? (
        <DataTable columns={columns} rows={deals} rowKey={(d) => d.id} onRowClick={(d) => navigate(`/deals/${d.id}`)} pageSize={12} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Weighted Forecast by Stage</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={forecast} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(v: number) => formatCurrencyFull(v)} contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <Bar dataKey="weighted" name="Weighted Value" fill="#FF6B35" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line bg-bg/40 text-xs uppercase tracking-wide text-muted">
                <th className="text-left font-semibold px-4 py-3">Stage</th><th className="text-right font-semibold px-4 py-3">Count</th>
                <th className="text-right font-semibold px-4 py-3">Total Value</th><th className="text-right font-semibold px-4 py-3">Weighted Value</th>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {forecast.map((f) => (
                  <tr key={f.stage}><td className="px-4 py-3 font-medium text-ink">{f.stage}</td><td className="px-4 py-3 text-right text-muted">{f.count}</td><td className="px-4 py-3 text-right text-ink">{formatCurrencyFull(f.value)}</td><td className="px-4 py-3 text-right font-semibold text-primary">{formatCurrencyFull(f.weighted)}</td></tr>
                ))}
                <tr className="bg-bg/40 font-semibold"><td className="px-4 py-3 text-ink">Total</td><td className="px-4 py-3 text-right">{forecastTotals.count}</td><td className="px-4 py-3 text-right">{formatCurrencyFull(forecastTotals.value)}</td><td className="px-4 py-3 text-right text-primary">{formatCurrencyFull(forecastTotals.weighted)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add New Deal" size="lg" footer={<><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={saveDeal}>Save Deal</Button></>}>
        <DealForm values={form} onChange={setForm} errors={errors} />
      </Modal>
    </div>
  );
};

export default DealsPage;
