import React, { useMemo, useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Play, Plus, ChevronDown, Clock, PhoneCall } from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam } from '@/store/selectors';
import {
  PageHeader, Button, Tabs, StatusBadge, Avatar, Select, Modal, Field, Input, Textarea,
  StatCard, EmptyState,
} from '@/components/ui';
import { CALL_OUTCOMES } from '@/lib/constants';
import { formatDuration, formatDateTime, uid } from '@/lib/utils';
import type { CallLog, CallDirection, CallOutcome } from '@/types';

const CallsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const { nameOf, team } = useTeam();
  const [tab, setTab] = useState<'all' | 'inbound' | 'outbound' | 'missed' | 'recordings'>('all');
  const [agent, setAgent] = useState('all');
  const [outcome, setOutcome] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  const calls = useMemo(() => {
    return state.callLogs.filter((c) => {
      if (tab === 'inbound' && c.direction !== 'Inbound') return false;
      if (tab === 'outbound' && c.direction !== 'Outbound') return false;
      if (tab === 'missed' && c.outcome !== 'Not Picked') return false;
      if (tab === 'recordings' && !c.hasRecording) return false;
      if (agent !== 'all' && c.agentId !== agent) return false;
      if (outcome !== 'all' && c.outcome !== outcome) return false;
      return true;
    }).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [state.callLogs, tab, agent, outcome]);

  const connected = state.callLogs.filter((c) => c.outcome === 'Connected');
  const notPicked = state.callLogs.filter((c) => c.outcome === 'Not Picked');
  const avgDur = connected.length ? Math.round(connected.reduce((a, c) => a + c.duration, 0) / connected.length) : 0;
  const notPickedRate = state.callLogs.length ? Math.round((notPicked.length / state.callLogs.length) * 100) : 0;

  // team performance
  const perf = team.map((m) => {
    const tc = state.callLogs.filter((c) => c.agentId === m.id);
    const conn = tc.filter((c) => c.outcome === 'Connected');
    return { id: m.id, name: m.name, total: tc.length, connected: conn.length, avg: conn.length ? Math.round(conn.reduce((a, c) => a + c.duration, 0) / conn.length) : 0, rate: tc.length ? Math.round((conn.length / tc.length) * 100) : 0 };
  });

  return (
    <div>
      <PageHeader title="Calls" icon={<Phone size={20} />} actions={<Button onClick={() => setShowLog(true)}><Plus size={16} /> Log Call</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Phone} label="Total Calls" value={state.callLogs.length} change={9} accent="#FF6B35" />
        <StatCard icon={PhoneCall} label="Connected" value={connected.length} change={6} accent="#22C55E" />
        <StatCard icon={Clock} label="Avg Duration" value={formatDuration(avgDur)} accent="#8B5CF6" />
        <StatCard icon={PhoneIncoming} label="Not Picked Rate" value={`${notPickedRate}%`} change={-4} accent="#EF4444" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Tabs active={tab} onChange={(k) => setTab(k as typeof tab)} tabs={[{ key: 'all', label: 'All Calls' }, { key: 'inbound', label: 'Inbound' }, { key: 'outbound', label: 'Outbound' }, { key: 'missed', label: 'Missed' }, { key: 'recordings', label: 'Recordings' }]} />
        <div className="flex items-center gap-2">
          <Select className="!h-9 !w-40" value={agent} onChange={(e) => setAgent(e.target.value)}><option value="all">All Agents</option>{team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
          <Select className="!h-9 !w-40" value={outcome} onChange={(e) => setOutcome(e.target.value)}><option value="all">All Outcomes</option>{CALL_OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}</Select>
        </div>
      </div>

      {calls.length === 0 ? (
        <div className="card"><EmptyState icon={Phone} title="No calls found" description="Log a call or adjust filters." actionLabel="Log Call" onAction={() => setShowLog(true)} /></div>
      ) : (
        <div className="card overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line bg-bg/40 text-xs uppercase tracking-wide text-muted">
                <th className="text-left font-semibold px-4 py-3">Contact</th><th className="text-left font-semibold px-4 py-3">Direction</th>
                <th className="text-left font-semibold px-4 py-3">Duration</th><th className="text-left font-semibold px-4 py-3">Agent</th>
                <th className="text-left font-semibold px-4 py-3">Date & Time</th><th className="text-left font-semibold px-4 py-3">Outcome</th><th className="px-4 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-line">
                {calls.map((c) => (
                  <React.Fragment key={c.id}>
                    <tr onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="cursor-pointer hover:bg-bg/60">
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={c.contactName} size="sm" /><div><p className="font-medium text-ink">{c.contactName}</p><p className="text-xs text-muted">{c.phone}</p></div></div></td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-xs font-medium ${c.direction === 'Outbound' ? 'text-info' : 'text-success'}`}>{c.direction === 'Outbound' ? <PhoneOutgoing size={13} /> : <PhoneIncoming size={13} />}{c.direction}</span></td>
                      <td className="px-4 py-3 text-muted">{formatDuration(c.duration)}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1.5"><Avatar name={nameOf(c.agentId)} size="xs" /><span className="text-xs text-muted">{nameOf(c.agentId).split(' ')[0]}</span></div></td>
                      <td className="px-4 py-3 text-muted text-xs">{formatDateTime(c.timestamp)}</td>
                      <td className="px-4 py-3"><StatusBadge value={c.outcome} /></td>
                      <td className="px-4 py-3 text-right"><ChevronDown size={16} className={`text-muted transition-transform ${expanded === c.id ? 'rotate-180' : ''}`} /></td>
                    </tr>
                    {expanded === c.id && (
                      <tr className="bg-bg/30"><td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div><p className="text-xs font-semibold text-muted uppercase mb-1">Call Notes</p><p className="text-sm text-ink">{c.notes || 'No notes recorded.'}</p></div>
                          <div>
                            <p className="text-xs font-semibold text-muted uppercase mb-1">Recording</p>
                            {c.hasRecording ? (
                              <div className="flex items-center gap-2"><button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"><Play size={14} /></button><div className="flex-1 h-8 flex items-center gap-0.5">{Array.from({ length: 28 }).map((_, i) => <span key={i} className="flex-1 bg-primary/30 rounded-full" style={{ height: `${20 + Math.abs(Math.sin(i)) * 70}%` }} />)}</div></div>
                            ) : <p className="text-sm text-muted">No recording available.</p>}
                          </div>
                          <div><p className="text-xs font-semibold text-muted uppercase mb-1">AI Summary</p><p className="text-sm text-ink">{c.outcome === 'Connected' ? 'Customer showed interest; requested pricing details and a follow-up next week.' : 'Could not connect. Recommended retry in the evening.'}</p></div>
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs uppercase tracking-wide text-muted border-b border-line">
              <th className="text-left font-semibold py-2">Agent</th><th className="text-right font-semibold py-2">Calls</th>
              <th className="text-right font-semibold py-2">Connected</th><th className="text-right font-semibold py-2">Avg Duration</th><th className="text-right font-semibold py-2">Conversion</th>
            </tr></thead>
            <tbody className="divide-y divide-line">
              {perf.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5"><div className="flex items-center gap-2"><Avatar name={p.name} size="sm" /><span className="font-medium text-ink">{p.name}</span></div></td>
                  <td className="text-right text-muted">{p.total}</td><td className="text-right text-muted">{p.connected}</td>
                  <td className="text-right text-muted">{formatDuration(p.avg)}</td>
                  <td className="text-right"><span className="font-semibold text-ink">{p.rate}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LogCallModal open={showLog} onClose={() => setShowLog(false)} onSave={(c) => { dispatch({ type: 'ADD', key: 'callLogs', prepend: true, item: c }); toast('Call logged'); setShowLog(false); }} currentUserId={state.currentUserId} />
    </div>
  );
};

const LogCallModal: React.FC<{ open: boolean; onClose: () => void; onSave: (c: CallLog) => void; currentUserId: string }> = ({ open, onClose, onSave, currentUserId }) => {
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [direction, setDirection] = useState<CallDirection>('Outbound');
  const [duration, setDuration] = useState('00:03:00');
  const [outcome, setOutcome] = useState<CallOutcome>('Connected');
  const [notes, setNotes] = useState('');

  const parseDur = (s: string) => { const [h, m, sec] = s.split(':').map(Number); return (h || 0) * 3600 + (m || 0) * 60 + (sec || 0); };
  const save = () => {
    if (!contact.trim()) return;
    onSave({ id: uid('call'), contactName: contact, phone: phone || '+91 90000 00000', direction, duration: parseDur(duration), agentId: currentUserId, timestamp: new Date().toISOString(), outcome, notes, hasRecording: outcome === 'Connected' });
    setContact(''); setPhone(''); setNotes('');
  };
  const outcomeIcons: CallOutcome[] = CALL_OUTCOMES;

  return (
    <Modal open={open} onClose={onClose} title="Log a Call" size="md" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Log Call</Button></>}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact" required><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Search or type name" autoFocus /></Field>
          <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" /></Field>
        </div>
        <Field label="Direction">
          <div className="grid grid-cols-2 gap-2">
            {(['Outbound', 'Inbound'] as CallDirection[]).map((d) => (
              <button key={d} type="button" onClick={() => setDirection(d)} className={`h-10 rounded-lg border text-sm font-medium ${direction === d ? 'border-primary bg-primary-light text-primary' : 'border-line text-muted'}`}>{d}</button>
            ))}
          </div>
        </Field>
        <Field label="Duration (HH:MM:SS)"><Input value={duration} onChange={(e) => setDuration(e.target.value)} /></Field>
        <Field label="Outcome">
          <div className="grid grid-cols-3 gap-2">
            {outcomeIcons.map((o) => (
              <button key={o} type="button" onClick={() => setOutcome(o)} className={`h-12 rounded-lg border text-xs font-medium ${outcome === o ? 'border-primary bg-primary-light text-primary' : 'border-line text-muted'}`}>{o}</button>
            ))}
          </div>
        </Field>
        <Field label="Notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Call summary…" /></Field>
      </div>
    </Modal>
  );
};

export default CallsPage;
