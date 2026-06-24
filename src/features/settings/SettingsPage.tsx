import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Building2, GitBranch, UserCog, ListPlus, Mail, MessageCircle,
  Plug, ShieldCheck, CreditCard, ScrollText, Plus, Trash2, GripVertical, Check, Upload,
} from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, Input, Select, Field, StatusBadge, ProgressBar, Avatar } from '@/components/ui';
import { formatDateTime, uid } from '@/lib/utils';

const SECTIONS = [
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { key: 'leads', label: 'Lead Settings', icon: ListPlus },
  { key: 'fields', label: 'Custom Fields', icon: UserCog },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'audit', label: 'Audit Log', icon: ScrollText },
] as const;

const SettingsPage: React.FC = () => {
  const [section, setSection] = useState<string>('company');
  return (
    <div>
      <PageHeader title="Settings" icon={<SettingsIcon size={20} />} />
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-52 shrink-0">
          <div className="card !p-2 flex lg:flex-col gap-0.5 overflow-x-auto">
            {SECTIONS.map((s) => (
              <button key={s.key} onClick={() => setSection(s.key)} className={`flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm font-medium whitespace-nowrap ${section === s.key ? 'bg-primary-light text-primary' : 'text-muted hover:bg-bg'}`}>
                <s.icon size={16} /> {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {section === 'company' && <CompanySection />}
          {section === 'pipeline' && <PipelineSection />}
          {section === 'leads' && <LeadSettingsSection />}
          {section === 'fields' && <CustomFieldsSection />}
          {section === 'email' && <SmtpSection />}
          {section === 'whatsapp' && <WhatsAppSection />}
          {section === 'integrations' && <IntegrationsSection />}
          {section === 'roles' && <RolesSection />}
          {section === 'billing' && <BillingSection />}
          {section === 'audit' && <AuditSection />}
        </div>
      </div>
    </div>
  );
};

const CompanySection: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [s, setS] = useState(state.settings);
  return (
    <div className="card p-6">
      <h3 className="text-base font-semibold text-ink mb-4">Company Profile</h3>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">PX</div>
        <Button variant="outline"><Upload size={15} /> Upload Logo</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Company Name"><Input value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></Field>
        <Field label="Industry"><Input value={s.industry} onChange={(e) => setS({ ...s, industry: e.target.value })} /></Field>
        <Field label="Website"><Input value={s.website} onChange={(e) => setS({ ...s, website: e.target.value })} /></Field>
        <Field label="Phone"><Input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></Field>
        <Field label="Address" className="md:col-span-2"><Input value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
        <Field label="City"><Input value={s.city} onChange={(e) => setS({ ...s, city: e.target.value })} /></Field>
        <Field label="State"><Input value={s.state} onChange={(e) => setS({ ...s, state: e.target.value })} /></Field>
        <Field label="PIN"><Input value={s.pin} onChange={(e) => setS({ ...s, pin: e.target.value })} /></Field>
        <Field label="Currency"><Select value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value })}>{['INR', 'USD', 'EUR', 'GBP', 'AED'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Timezone"><Input value={s.timezone} onChange={(e) => setS({ ...s, timezone: e.target.value })} /></Field>
        <Field label="Date Format"><Select value={s.dateFormat} onChange={(e) => setS({ ...s, dateFormat: e.target.value })}>{['DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map((d) => <option key={d}>{d}</option>)}</Select></Field>
      </div>
      <div className="flex justify-end mt-5"><Button onClick={() => { dispatch({ type: 'PATCH_SETTINGS', patch: s }); toast('Company profile saved'); }}>Save Changes</Button></div>
    </div>
  );
};

const PipelineSection: React.FC = () => {
  const { state, toast } = useStore();
  return (
    <div className="flex flex-col gap-4">
      {state.pipelines.map((p) => (
        <div key={p.id} className="card p-5">
          <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-ink">{p.name}</h3><span className="text-xs text-muted">{p.stages.length} stages</span></div>
          <div className="flex flex-col gap-2">
            {p.stages.map((st) => (
              <div key={st.key} className="flex items-center gap-3 p-2.5 rounded-lg border border-line">
                <GripVertical size={15} className="text-muted cursor-grab" />
                <span className="w-3 h-3 rounded-full" style={{ background: st.color }} />
                <span className="flex-1 text-sm text-ink">{st.name}</span>
                <span className="text-xs text-muted">{st.probability}%</span>
                <button className="text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => toast('Stage added (mock)')}><Plus size={14} /> Add Stage</Button>
        </div>
      ))}
      <Button className="w-fit" onClick={() => toast('Pipeline added (mock)')}><Plus size={16} /> Add Pipeline</Button>
    </div>
  );
};

const LeadSettingsSection: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [src, setSrc] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-3">Lead Sources</h3>
        <div className="flex flex-wrap gap-2 mb-3">{state.settings.leadSources.map((s) => <span key={s} className="inline-flex items-center gap-1.5 bg-bg text-ink text-sm px-3 py-1.5 rounded-lg">{s}<button onClick={() => { dispatch({ type: 'PATCH_SETTINGS', patch: { leadSources: state.settings.leadSources.filter((x) => x !== s) } }); }} className="text-muted hover:text-danger"><Trash2 size={13} /></button></span>)}</div>
        <div className="flex gap-2"><Input value={src} onChange={(e) => setSrc(e.target.value)} placeholder="New source name" className="max-w-xs" /><Button onClick={() => { if (src.trim()) { dispatch({ type: 'PATCH_SETTINGS', patch: { leadSources: [...state.settings.leadSources, src.trim()] } }); setSrc(''); toast('Source added'); } }}><Plus size={15} /> Add</Button></div>
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-3">Lead Statuses</h3>
        <div className="flex flex-col gap-2">{['New', 'Contacted', 'Qualified', 'Not Interested', 'Junk', 'Converted'].map((s) => <div key={s} className="flex items-center gap-3 p-2.5 rounded-lg border border-line"><GripVertical size={15} className="text-muted" /><StatusBadge value={s} dot /><span className="flex-1" /><button className="text-muted hover:text-danger"><Trash2 size={14} /></button></div>)}</div>
      </div>
      <div className="card p-5 flex items-center justify-between"><div><p className="text-sm font-semibold text-ink">Auto-assignment (Round Robin)</p><p className="text-xs text-muted">Automatically distribute new leads across agents.</p></div><button className="relative w-11 h-6 rounded-full bg-success"><span className="absolute top-0.5 left-5 w-5 h-5 rounded-full bg-white" /></button></div>
    </div>
  );
};

const CustomFieldsSection: React.FC = () => {
  const [mod, setMod] = useState<'Leads' | 'Contacts' | 'Deals'>('Leads');
  const { toast } = useStore();
  const fields = [{ label: 'Industry', type: 'Dropdown', required: false }, { label: 'Budget', type: 'Number', required: true }, { label: 'Source Campaign', type: 'Text', required: false }];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex p-0.5 rounded-lg bg-bg border border-line">{(['Leads', 'Contacts', 'Deals'] as const).map((m) => <button key={m} onClick={() => setMod(m)} className={`px-3 py-1.5 rounded-md text-sm font-medium ${mod === m ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>{m}</button>)}</div>
        <Button size="sm" onClick={() => toast('Field added (mock)')}><Plus size={14} /> Add Field</Button>
      </div>
      <table className="w-full text-sm"><thead><tr className="text-xs uppercase text-muted border-b border-line"><th className="text-left font-semibold py-2">Label</th><th className="text-left font-semibold py-2">Type</th><th className="text-center font-semibold py-2">Required</th><th className="text-right font-semibold py-2"></th></tr></thead>
        <tbody className="divide-y divide-line">{fields.map((f) => <tr key={f.label}><td className="py-3 text-ink">{f.label}</td><td className="py-3"><StatusBadge value={f.type} tone="indigo" /></td><td className="py-3 text-center">{f.required ? <Check size={15} className="text-success inline" /> : '—'}</td><td className="py-3 text-right"><button className="text-muted hover:text-danger"><Trash2 size={14} /></button></td></tr>)}</tbody></table>
    </div>
  );
};

const SmtpSection: React.FC = () => {
  const { toast } = useStore();
  return (
    <div className="card p-6"><h3 className="text-base font-semibold text-ink mb-4">Email (SMTP) Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="SMTP Host"><Input defaultValue="smtp.pipelinex.io" /></Field><Field label="Port"><Input defaultValue="587" /></Field>
        <Field label="Username"><Input defaultValue="noreply@pipelinex.io" /></Field><Field label="Password"><Input type="password" defaultValue="••••••••" /></Field>
        <Field label="From Name"><Input defaultValue="PipelineX Sales" /></Field><Field label="Encryption"><Select><option>TLS</option><option>SSL</option></Select></Field>
      </div>
      <div className="flex justify-end mt-5 gap-2"><Button variant="outline" onClick={() => toast('Test email sent')}>Send Test</Button><Button onClick={() => toast('SMTP settings saved')}>Save</Button></div>
    </div>
  );
};

const WhatsAppSection: React.FC = () => {
  const { toast } = useStore();
  return (
    <div className="card p-6"><h3 className="text-base font-semibold text-ink mb-4">WhatsApp Business API</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="API Key"><Input defaultValue="wa_live_xxxxxxxxxxxx" /></Field><Field label="Phone Number"><Input defaultValue="+91 90000 12345" /></Field>
        <Field label="Webhook URL" className="md:col-span-2"><Input defaultValue="https://api.pipelinex.io/wa/webhook" /></Field>
      </div>
      <div className="flex justify-end mt-5"><Button onClick={() => toast('WhatsApp settings saved')}>Save</Button></div>
    </div>
  );
};

const IntegrationsSection: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {state.integrations.map((it) => (
        <div key={it.id} className="card p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-bg flex items-center justify-center text-sm font-bold text-ink">{it.name.slice(0, 2)}</div><div><p className="text-sm font-semibold text-ink">{it.name}</p><p className="text-xs text-muted">{it.category}</p></div></div>
          {it.connected ? <div className="flex items-center gap-2 mb-3"><StatusBadge value="Connected ✓" tone="green" /><span className="text-xs text-muted">synced {it.lastSync ? 'recently' : ''}</span></div> : <p className="text-xs text-muted mb-3">Not connected</p>}
          <Button variant={it.connected ? 'outline' : 'primary'} size="sm" className="w-full" onClick={() => { dispatch({ type: 'UPDATE', key: 'integrations', id: it.id, patch: { connected: !it.connected, lastSync: new Date().toISOString() } }); toast(it.connected ? `${it.name} disconnected` : `${it.name} connected`); }}>{it.connected ? 'Disconnect' : 'Connect'}</Button>
        </div>
      ))}
    </div>
  );
};

const RolesSection: React.FC = () => {
  const { toast } = useStore();
  const roles = ['Admin', 'Manager', 'Agent', 'Viewer'];
  const mods = ['Leads', 'Deals', 'Contacts', 'Calls', 'Reports', 'Settings'];
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-line bg-bg/40"><th className="text-left font-semibold px-4 py-3 text-xs uppercase text-muted">Module</th>{roles.map((r) => <th key={r} className="text-center font-semibold px-4 py-3 text-xs uppercase text-muted">{r}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">{mods.map((m) => <tr key={m}><td className="px-4 py-3 font-medium text-ink">{m}</td>{roles.map((r) => <td key={r} className="px-4 py-3 text-center"><input type="checkbox" defaultChecked={r !== 'Viewer' || m === 'Reports'} className="accent-primary" /></td>)}</tr>)}</tbody></table></div>
      <div className="p-4 border-t border-line flex justify-end"><Button onClick={() => toast('Permissions saved')}>Save Permissions</Button></div>
    </div>
  );
};

const BillingSection: React.FC = () => {
  const { toast } = useStore();
  return (
    <div className="flex flex-col gap-5">
      <div className="card p-6 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm opacity-90">Current Plan</p><p className="text-2xl font-bold">Growth</p><p className="text-sm opacity-80 mt-1">10 users · Renews 15 Jul 2026</p></div><Button className="!bg-white !text-primary">Upgrade Plan</Button></div>
      </div>
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Usage</h3>
        <div className="flex flex-col gap-3">
          <ProgressBar label="Records (6,400 / 10,000)" value={64} showPct size="sm" />
          <ProgressBar label="Users (6 / 10)" value={60} showPct size="sm" />
          <ProgressBar label="Pipelines (3 / 5)" value={60} showPct size="sm" />
          <ProgressBar label="Storage (3.2 / 10 GB)" value={32} showPct size="sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ n: 'Free', p: '₹0' }, { n: 'Starter', p: '₹4,999' }, { n: 'Growth', p: '₹9,999', cur: true }, { n: 'Enterprise', p: 'Custom' }].map((pl) => (
          <div key={pl.n} className={`card p-5 text-center ${pl.cur ? 'border-2 border-primary' : ''}`}><p className="text-sm font-semibold text-ink">{pl.n}</p><p className="text-2xl font-bold text-ink my-2">{pl.p}<span className="text-xs text-muted font-normal">/mo</span></p><Button variant={pl.cur ? 'outline' : 'primary'} size="sm" className="w-full" disabled={pl.cur} onClick={() => toast(`Upgrading to ${pl.n}`)}>{pl.cur ? 'Current' : 'Choose'}</Button></div>
        ))}
      </div>
    </div>
  );
};

const AuditSection: React.FC = () => {
  const { state } = useStore();
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-line bg-bg/40 text-xs uppercase text-muted">{['User', 'Action', 'Module', 'Record', 'Change', 'IP', 'Time'].map((h) => <th key={h} className="text-left font-semibold px-4 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">{state.auditLog.map((a) => <tr key={a.id} className="hover:bg-bg/50">
          <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={a.user} size="xs" /><span className="text-ink text-xs">{a.user}</span></div></td>
          <td className="px-4 py-3"><StatusBadge value={a.action} tone="indigo" /></td><td className="px-4 py-3 text-muted">{a.module}</td>
          <td className="px-4 py-3 text-ink">{a.record}</td><td className="px-4 py-3 text-muted text-xs">{a.oldValue ? `${a.oldValue} → ${a.newValue}` : '—'}</td>
          <td className="px-4 py-3 text-muted text-xs">{a.ip}</td><td className="px-4 py-3 text-muted text-xs">{formatDateTime(a.timestamp)}</td>
        </tr>)}</tbody></table></div>
    </div>
  );
};

export default SettingsPage;
