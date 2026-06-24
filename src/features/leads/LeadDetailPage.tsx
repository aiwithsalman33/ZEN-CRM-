import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MessageCircle, CalendarPlus, StickyNote, Briefcase, Building2,
  Tag, Plus, CheckSquare, Square, Hash, UserCheck,
} from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam, useEntityActivities, useActivityLog, useNotify } from '@/store/selectors';
import {
  Button, Avatar, StatusBadge, PriorityBadge, Select, Input, Textarea, Field, ActivityTimeline,
  Modal, EmptyState, ProgressBar, Tabs,
} from '@/components/ui';
import { LEAD_STATUSES } from '@/lib/constants';
import { formatDate, formatDateTime, formatDuration, uid } from '@/lib/utils';
import type { Lead, LeadStatus, Contact, Deal, CallOutcome, ActivityType } from '@/types';

const ScoreDonut: React.FC<{ score: number }> = ({ score }) => {
  const r = 42, c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#FF6B35" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-ink">{score}</span>
        <span className="text-[10px] text-muted">/ 100</span>
      </div>
    </div>
  );
};

type ActionKind = 'call' | 'note' | 'followup' | 'email' | 'whatsapp' | 'task' | null;

const LeadDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, toast } = useStore();
  const { nameOf } = useTeam();
  const log = useActivityLog();
  const notify = useNotify();
  const activities = useEntityActivities('lead', id ?? '');

  const lead = state.leads.find((l) => l.id === id);
  const [action, setAction] = useState<ActionKind>(null);
  const [tlFilter, setTlFilter] = useState('all');

  if (!lead) return <div className="card"><EmptyState title="Lead not found" description="This lead may have been deleted." actionLabel="Back to Leads" onAction={() => navigate('/leads')} /></div>;

  const patch = (p: Partial<Lead>) => dispatch({ type: 'UPDATE', key: 'leads', id: lead.id, patch: p });
  const tasks = state.tasks.filter((t) => t.entityId === lead.id || t.entityName === lead.name).slice(0, 5);
  const calls = state.callLogs.filter((c) => c.leadId === lead.id || c.contactName === lead.name).slice(0, 3);
  const linkedDeals = state.deals.filter((d) => d.contactName === lead.name);

  const filteredTl = activities.filter((a) => tlFilter === 'all' || a.type === tlFilter);
  const sb = lead.scoreBreakdown;

  const convertToDeal = () => {
    const pipeline = state.pipelines[0];
    const deal: Deal = {
      id: uid('d'), title: `${lead.company || lead.name} — New Deal`, pipelineId: pipeline.id, stage: 'new', value: 50000,
      currency: state.settings.currency, contactName: lead.name, company: lead.company ?? '', probability: pipeline.stages[0].probability,
      expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString(), assignedTo: lead.assignedTo, source: lead.source,
      productIds: [], status: 'open', lastActivity: new Date().toISOString(), createdAt: new Date().toISOString(), activityCounts: { call: 0, email: 0, note: 0 },
    };
    dispatch({ type: 'ADD', key: 'deals', item: deal, prepend: true });
    patch({ status: 'Converted' });
    toast(`Deal created from ${lead.name}`);
    navigate(`/deals/${deal.id}`);
  };
  const convertToContact = () => {
    const contact: Contact = { id: uid('c'), name: lead.name, phones: [lead.phone], email: lead.email, company: lead.company ?? '', designation: '', source: lead.source, assignedTo: lead.assignedTo, tags: lead.tags, notes: lead.notes, createdAt: new Date().toISOString(), lastActivity: new Date().toISOString() };
    dispatch({ type: 'ADD', key: 'contacts', item: contact, prepend: true });
    toast(`${lead.name} added to contacts`); navigate('/contacts');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button onClick={() => navigate('/leads')} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft size={16} /> Back</button>
        <h1 className="text-xl font-bold text-ink">{lead.name}</h1>
        <Select className="!h-8 !w-36" value={lead.status} onChange={(e) => { patch({ status: e.target.value as LeadStatus }); log('lead', lead.id, 'status', `Status changed to ${e.target.value}`); }}>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <PriorityBadge priority={lead.priority} />
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => setAction('call')}><Phone size={15} /> Log Call</Button>
          <Button variant="outline" size="sm" onClick={() => setAction('email')}><Mail size={15} /> Email</Button>
          <Button variant="outline" size="sm" onClick={() => setAction('whatsapp')}><MessageCircle size={15} /> WhatsApp</Button>
          <Button size="sm" onClick={convertToDeal}><Briefcase size={15} /> Convert to Deal</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-5">
        {/* Left */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar name={lead.name} size="xl" />
              <h2 className="text-base font-bold text-ink mt-2">{lead.name}</h2>
              <StatusBadge value={lead.status} dot />
            </div>
            <div className="flex flex-col text-sm">
              {[
                { icon: Phone, label: lead.phone },
                lead.altPhone ? { icon: Phone, label: lead.altPhone } : null,
                { icon: Mail, label: lead.email || '—' },
                { icon: Tag, label: lead.source },
                { icon: Hash, label: lead.campaign ?? 'No campaign' },
                { icon: Building2, label: lead.company ?? '—' },
              ].filter(Boolean).map((r, i) => {
                const row = r as { icon: React.ElementType; label: string };
                return <div key={i} className="flex items-center gap-2.5 py-2 border-b border-line last:border-0"><row.icon size={15} className="text-muted shrink-0" /><span className="text-ink truncate">{row.label}</span></div>;
              })}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-line text-xs">
              <span className="text-muted">Assigned</span>
              <span className="flex items-center gap-1.5"><Avatar name={nameOf(lead.assignedTo)} size="xs" /><span className="text-ink font-medium">{nameOf(lead.assignedTo)}</span></span>
            </div>
            {lead.tags.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{lead.tags.map((t) => <span key={t} className="bg-primary-light text-primary text-xs font-medium px-2 py-0.5 rounded-md">{t}</span>)}</div>}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">AI Lead Score</h3>
            <ScoreDonut score={lead.leadScore} />
            <div className="flex flex-col gap-2.5 mt-4">
              {[
                { label: 'Engagement', v: sb.engagement }, { label: 'Response Rate', v: sb.responseRate },
                { label: 'Activity', v: sb.activity }, { label: 'Recency', v: sb.recency },
              ].map((b) => <ProgressBar key={b.label} label={b.label} value={b.v} showPct size="sm" threshold />)}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-ink">Deals ({linkedDeals.length})</h3></div>
            {linkedDeals.length === 0 ? <p className="text-sm text-muted">No linked deals.</p> : (
              <ul className="flex flex-col gap-2">
                {linkedDeals.map((d) => (
                  <li key={d.id} onClick={() => navigate(`/deals/${d.id}`)} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg cursor-pointer">
                    <div className="min-w-0"><p className="text-sm font-medium text-ink truncate">{d.title}</p><StatusBadge value={d.status} /></div>
                    <span className="text-sm font-semibold text-primary shrink-0">₹{d.value.toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="w-full mt-3" onClick={convertToContact}><UserCheck size={15} /> Convert to Contact</Button>
          </div>
        </div>

        {/* Center: timeline */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink">Activity Timeline</h3>
            <Button variant="outline" size="sm" onClick={() => setAction('note')}><Plus size={14} /> Add Note</Button>
          </div>
          <Tabs variant="pill" className="mb-4" active={tlFilter} onChange={setTlFilter} tabs={[{ key: 'all', label: 'All' }, { key: 'call', label: 'Calls' }, { key: 'email', label: 'Emails' }, { key: 'note', label: 'Notes' }, { key: 'status', label: 'Status' }]} />
          <ActivityTimeline activities={filteredTl} />
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Quick Actions</h3>
            <Button className="w-full mb-2" onClick={() => setAction('call')}><Phone size={16} /> Log Call</Button>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => setAction('email')}><Mail size={15} /> Email</Button>
              <Button variant="outline" size="sm" onClick={() => setAction('whatsapp')}><MessageCircle size={15} /> WhatsApp</Button>
              <Button variant="outline" size="sm" onClick={() => setAction('followup')}><CalendarPlus size={15} /> Follow-up</Button>
              <Button variant="outline" size="sm" onClick={() => setAction('note')}><StickyNote size={15} /> Note</Button>
            </div>
            <Button variant="secondary" className="w-full" onClick={() => setAction('task')}><CheckSquare size={15} /> Create Task</Button>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-ink">Upcoming Tasks</h3></div>
            {tasks.length === 0 ? <p className="text-sm text-muted">No tasks yet.</p> : (
              <ul className="flex flex-col gap-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <button onClick={() => dispatch({ type: 'UPDATE', key: 'tasks', id: t.id, patch: { done: !t.done } })} className="mt-0.5 text-muted hover:text-primary">{t.done ? <CheckSquare size={16} className="text-success" /> : <Square size={16} />}</button>
                    <div className="flex-1 min-w-0"><p className={`text-sm ${t.done ? 'line-through text-muted' : 'text-ink'}`}>{t.title}</p><p className="text-xs text-muted">{formatDate(t.dueDate)}</p></div>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setAction('task')}><Plus size={14} /> Add Task</Button>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Call History</h3>
            {calls.length === 0 ? <p className="text-sm text-muted">No calls logged.</p> : (
              <ul className="flex flex-col gap-2.5">
                {calls.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <div><p className="text-ink">{formatDate(c.timestamp)}</p><p className="text-xs text-muted">{formatDuration(c.duration)}</p></div>
                    <StatusBadge value={c.outcome} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <QuickActionModal action={action} lead={lead} onClose={() => setAction(null)}
        onLogCall={(o, n) => { log('lead', lead.id, 'call', `Call logged with ${lead.name} · ${o}`, n || undefined); dispatch({ type: 'ADD', key: 'callLogs', prepend: true, item: { id: uid('call'), contactName: lead.name, phone: lead.phone, direction: 'Outbound', duration: 0, agentId: state.currentUserId, timestamp: new Date().toISOString(), outcome: o, notes: n, hasRecording: false, leadId: lead.id } }); toast('Call logged'); }}
        onNote={(t) => { log('lead', lead.id, 'note', 'Added a note', t); toast('Note added'); }}
        onFollowUp={(d) => { patch({ nextFollowUp: new Date(d).toISOString() }); log('lead', lead.id, 'task', `Follow-up scheduled for ${formatDate(d)}`); notify('followup', `Follow-up scheduled with ${lead.name}`, `/leads/${lead.id}`); toast('Follow-up scheduled'); }}
        onEmail={(s) => { log('lead', lead.id, 'email', `Sent email: ${s}`); toast('Email sent (mock)'); }}
        onWhatsApp={(t) => { log('lead', lead.id, 'whatsapp', `Sent WhatsApp: ${t.slice(0, 40)}`); toast('WhatsApp sent (mock)'); }}
        onTask={(t, d) => { dispatch({ type: 'ADD', key: 'tasks', prepend: true, item: { id: uid('t'), title: t, done: false, dueDate: d ? new Date(d).toISOString() : new Date().toISOString(), priority: 'Medium', assignedTo: lead.assignedTo, entityType: 'lead', entityId: lead.id, entityName: lead.name } }); log('lead', lead.id, 'task', `Created task: ${t}`); toast('Task created'); }}
      />
    </div>
  );
};

const QuickActionModal: React.FC<{
  action: ActionKind; lead: Lead; onClose: () => void;
  onLogCall: (o: CallOutcome, n: string) => void; onNote: (t: string) => void; onFollowUp: (d: string) => void;
  onEmail: (s: string) => void; onWhatsApp: (t: string) => void; onTask: (t: string, d: string) => void;
}> = ({ action, lead, onClose, onLogCall, onNote, onFollowUp, onEmail, onWhatsApp, onTask }) => {
  const [text, setText] = useState('');
  const [outcome, setOutcome] = useState<CallOutcome>('Connected');
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('');
  const close = () => { setText(''); setSubject(''); setDate(''); setOutcome('Connected'); onClose(); };
  if (!action) return null;
  const titles: Record<Exclude<ActionKind, null>, string> = { call: 'Log a Call', note: 'Add Note', followup: 'Schedule Follow-up', email: 'Send Email', whatsapp: 'Send WhatsApp', task: 'Create Task' };
  return (
    <Modal open={!!action} onClose={close} title={titles[action]} subtitle={`with ${lead.name}`} size="md"
      footer={<><Button variant="outline" onClick={close}>Cancel</Button><Button onClick={() => {
        if (action === 'call') onLogCall(outcome, text);
        else if (action === 'note') onNote(text);
        else if (action === 'followup') onFollowUp(date || new Date().toISOString());
        else if (action === 'email') onEmail(subject || '(no subject)');
        else if (action === 'whatsapp') onWhatsApp(text);
        else if (action === 'task') onTask(text || 'Follow up', date);
        close();
      }}>Save</Button></>}>
      {action === 'call' && (
        <div className="flex flex-col gap-4">
          <Field label="Outcome"><Select value={outcome} onChange={(e) => setOutcome(e.target.value as CallOutcome)}>{(['Connected', 'Not Picked', 'Callback', 'Busy', 'Wrong Number', 'Voicemail'] as CallOutcome[]).map((o) => <option key={o}>{o}</option>)}</Select></Field>
          <Field label="Notes"><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Call summary…" /></Field>
        </div>
      )}
      {action === 'note' && <Field label="Note"><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a note…" autoFocus /></Field>}
      {action === 'followup' && <Field label="Follow-up date & time"><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></Field>}
      {action === 'email' && (
        <div className="flex flex-col gap-4">
          <Field label="Subject"><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" autoFocus /></Field>
          <Field label="Message"><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your email…" /></Field>
        </div>
      )}
      {action === 'whatsapp' && <Field label="Message"><Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a WhatsApp message…" autoFocus /></Field>}
      {action === 'task' && (
        <div className="flex flex-col gap-4">
          <Field label="Task"><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs to be done?" autoFocus /></Field>
          <Field label="Due date"><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </div>
      )}
    </Modal>
  );
};

export default LeadDetailPage;
