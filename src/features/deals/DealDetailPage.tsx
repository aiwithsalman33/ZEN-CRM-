import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, XCircle, Phone, Mail, MessageCircle, StickyNote, CheckSquare,
  FileText, User, Building2, IndianRupee, CalendarDays, Percent, Send,
} from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam, useEntityActivities, useActivityLog } from '@/store/selectors';
import {
  Button, Avatar, StatusBadge, PipelineStepper, ActivityTimeline, Modal, Field, Input, Textarea, Select,
  EmptyState, ProgressBar,
} from '@/components/ui';
import { formatCurrencyFull, formatCurrency, formatDate, uid, formatDateTime } from '@/lib/utils';
import type { Deal, CallOutcome } from '@/types';

const DealDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, toast } = useStore();
  const { nameOf } = useTeam();
  const log = useActivityLog();
  const activities = useEntityActivities('deal', id ?? '');

  const deal = state.deals.find((d) => d.id === id);
  const [action, setAction] = useState<'call' | 'email' | 'whatsapp' | 'note' | 'task' | null>(null);
  const [actionText, setActionText] = useState('');
  const [noteDraft, setNoteDraft] = useState('');

  if (!deal) {
    return <div className="card"><EmptyState title="Deal not found" description="This deal may have been deleted." actionLabel="Back to Deals" onAction={() => navigate('/deals')} /></div>;
  }

  const pipeline = state.pipelines.find((p) => p.id === deal.pipelineId)!;
  const patch = (p: Partial<Deal>) => dispatch({ type: 'UPDATE', key: 'deals', id: deal.id, patch: p });
  const est = Math.round(deal.value * (deal.probability / 100));
  const teamNotes = activities.filter((a) => a.type === 'note');

  const setStage = (stageKey: string) => {
    const st = pipeline.stages.find((s) => s.key === stageKey)!;
    const status: Deal['status'] = stageKey === 'won' ? 'won' : stageKey === 'lost' ? 'lost' : 'open';
    patch({ stage: stageKey, probability: st.probability, status });
    log('deal', deal.id, 'stage', `Moved to ${st.name}`);
  };

  const markWon = () => { const w = pipeline.stages.find((s) => s.key === 'won'); if (w) { setStage('won'); dispatch({ type: 'ADD', key: 'notifications', prepend: true, item: { id: uid('n'), type: 'deal_won', message: `🎉 Deal won: ${deal.title}`, timestamp: new Date().toISOString(), read: false, link: `/deals/${deal.id}` } }); toast('🎉 Deal marked as Won!'); } };
  const markLost = () => { const l = pipeline.stages.find((s) => s.key === 'lost'); if (l) { setStage('lost'); toast('Deal marked as Lost', 'warning'); } };

  const addNote = () => { if (!noteDraft.trim()) return; log('deal', deal.id, 'note', 'Added a team note', noteDraft); patch({ activityCounts: { ...deal.activityCounts, note: deal.activityCounts.note + 1 } }); setNoteDraft(''); toast('Note added'); };

  const linkedProducts = state.products.filter((p) => deal.productIds.includes(p.id));

  const detailRows = [
    { icon: IndianRupee, label: 'Deal Value', node: <EditNumber value={deal.value} onSave={(v) => patch({ value: v })} format={(v) => formatCurrencyFull(v, deal.currency)} /> },
    { icon: Percent, label: 'Probability', node: <EditNumber value={deal.probability} onSave={(v) => patch({ probability: Math.max(0, Math.min(100, v)) })} format={(v) => `${v}%`} /> },
    { icon: CalendarDays, label: 'Expected Close', node: <span className="text-sm font-medium text-ink">{formatDate(deal.expectedCloseDate)}</span> },
    { icon: FileText, label: 'Pipeline', node: <span className="text-sm font-medium text-ink">{pipeline.name}</span> },
    { icon: User, label: 'Source', node: <StatusBadge value={deal.source} /> },
  ];

  return (
    <div>
      <button onClick={() => navigate('/deals')} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={16} /> Back to Deals
      </button>

      {/* Header */}
      <div className="card p-5 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <EditText value={deal.title} onSave={(v) => patch({ title: v })} className="text-xl font-bold text-ink" />
            <p className="text-sm text-muted mt-1">{deal.contactName} · {deal.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {deal.status === 'won' ? <StatusBadge value="Won" tone="green" /> : deal.status === 'lost' ? <StatusBadge value="Lost" tone="red" /> : (
              <>
                <Button variant="accent" onClick={markWon}><Trophy size={16} /> Mark Won</Button>
                <Button variant="danger" onClick={markLost}><XCircle size={16} /> Mark Lost</Button>
              </>
            )}
          </div>
        </div>
        <PipelineStepper stages={pipeline.stages} current={deal.stage} lost={deal.status === 'lost'} onSelect={setStage} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Deal Details</h3>
            <div className="flex flex-col">
              {detailRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
                  <span className="flex items-center gap-2 text-sm text-muted"><r.icon size={15} /> {r.label}</span>
                  {r.node}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-primary-light p-3">
              <p className="text-xs text-primary/80 font-medium">Weighted (Est.) Value</p>
              <p className="text-lg font-bold text-primary">{formatCurrencyFull(est, deal.currency)}</p>
              <ProgressBar value={deal.probability} className="mt-2" size="sm" color="#5B4FE8" />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Contact</h3>
            <div className="flex items-center gap-3">
              <Avatar name={deal.contactName} size="md" />
              <div>
                <p className="font-medium text-ink">{deal.contactName}</p>
                <p className="flex items-center gap-1 text-xs text-muted"><Building2 size={12} /> {deal.company}</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink">Line Items</h3>
            </div>
            {linkedProducts.length === 0 ? (
              <p className="text-sm text-muted">No products linked to this deal yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {linkedProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{p.name}</span>
                    <span className="font-medium text-ink">{formatCurrency(p.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Center: timeline */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4">Activity Timeline</h3>
          <ActivityTimeline activities={activities} />
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { k: 'call' as const, icon: Phone, label: 'Log Call', color: '#5B4FE8' },
                { k: 'email' as const, icon: Mail, label: 'Email', color: '#3B82F6' },
                { k: 'whatsapp' as const, icon: MessageCircle, label: 'WhatsApp', color: '#00C897' },
                { k: 'note' as const, icon: StickyNote, label: 'Note', color: '#8B5CF6' },
                { k: 'task' as const, icon: CheckSquare, label: 'Task', color: '#FFA502' },
              ].map((a) => (
                <button key={a.k} onClick={() => { setActionText(''); setAction(a.k); }} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-line hover:border-primary/40 hover:bg-bg transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${a.color}1a`, color: a.color }}><a.icon size={16} /></div>
                  <span className="text-xs font-medium text-ink">{a.label}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-3" onClick={() => navigate('/quotes')}><FileText size={16} /> Linked Quote</Button>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Team Notes</h3>
            <div className="flex gap-2 mb-3">
              <Input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add internal comment…" onKeyDown={(e) => e.key === 'Enter' && addNote()} />
              <Button size="icon" onClick={addNote}><Send size={15} /></Button>
            </div>
            {teamNotes.length === 0 ? <p className="text-sm text-muted">No internal notes yet.</p> : (
              <ul className="flex flex-col gap-3">
                {teamNotes.map((n) => (
                  <li key={n.id} className="flex gap-2.5">
                    <Avatar name={nameOf(n.agentId)} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">{n.description ?? n.title}</p>
                      <p className="text-xs text-muted mt-0.5">{nameOf(n.agentId)} · {formatDateTime(n.timestamp)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick action modal */}
      <Modal open={!!action} onClose={() => setAction(null)} size="md"
        title={action === 'call' ? 'Log a Call' : action === 'email' ? 'Send Email' : action === 'whatsapp' ? 'Send WhatsApp' : action === 'task' ? 'Create Task' : 'Add Note'}
        subtitle={deal.title}
        footer={<><Button variant="outline" onClick={() => setAction(null)}>Cancel</Button><Button onClick={() => {
          if (action === 'call') { log('deal', deal.id, 'call', `Logged a call with ${deal.contactName}`, actionText); patch({ activityCounts: { ...deal.activityCounts, call: deal.activityCounts.call + 1 } }); }
          else if (action === 'email') { log('deal', deal.id, 'email', `Sent email: ${actionText || '(no subject)'}`); patch({ activityCounts: { ...deal.activityCounts, email: deal.activityCounts.email + 1 } }); }
          else if (action === 'whatsapp') log('deal', deal.id, 'whatsapp', `Sent WhatsApp to ${deal.contactName}`, actionText);
          else if (action === 'task') log('deal', deal.id, 'task', actionText || 'Created a task');
          else if (action === 'note') { log('deal', deal.id, 'note', 'Added a note', actionText); patch({ activityCounts: { ...deal.activityCounts, note: deal.activityCounts.note + 1 } }); }
          toast('Done'); setAction(null);
        }}>Save</Button></>}>
        <Field label={action === 'email' ? 'Subject / message' : action === 'task' ? 'Task' : 'Notes'}>
          <Textarea value={actionText} onChange={(e) => setActionText(e.target.value)} placeholder="Type here…" autoFocus />
        </Field>
      </Modal>
    </div>
  );
};

// Small inline editors
const EditText: React.FC<{ value: string; onSave: (v: string) => void; className?: string }> = ({ value, onSave, className }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  if (editing) return <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => { onSave(draft); setEditing(false); }} onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget.blur())} className="border border-primary rounded-lg px-2 py-1 outline-none w-full text-xl font-bold" />;
  return <h1 className={className + ' cursor-text hover:bg-bg rounded px-1 -mx-1'} onClick={() => { setDraft(value); setEditing(true); }}>{value}</h1>;
};

const EditNumber: React.FC<{ value: number; onSave: (v: number) => void; format: (v: number) => string }> = ({ value, onSave, format }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  if (editing) return <input autoFocus type="number" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => { onSave(Number(draft) || 0); setEditing(false); }} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} className="border border-primary rounded-lg px-2 py-0.5 outline-none w-28 text-sm font-medium text-right" />;
  return <button onClick={() => { setDraft(String(value)); setEditing(true); }} className="text-sm font-medium text-ink hover:text-primary">{format(value)}</button>;
};

export default DealDetailPage;
