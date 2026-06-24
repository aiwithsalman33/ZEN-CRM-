import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Contact2, Plus, Upload, Search, Building2, Mail, Phone, X } from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam } from '@/store/selectors';
import {
  PageHeader, Button, DataTable, StatusBadge, Avatar, Drawer, Modal, Field, Input, Select, Textarea,
  TagInput, EmptyState, type Column,
} from '@/components/ui';
import { formatDate, timeAgo, uid } from '@/lib/utils';
import type { Contact, LeadSource } from '@/types';
import { LEAD_SOURCES } from '@/lib/constants';

const ContactsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const { nameOf } = useTeam();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [add, setAdd] = useState(false);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phones: [''], email: '', company: '', designation: '', source: 'Web Form' as LeadSource, assignedTo: state.currentUserId, tags: [] as string[], notes: '' });

  useEffect(() => { if ((location.state as { openAdd?: boolean })?.openAdd) { setAdd(true); navigate('/contacts', { replace: true }); } }, [location.state, navigate]);

  const contacts = useMemo(() => state.contacts.filter((c) => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase())), [state.contacts, search]);

  const save = () => {
    if (!form.name.trim()) { toast('Name required', 'error'); return; }
    const c: Contact = { id: uid('c'), name: form.name, phones: form.phones.filter(Boolean).length ? form.phones.filter(Boolean) : ['+91 90000 00000'], email: form.email, company: form.company, designation: form.designation, source: form.source, assignedTo: form.assignedTo, tags: form.tags, notes: form.notes, createdAt: new Date().toISOString(), lastActivity: new Date().toISOString() };
    dispatch({ type: 'ADD', key: 'contacts', item: c, prepend: true }); toast('Contact added'); setAdd(false);
    setForm({ name: '', phones: [''], email: '', company: '', designation: '', source: 'Web Form', assignedTo: state.currentUserId, tags: [], notes: '' });
  };

  const columns: Column<Contact>[] = [
    { key: 'name', header: 'Name', sortable: true, sortValue: (c) => c.name, render: (c) => <div className="flex items-center gap-2.5"><Avatar name={c.name} size="sm" /><div><p className="font-medium text-ink">{c.name}</p><p className="text-xs text-muted">{c.designation}</p></div></div> },
    { key: 'company', header: 'Company', sortable: true, sortValue: (c) => c.company, render: (c) => <span className="text-muted">{c.company}</span> },
    { key: 'email', header: 'Email', render: (c) => <span className="text-muted">{c.email}</span> },
    { key: 'phones', header: 'Phone', render: (c) => <span className="text-muted text-xs">{c.phones[0]}{c.phones.length > 1 ? ` +${c.phones.length - 1}` : ''}</span> },
    { key: 'source', header: 'Source', render: (c) => <StatusBadge value={c.source} /> },
    { key: 'assignedTo', header: 'Owner', render: (c) => <div className="flex items-center gap-1.5"><Avatar name={nameOf(c.assignedTo)} size="xs" /><span className="text-xs text-muted">{nameOf(c.assignedTo).split(' ')[0]}</span></div> },
    { key: 'lastActivity', header: 'Last Activity', render: (c) => <span className="text-muted text-xs">{timeAgo(c.lastActivity)}</span> },
  ];

  const linkedDeals = detail ? state.deals.filter((d) => d.contactName === detail.name || d.company === detail.company) : [];

  return (
    <div>
      <PageHeader title="Contacts" subtitle={`${state.contacts.length} contacts`} icon={<Contact2 size={20} />}
        actions={<><div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-line bg-white w-52 hidden lg:flex"><Search size={15} className="text-muted" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts…" className="flex-1 outline-none text-sm bg-transparent" /></div><Button variant="outline" onClick={() => setImportOpen(true)}><Upload size={16} /> Import</Button><Button onClick={() => setAdd(true)}><Plus size={16} /> Add Contact</Button></>} />

      {contacts.length === 0 ? (
        <div className="card"><EmptyState icon={Contact2} title="No contacts" description="Add a contact or import a CSV." actionLabel="Add Contact" onAction={() => setAdd(true)} /></div>
      ) : (
        <DataTable columns={columns} rows={contacts} rowKey={(c) => c.id} onRowClick={(c) => setDetail(c)} pageSize={10} />
      )}

      {/* Detail drawer */}
      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name} subtitle={detail?.designation}>
        {detail && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center text-center"><Avatar name={detail.name} size="xl" /><h3 className="text-base font-bold text-ink mt-2">{detail.name}</h3><p className="text-sm text-muted">{detail.designation} at {detail.company}</p></div>
            <div className="card p-4 flex flex-col gap-2.5 text-sm">
              <div className="flex items-center gap-2.5"><Building2 size={15} className="text-muted" /><span className="text-ink">{detail.company}</span></div>
              <div className="flex items-center gap-2.5"><Mail size={15} className="text-muted" /><span className="text-ink">{detail.email}</span></div>
              {detail.phones.map((p, i) => <div key={i} className="flex items-center gap-2.5"><Phone size={15} className="text-muted" /><span className="text-ink">{p}</span></div>)}
            </div>
            {detail.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{detail.tags.map((t) => <span key={t} className="bg-primary-light text-primary text-xs font-medium px-2 py-0.5 rounded-md">{t}</span>)}</div>}
            <div>
              <h4 className="text-sm font-semibold text-ink mb-2">Linked Deals ({linkedDeals.length})</h4>
              {linkedDeals.length === 0 ? <p className="text-sm text-muted">No linked deals.</p> : <ul className="flex flex-col gap-2">{linkedDeals.map((d) => <li key={d.id} onClick={() => navigate(`/deals/${d.id}`)} className="flex items-center justify-between p-2.5 rounded-lg border border-line hover:bg-bg cursor-pointer"><span className="text-sm text-ink truncate">{d.title}</span><StatusBadge value={d.status} /></li>)}</ul>}
            </div>
            <p className="text-xs text-muted">Added {formatDate(detail.createdAt)}</p>
          </div>
        )}
      </Drawer>

      {/* Add drawer */}
      <Drawer open={add} onClose={() => setAdd(false)} title="Add Contact" size="lg"
        footer={<><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={save}>Save Contact</Button></>}>
        <div className="flex flex-col gap-4">
          <Field label="Full Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
            <Field label="Designation"><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
          </div>
          <Field label="Email"><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone Numbers">
            {form.phones.map((p, i) => (
              <div key={i} className="flex gap-2 mb-2"><Input value={p} onChange={(e) => setForm({ ...form, phones: form.phones.map((x, j) => j === i ? e.target.value : x) })} placeholder="+91 …" />{form.phones.length > 1 && <button onClick={() => setForm({ ...form, phones: form.phones.filter((_, j) => j !== i) })} className="text-muted hover:text-danger"><X size={16} /></button>}</div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setForm({ ...form, phones: [...form.phones, ''] })}><Plus size={14} /> Add Phone</Button>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Source"><Select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
            <Field label="Owner"><Select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>{state.team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
          </div>
          <Field label="Tags"><TagInput value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} /></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        </div>
      </Drawer>

      {/* Import modal (mock) */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import Contacts" size="md" footer={<><Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button><Button onClick={() => { setImportOpen(false); toast('Contacts imported (mock)'); }}>Import</Button></>}>
        <div className="border-2 border-dashed border-line rounded-xl p-10 text-center"><Upload size={32} className="text-muted mx-auto mb-3" /><p className="text-sm font-medium text-ink">Drag & drop a CSV file here</p><p className="text-xs text-muted mt-1">or click to browse</p></div>
        <div className="mt-4"><p className="text-xs font-semibold text-muted uppercase mb-2">Column Mapping</p>{['Name → name', 'Email → email', 'Phone → phone', 'Company → company'].map((m) => <div key={m} className="flex items-center justify-between py-1.5 text-sm border-b border-line"><span className="text-ink">{m}</span><span className="text-success text-xs">✓ mapped</span></div>)}</div>
      </Modal>
    </div>
  );
};

export default ContactsPage;
