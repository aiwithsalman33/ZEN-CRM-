import React, { useMemo, useState } from 'react';
import {
  Mail, Send, FileEdit, Clock, LayoutTemplate, Inbox, Star, Paperclip, Bold, Italic,
  Link2, List, Sparkles, Plus, Pencil, Trash2, X, Edit3,
} from 'lucide-react';
import { useStore } from '@/store/store';
import {
  PageHeader, Button, StatusBadge, Avatar, Modal, Field, Input, Textarea, Select, EmptyState, Shimmer,
} from '@/components/ui';
import { formatTime, formatDateTime, timeAgo, uid } from '@/lib/utils';
import type { EmailMessage, EmailTemplate } from '@/types';

type Folder = 'inbox' | 'sent' | 'drafts' | 'scheduled' | 'templates';

const EmailsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [folder, setFolder] = useState<Folder>('inbox');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [search, setSearch] = useState('');

  const folderEmails = useMemo(() => {
    if (folder === 'templates') return [];
    return state.emails.filter((e) => e.folder === folder && `${e.subject} ${e.fromName} ${e.preview}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [state.emails, folder, search]);

  const selected = state.emails.find((e) => e.id === selectedId);
  const inboxUnread = state.emails.filter((e) => e.folder === 'inbox' && !e.read).length;

  const folders: { key: Folder; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'inbox', label: 'Inbox', icon: Inbox, badge: inboxUnread },
    { key: 'sent', label: 'Sent', icon: Send },
    { key: 'drafts', label: 'Drafts', icon: FileEdit },
    { key: 'scheduled', label: 'Scheduled', icon: Clock },
    { key: 'templates', label: 'Templates', icon: LayoutTemplate },
  ];

  return (
    <div>
      <PageHeader title="Emails" icon={<Mail size={20} />} actions={<Button onClick={() => setCompose(true)}><Plus size={16} /> Compose</Button>} />
      <div className="card !p-0 overflow-hidden flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left: folders */}
        <div className="w-full lg:w-56 shrink-0 border-r border-line p-3 flex flex-col gap-1">
          <Button className="w-full mb-2" onClick={() => setCompose(true)}><Pencil size={15} /> Compose Email</Button>
          {folders.map((f) => (
            <button key={f.key} onClick={() => { setFolder(f.key); setSelectedId(null); }} className={`flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium ${folder === f.key ? 'bg-primary-light text-primary' : 'text-muted hover:bg-bg'}`}>
              <f.icon size={16} /> {f.label}
              {f.badge ? <span className="ml-auto text-xs bg-primary text-white rounded-full px-1.5">{f.badge}</span> : null}
            </button>
          ))}
          <div className="mt-3 pt-3 border-t border-line">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted px-3 mb-1">Labels</p>
            {[['Follow-up', '#F59E0B'], ['Proposal', '#3B82F6'], ['Invoice', '#8B5CF6'], ['Important', '#EF4444']].map(([l, c]) => (
              <div key={l} className="flex items-center gap-2 px-3 h-8 text-sm text-muted"><span className="w-2 h-2 rounded-full" style={{ background: c }} />{l}</div>
            ))}
          </div>
        </div>

        {folder === 'templates' ? (
          <TemplatesLibrary />
        ) : (
          <>
            {/* Center: list */}
            <div className="w-full lg:w-80 shrink-0 border-r border-line flex flex-col">
              <div className="p-3 border-b border-line"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mail…" className="!h-9" /></div>
              <div className="flex-1 overflow-y-auto">
                {folderEmails.length === 0 ? <p className="text-sm text-muted text-center py-10">No emails</p> : folderEmails.map((e) => (
                  <button key={e.id} onClick={() => { setSelectedId(e.id); if (!e.read) dispatch({ type: 'UPDATE', key: 'emails', id: e.id, patch: { read: true } }); }}
                    className={`w-full text-left p-3 border-b border-line hover:bg-bg ${selectedId === e.id ? 'bg-primary-light/50' : !e.read ? 'bg-white' : 'bg-bg/30'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar name={e.fromName} size="xs" />
                      <span className={`text-sm flex-1 truncate ${!e.read ? 'font-semibold text-ink' : 'text-muted'}`}>{e.fromName}</span>
                      <span className="text-[11px] text-muted shrink-0">{formatTime(e.timestamp)}</span>
                    </div>
                    <p className={`text-sm truncate ${!e.read ? 'font-medium text-ink' : 'text-muted'}`}>{e.subject}</p>
                    <p className="text-xs text-muted truncate">{e.preview}</p>
                    <div className="flex items-center gap-1.5 mt-1">{e.tag && <StatusBadge value={e.tag} tone="indigo" />}{e.label && <span className="text-[10px] text-muted">{e.label}</span>}{e.attachments > 0 && <Paperclip size={11} className="text-muted" />}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: detail */}
            <div className="flex-1 flex flex-col min-w-0">
              {selected ? (
                <>
                  <div className="p-4 border-b border-line">
                    <h2 className="text-lg font-semibold text-ink mb-2">{selected.subject}</h2>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={selected.fromName} size="sm" />
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-ink">{selected.fromName} <span className="text-muted font-normal">&lt;{selected.from}&gt;</span></p><p className="text-xs text-muted">to {selected.to} · {formatDateTime(selected.timestamp)}</p></div>
                      {selected.tag && <StatusBadge value={selected.tag} tone="indigo" />}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4"><p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{selected.body}</p>{selected.attachments > 0 && <div className="mt-4 flex items-center gap-2 p-2.5 border border-line rounded-lg w-fit"><Paperclip size={15} className="text-muted" /><span className="text-sm text-ink">{selected.attachments} attachment(s)</span></div>}</div>
                  <div className="p-3 border-t border-line">
                    <div className="border border-line rounded-lg">
                      <div className="flex items-center gap-1 p-2 border-b border-line">
                        {[Bold, Italic, Link2, List, Paperclip].map((Ic, i) => <button key={i} className="w-7 h-7 rounded hover:bg-bg flex items-center justify-center text-muted"><Ic size={14} /></button>)}
                      </div>
                      <textarea placeholder={`Reply to ${selected.fromName}…`} className="w-full p-3 text-sm outline-none resize-none h-20" />
                      <div className="flex items-center justify-between p-2 border-t border-line"><label className="flex items-center gap-1.5 text-xs text-muted"><input type="checkbox" className="accent-primary" /> Schedule</label><Button size="sm" onClick={() => toast('Reply sent (mock)')}><Send size={14} /> Send</Button></div>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState icon={Mail} title="Select an email" description="Choose a message from the list to read it here." />
              )}
            </div>
          </>
        )}
      </div>

      <ComposeModal open={compose} onClose={() => setCompose(false)} onSend={(e) => { dispatch({ type: 'ADD', key: 'emails', prepend: true, item: e }); toast(e.folder === 'scheduled' ? 'Email scheduled' : 'Email sent'); setCompose(false); }} />
    </div>
  );
};

