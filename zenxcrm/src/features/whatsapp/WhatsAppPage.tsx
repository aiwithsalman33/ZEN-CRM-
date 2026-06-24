import React, { useState } from 'react';
import { MessageCircle, Search, Send, Smile, Paperclip, Mic, Plus, Check, CheckCheck, Megaphone, LayoutTemplate } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, Tabs, StatusBadge, Avatar, Modal, Input, EmptyState } from '@/components/ui';
import { formatTime, formatDate, uid } from '@/lib/utils';
import type { WhatsAppMessage } from '@/types';

const WhatsAppPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [view, setView] = useState<'chats' | 'broadcasts' | 'templates'>('chats');
  const [activeId, setActiveId] = useState(state.whatsappConversations[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const convos = state.whatsappConversations
    .filter((c) => c.contactName.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => filter === 'All' || c.unread > 0);
  const active = state.whatsappConversations.find((c) => c.id === activeId);

  const send = () => {
    if (!draft.trim() || !active) return;
    const msg: WhatsAppMessage = { id: uid('wm'), fromMe: true, text: draft, timestamp: new Date().toISOString(), type: 'text', status: 'sent' };
    dispatch({ type: 'UPDATE', key: 'whatsappConversations', id: active.id, patch: { messages: [...active.messages, msg] } });
    setDraft('');
  };
  const openChat = (id: string) => { setActiveId(id); dispatch({ type: 'UPDATE', key: 'whatsappConversations', id, patch: { unread: 0 } }); };

  return (
    <div>
      <PageHeader title="WhatsApp" icon={<MessageCircle size={20} />}
        actions={<Tabs variant="pill" active={view} onChange={(k) => setView(k as typeof view)} tabs={[{ key: 'chats', label: 'Chats' }, { key: 'broadcasts', label: 'Broadcasts' }, { key: 'templates', label: 'Templates' }]} />} />

      {view === 'chats' && (
        <div className="card !p-0 overflow-hidden flex" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Conversation list */}
          <div className="w-full sm:w-80 shrink-0 border-r border-line flex flex-col">
            <div className="p-3 border-b border-line">
              <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-bg mb-2"><Search size={15} className="text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…" className="flex-1 bg-transparent outline-none text-sm" /></div>
              <Tabs variant="pill" active={filter} onChange={(k) => setFilter(k as typeof filter)} tabs={[{ key: 'All', label: 'All' }, { key: 'Unread', label: 'Unread' }]} />
            </div>
            <div className="flex-1 overflow-y-auto">
              {convos.map((c) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <button key={c.id} onClick={() => openChat(c.id)} className={`w-full flex items-center gap-3 p-3 border-b border-line hover:bg-bg text-left ${activeId === c.id ? 'bg-primary-light/40 border-l-2 border-l-primary' : ''}`}>
                    <Avatar name={c.contactName} size="md" />
                    <div className="flex-1 min-w-0"><div className="flex justify-between"><span className="text-sm font-medium text-ink truncate">{c.contactName}</span><span className="text-[11px] text-muted shrink-0">{last && formatTime(last.timestamp)}</span></div><p className="text-xs text-muted truncate">{last?.text}</p></div>
                    {c.unread > 0 && <span className="bg-success text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center">{c.unread}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Chat */}
          <div className="flex-1 flex-col min-w-0 hidden sm:flex" style={{ backgroundColor: '#F0F2F5' }}>
            {active ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-card border-b border-line">
                  <Avatar name={active.contactName} size="sm" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink">{active.contactName}</p><p className="text-xs text-muted">{active.phone}</p></div>
                  <StatusBadge value={active.kind} tone={active.kind === 'Lead' ? 'blue' : 'purple'} />
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {active.messages.map((m) => (
                    <div key={m.id} className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${m.fromMe ? 'self-end bg-primary-light rounded-br-none' : 'self-start bg-white rounded-bl-none shadow-sm'}`}>
                      <p className="text-ink">{m.text}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5"><span className="text-[10px] text-muted">{formatTime(m.timestamp)}</span>{m.fromMe && (m.status === 'read' ? <CheckCheck size={13} className="text-info" /> : m.status === 'delivered' ? <CheckCheck size={13} className="text-muted" /> : <Check size={13} className="text-muted" />)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-3 bg-card border-t border-line">
                  <button className="text-muted hover:text-ink"><Smile size={20} /></button>
                  <button className="text-muted hover:text-ink"><Paperclip size={20} /></button>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message" className="flex-1 h-10 px-3 rounded-full bg-bg outline-none text-sm" />
                  {draft ? <button onClick={send} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center"><Send size={17} /></button> : <button className="text-muted"><Mic size={20} /></button>}
                </div>
              </>
            ) : <EmptyState icon={MessageCircle} title="No conversation selected" />}
          </div>
        </div>
      )}

      {view === 'broadcasts' && (
        <div>
          <div className="flex justify-end mb-3"><Button onClick={() => setBroadcastOpen(true)}><Plus size={16} /> New Broadcast</Button></div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line bg-bg/40 text-xs uppercase tracking-wide text-muted">
                {['Campaign', 'Template', 'Recipients', 'Sent', 'Delivered', 'Read', 'Replied', 'Date'].map((h) => <th key={h} className="text-left font-semibold px-4 py-3">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-line">
                {state.broadcasts.map((b) => (
                  <tr key={b.id} className="hover:bg-bg/50">
                    <td className="px-4 py-3 font-medium text-ink">{b.name}</td><td className="px-4 py-3 text-muted">{b.template}</td>
                    <td className="px-4 py-3 text-muted">{b.recipients}</td><td className="px-4 py-3 text-muted">{b.sent}</td>
                    <td className="px-4 py-3 text-muted">{b.delivered}</td><td className="px-4 py-3 text-info font-medium">{b.read}</td>
                    <td className="px-4 py-3 text-success font-medium">{b.replied}</td><td className="px-4 py-3 text-muted text-xs">{formatDate(b.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'templates' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line bg-bg/40 text-xs uppercase tracking-wide text-muted">
              {['Name', 'Category', 'Status', 'Preview'].map((h) => <th key={h} className="text-left font-semibold px-4 py-3">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-line">
              {state.whatsappTemplates.map((t) => (
                <tr key={t.id} className="hover:bg-bg/50">
                  <td className="px-4 py-3 font-medium text-ink">{t.name}</td><td className="px-4 py-3"><StatusBadge value={t.category} tone="indigo" /></td>
                  <td className="px-4 py-3"><StatusBadge value={t.status} /></td><td className="px-4 py-3 text-muted text-xs max-w-md truncate">{t.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BroadcastModal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} onDone={() => { setBroadcastOpen(false); toast('Broadcast scheduled'); }} />
    </div>
  );
};

const BroadcastModal: React.FC<{ open: boolean; onClose: () => void; onDone: () => void }> = ({ open, onClose, onDone }) => {
  const { state } = useStore();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const reset = () => { setStep(1); setTemplate(''); setPicked([]); };
  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title={`New Broadcast — Step ${step} of 3`} size="lg"
      footer={<><Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : onClose())}>{step > 1 ? 'Back' : 'Cancel'}</Button>{step < 3 ? <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !template}>Next</Button> : <Button onClick={() => { reset(); onDone(); }}>Send to {picked.length}</Button>}</>}>
      {step === 1 && (
        <div className="grid grid-cols-2 gap-3">
          {state.whatsappTemplates.filter((t) => t.status === 'Approved').map((t) => (
            <button key={t.id} onClick={() => setTemplate(t.id)} className={`text-left p-3 rounded-lg border ${template === t.id ? 'border-primary bg-primary-light' : 'border-line'}`}><p className="text-sm font-semibold text-ink">{t.name}</p><p className="text-xs text-muted mt-1 line-clamp-2">{t.body}</p></button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="max-h-80 overflow-y-auto">
          {state.contacts.map((c) => (
            <label key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-bg cursor-pointer">
              <input type="checkbox" checked={picked.includes(c.id)} onChange={() => setPicked((p) => p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id])} className="accent-primary w-4 h-4" />
              <Avatar name={c.name} size="sm" /><div className="flex-1"><p className="text-sm font-medium text-ink">{c.name}</p><p className="text-xs text-muted">{c.phones[0]}</p></div>
            </label>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="text-center py-6">
          <Megaphone size={40} className="text-primary mx-auto mb-3" />
          <p className="text-lg font-semibold text-ink">Ready to send</p>
          <p className="text-sm text-muted mt-1">Template <b>{state.whatsappTemplates.find((t) => t.id === template)?.name}</b> to <b>{picked.length}</b> contacts.</p>
        </div>
      )}
    </Modal>
  );
};

export default WhatsAppPage;
