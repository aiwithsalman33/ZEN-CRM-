import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Table2, Columns3, SlidersHorizontal, UserPlus, Download, Upload, Trash2, X } from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam, useNotify } from '@/store/selectors';
import {
  PageHeader, Button, SearchBar, ViewToggle, DataTable, KanbanBoard, Drawer, ConfirmDialog,
  StatusBadge, PriorityBadge, Avatar, Select, EmptyState, FilterPanel, FilterSection, FilterChip, Tabs,
  type Column,
} from '@/components/ui';
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_STATUS_ACCENT } from '@/lib/constants';
import { formatDate, timeAgo, uid, toCSV, download } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types';
import { LeadForm, LeadFormActions, emptyLead, validateLead, type LeadFormValues } from './LeadForm';
import { LeadKanbanCard } from './LeadKanbanCard';

const LeadsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const { nameOf } = useTeam();
  const notify = useNotify();
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [tab, setTab] = useState<'All' | LeadStatus>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LeadFormValues>(emptyLead(state.currentUserId));
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormValues, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fSource, setFSource] = useState<string[]>([]);
  const [fAgent, setFAgent] = useState<string[]>([]);

  useEffect(() => {
    if ((location.state as { openAdd?: boolean })?.openAdd) {
      setForm(emptyLead(state.currentUserId)); setShowForm(true);
      navigate('/leads', { replace: true });
    }
  }, [location.state, navigate, state.currentUserId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: state.leads.length };
    LEAD_STATUSES.forEach((s) => (c[s] = state.leads.filter((l) => l.status === s).length));
    return c;
  }, [state.leads]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return state.leads.filter((l) => {
      if (tab !== 'All' && l.status !== tab) return false;
      if (term && !`${l.name} ${l.phone} ${l.email} ${l.company ?? ''}`.toLowerCase().includes(term)) return false;
      if (fSource.length && !fSource.includes(l.source)) return false;
      if (fAgent.length && !fAgent.includes(l.assignedTo)) return false;
      return true;
    });
  }, [state.leads, tab, search, fSource, fAgent]);

  const resetForm = () => { setForm(emptyLead(state.currentUserId)); setErrors({}); };
  const saveLead = (keepOpen: boolean) => {
    const errs = validateLead(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const now = new Date().toISOString();
    const lead: Lead = {
      id: uid('l'), name: form.name, phone: form.phone, altPhone: form.altPhone || undefined, email: form.email,
      source: form.source, status: form.status, priority: form.priority, assignedTo: form.assignedTo,
      campaign: form.campaign || undefined, tags: form.tags, notes: form.notes, company: form.company || undefined,
      leadScore: 50, scoreBreakdown: { engagement: 50, responseRate: 50, activity: 40, recency: 90 },
      lastActivity: now, nextFollowUp: form.nextFollowUp ? new Date(form.nextFollowUp).toISOString() : undefined, createdAt: now,
    };
    dispatch({ type: 'ADD', key: 'leads', item: lead, prepend: true });
    notify('lead', `New lead assigned: ${lead.name} (${lead.source})`, '/leads');
    toast(`Lead "${lead.name}" created`);
    if (keepOpen) resetForm(); else { setShowForm(false); resetForm(); }
  };

  const bulkAssign = (agentId: string) => { if (!agentId) return; dispatch({ type: 'BULK_UPDATE', key: 'leads', ids: selected, patch: { assignedTo: agentId } }); toast(`${selected.length} lead(s) reassigned`); setSelected([]); };
  const bulkStatus = (status: string) => { if (!status) return; dispatch({ type: 'BULK_UPDATE', key: 'leads', ids: selected, patch: { status } }); toast(`${selected.length} lead(s) marked ${status}`); setSelected([]); };
  const bulkDelete = () => { dispatch({ type: 'BULK_DELETE', key: 'leads', ids: selected }); toast(`${selected.length} lead(s) deleted`, 'warning'); setSelected([]); };
  const exportCsv = () => {
    const rows = (selected.length ? filtered.filter((l) => selected.includes(l.id)) : filtered).map((l) => ({
      Name: l.name, Phone: l.phone, Email: l.email, Source: l.source, Status: l.status, Priority: l.priority,
      AssignedTo: nameOf(l.assignedTo), Company: l.company ?? '', Score: l.leadScore, Created: formatDate(l.createdAt),
    }));
    download('pipelinex-leads.csv', toCSV(rows)); toast('Leads exported to CSV');
  };

  const columns: Column<Lead>[] = [
    { key: 'name', header: 'Lead', sortable: true, sortValue: (l) => l.name, render: (l) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={l.name} size="sm" />
        <div><p className="font-medium text-ink">{l.name}</p><p className="text-xs text-muted">{l.phone}</p></div>
      </div>
    ) },
    { key: 'email', header: 'Email', render: (l) => <span className="text-muted">{l.email || '—'}</span> },
    { key: 'source', header: 'Source', render: (l) => <StatusBadge value={l.source} /> },
    { key: 'status', header: 'Status', sortable: true, sortValue: (l) => l.status, render: (l) => <StatusBadge value={l.status} dot /> },
    { key: 'priority', header: 'Priority', sortable: true, sortValue: (l) => l.priority, render: (l) => <PriorityBadge priority={l.priority} /> },
    { key: 'assignedTo', header: 'Assigned', render: (l) => <div className="flex items-center gap-1.5"><Avatar name={nameOf(l.assignedTo)} size="xs" /><span className="text-muted text-xs">{nameOf(l.assignedTo).split(' ')[0]}</span></div> },
    { key: 'lastActivity', header: 'Last Activity', sortable: true, sortValue: (l) => l.lastActivity, render: (l) => <span className="text-muted text-xs">{timeAgo(l.lastActivity)}</span> },
    { key: 'nextFollowUp', header: 'Follow-up', render: (l) => {
      if (!l.nextFollowUp) return <span className="text-muted">—</span>;
      const overdue = new Date(l.nextFollowUp).getTime() < Date.now();
      return <span className={`text-xs font-medium ${overdue ? 'text-danger' : 'text-ink'}`}>{formatDate(l.nextFollowUp)}</span>;
    } },
  ];

  const kanbanColumns = LEAD_STATUSES.filter((s) => s !== 'Converted').map((s) => ({ key: s, title: s, accent: LEAD_STATUS_ACCENT[s] }));

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${counts.All} total leads`}
        icon={<UserPlus size={20} />}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Search leads…" className="w-52 hidden lg:flex" />
            <Button variant="outline" onClick={() => setShowFilters(true)}><SlidersHorizontal size={16} /> Filter</Button>
            <Button variant="outline" onClick={() => toast('CSV import (mock) — drag-drop ready', 'info')}><Upload size={16} /> Import</Button>
            <Button variant="outline" onClick={exportCsv}><Download size={16} /> Export</Button>
            <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus size={16} /> Add Lead</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Tabs
          tabs={[{ key: 'All', label: 'All', count: counts.All }, ...LEAD_STATUSES.map((s) => ({ key: s, label: s, count: counts[s] }))]}
          active={tab}
          onChange={(k) => setTab(k as 'All' | LeadStatus)}
        />
        <ViewToggle active={view} onChange={(v) => setView(v as 'table' | 'kanban')} options={[{ key: 'table', icon: <Table2 size={15} />, label: 'Table' }, { key: 'kanban', icon: <Columns3 size={15} />, label: 'Board' }]} />
      </div>

      {selected.length > 0 && (
        <div className="card !shadow-sm mb-3 p-3 flex flex-wrap items-center gap-3 border border-primary/20 bg-primary-light/40 animate-slideUp">
          <span className="text-sm font-semibold text-ink">{selected.length} selected</span>
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <Select className="!h-9 !w-44" defaultValue="" onChange={(e) => bulkAssign(e.target.value)}>
              <option value="" disabled>Assign to…</option>
              {state.team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Select className="!h-9 !w-40" defaultValue="" onChange={(e) => bulkStatus(e.target.value)}>
              <option value="" disabled>Change status…</option>
              {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download size={15} /> Export</Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</Button>
            <button onClick={() => setSelected([])} className="p-1.5 rounded-md hover:bg-white/60"><X size={16} /></button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={UserPlus} title="No leads found" description="Try adjusting your search or filters, or add a new lead." actionLabel="Add Lead" onAction={() => { resetForm(); setShowForm(true); }} /></div>
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={filtered} rowKey={(l) => l.id} selectable selected={selected} onSelectedChange={setSelected} onRowClick={(l) => navigate(`/leads/${l.id}`)} pageSize={10} />
      ) : (
        <KanbanBoard<Lead>
          columns={kanbanColumns}
          items={filtered}
          itemKey={(l) => l.id}
          itemColumn={(l) => l.status}
          renderCard={(l) => <LeadKanbanCard lead={l} onClick={() => navigate(`/leads/${l.id}`)} />}
          onMove={(id, status) => {
            dispatch({ type: 'UPDATE', key: 'leads', id, patch: { status, lastActivity: new Date().toISOString() } });
            dispatch({ type: 'ADD', key: 'activities', prepend: true, item: { id: uid('act'), type: 'status', entityType: 'lead', entityId: id, title: `Status changed to ${status}`, agentId: state.currentUserId, timestamp: new Date().toISOString() } });
            const lead = state.leads.find((l) => l.id === id);
            if (lead) toast(`${lead.name} → ${status}`);
          }}
          onAddCard={() => { resetForm(); setShowForm(true); }}
        />
      )}

      <Drawer open={showForm} onClose={() => setShowForm(false)} title="Add New Lead" subtitle="Capture a new sales lead" size="lg"
        footer={<LeadFormActions onCancel={() => setShowForm(false)} onSave={() => saveLead(false)} onSaveAnother={() => saveLead(true)} />}>
        <LeadForm values={form} onChange={setForm} errors={errors} />
      </Drawer>

      <FilterPanel open={showFilters} onClose={() => setShowFilters(false)} onClear={() => { setFSource([]); setFAgent([]); }}>
        <FilterSection title="Source">
          <div className="flex flex-wrap gap-2">{LEAD_SOURCES.map((s) => <FilterChip key={s} active={fSource.includes(s)} onClick={() => setFSource((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])}>{s}</FilterChip>)}</div>
        </FilterSection>
        <FilterSection title="Assigned Agent">
          <div className="flex flex-wrap gap-2">{state.team.map((t) => <FilterChip key={t.id} active={fAgent.includes(t.id)} onClick={() => setFAgent((p) => p.includes(t.id) ? p.filter((x) => x !== t.id) : [...p, t.id])}>{t.name.split(' ')[0]}</FilterChip>)}</div>
        </FilterSection>
      </FilterPanel>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete leads?" message={`This will permanently remove ${selected.length} lead(s).`} confirmLabel="Delete" onConfirm={bulkDelete} />
    </div>
  );
};

export default LeadsPage;