const TemplatesLibrary: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [edit, setEdit] = useState<EmailTemplate | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const blank: EmailTemplate = { id: '', name: '', category: 'Follow-up', subject: '', body: '' };
  const variables = ['{{lead_name}}', '{{agent_name}}', '{{company}}', '{{deal_value}}', '{{follow_up_date}}'];

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-ink">Email Templates</h3>
        <Button size="sm" onClick={() => { setEdit({ ...blank, id: uid('et') }); setShowEdit(true); }}><Plus size={15} /> New Template</Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">{variables.map((v) => <code key={v} className="text-xs bg-primary-light text-primary px-2 py-1 rounded-md">{v}</code>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.emailTemplates.map((t) => (
          <div key={t.id} className="card p-4">
            <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-semibold text-ink">{t.name}</h4><StatusBadge value={t.category} tone="indigo" /></div>
            <p className="text-xs text-muted font-medium mb-1">{t.subject}</p>
            <p className="text-xs text-muted line-clamp-3 mb-3">{t.body}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast(`Using template: ${t.name}`)}>Use</Button>
              <button onClick={() => { setEdit(t); setShowEdit(true); }} className="w-8 h-8 rounded-lg bg-bg hover:bg-line flex items-center justify-center text-muted"><Edit3 size={14} /></button>
              <button onClick={() => { dispatch({ type: 'DELETE', key: 'emailTemplates', id: t.id }); toast('Template deleted', 'warning'); }} className="w-8 h-8 rounded-lg bg-bg hover:bg-danger/10 hover:text-danger flex items-center justify-center text-muted"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal open={showEdit} onClose={() => setShowEdit(false)} title={state.emailTemplates.some((t) => t.id === edit.id) ? 'Edit Template' : 'New Template'} size="lg"
          footer={<><Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button><Button onClick={() => {
            const exists = state.emailTemplates.some((t) => t.id === edit.id);
            dispatch(exists ? { type: 'UPDATE', key: 'emailTemplates', id: edit.id, patch: edit } : { type: 'ADD', key: 'emailTemplates', item: edit });
            toast('Template saved'); setShowEdit(false);
          }}>Save</Button></>}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name"><Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="Category"><Select value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{['Welcome', 'Follow-up', 'Proposal', 'Invoice', 'Cold Outreach', 'Reminder'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
            </div>
            <Field label="Subject"><Input value={edit.subject} onChange={(e) => setEdit({ ...edit, subject: e.target.value })} /></Field>
            <Field label="Body"><Textarea value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} className="min-h-[160px]" /></Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ComposeModal: React.FC<{ open: boolean; onClose: () => void; onSend: (e: EmailMessage) => void }> = ({ open, onClose, onSend }) => {
  const { state, toast } = useStore();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [schedule, setSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const reset = () => { setTo(''); setSubject(''); setBody(''); setSchedule(false); setAiPrompt(''); setShowAi(false); };

  const generateAi = () => {
    setAiLoading(true);
    setTimeout(() => {
      setBody(`Hi there,\n\n${aiPrompt ? `Regarding "${aiPrompt}", ` : ''}I wanted to reach out personally. At PipelineX, we help telecalling teams close more deals with less effort.\n\nWould you be open to a quick 15-minute call this week to explore how we can help your team?\n\nLooking forward to hearing from you.\n\nBest regards,\nYour PipelineX Team`);
      if (!subject) setSubject('Quick question about your sales workflow');
      setAiLoading(false);
      toast('AI draft generated');
    }, 1400);
  };

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="New Message" size="xl"
      footer={<><Button variant="ghost" onClick={() => { reset(); onClose(); }}>Discard</Button><Button variant="outline" onClick={() => toast('Saved to drafts')}>Save Draft</Button><Button onClick={() => {
        if (!to.trim()) { toast('Recipient required', 'error'); return; }
        onSend({ id: uid('e'), from: 'me@pipelinex.io', fromName: 'Me', to, subject: subject || '(no subject)', preview: body.slice(0, 60), body, timestamp: schedule && scheduleAt ? new Date(scheduleAt).toISOString() : new Date().toISOString(), folder: schedule ? 'scheduled' : 'sent', read: true, attachments: 0 });
        reset();
      }}>{schedule ? 'Schedule' : 'Send'}</Button></>}>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-3">
          <Select defaultValue="" onChange={(e) => { const t = state.emailTemplates.find((x) => x.id === e.target.value); if (t) { setSubject(t.subject); setBody(t.body); } }}>
            <option value="">Start from template…</option>
            {state.emailTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <div className="border border-line rounded-lg">
            <div className="flex items-center gap-1 p-2 border-b border-line">
              {[Bold, Italic, Link2, List, Paperclip].map((Ic, i) => <button key={i} className="w-7 h-7 rounded hover:bg-bg flex items-center justify-center text-muted"><Ic size={14} /></button>)}
              <button onClick={() => setShowAi((s) => !s)} className="ml-auto flex items-center gap-1 text-xs font-medium text-primary px-2 py-1 rounded-md hover:bg-primary-light"><Sparkles size={13} /> AI Generate</button>
            </div>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message…" className="w-full p-3 text-sm outline-none resize-none h-48" />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} className="accent-primary" /> Schedule send</label>
          {schedule && <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />}
        </div>
        {showAi && (
          <div className="w-64 shrink-0 border-l border-line pl-4 flex flex-col gap-3">
            <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-ink flex items-center gap-1.5"><Sparkles size={15} className="text-primary" /> AI Assistant</h4><button onClick={() => setShowAi(false)}><X size={15} className="text-muted" /></button></div>
            <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe email purpose…" className="min-h-[100px]" />
            <Button size="sm" onClick={generateAi} disabled={aiLoading}><Sparkles size={14} /> {aiLoading ? 'Generating…' : 'Generate'}</Button>
            {aiLoading && <div className="flex flex-col gap-2 mt-2">{Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} className="h-3 w-full" />)}</div>}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmailsPage;
