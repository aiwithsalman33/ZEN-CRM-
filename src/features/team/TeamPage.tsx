import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3 } from 'lucide-react';
import { useStore } from '@/store/store';
import {
  PageHeader, Button, Tabs, DataTable, StatusBadge, Avatar, Modal, Field, Input, Select, type Column,
} from '@/components/ui';
import { formatCurrency, timeAgo, uid } from '@/lib/utils';
import type { TeamMember, TeamRole, PresenceStatus } from '@/types';

const MODULES = ['Leads', 'Deals', 'Contacts', 'Calls', 'Reports', 'Team', 'Settings', 'Quotes'];
const ROLES: TeamRole[] = ['Admin', 'Manager', 'Agent', 'Viewer'];
const PERMS = ['View', 'Create', 'Edit', 'Delete'];

const TeamPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [tab, setTab] = useState<'users' | 'teams' | 'live' | 'roles'>('users');
  const [addUser, setAddUser] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Agent' as TeamRole, team: 'Alpha' });

  const saveUser = () => {
    if (!form.name.trim() || !form.email.trim()) { toast('Name & email required', 'error'); return; }
    const m: TeamMember = { id: uid('u'), name: form.name, email: form.email, phone: form.phone, role: form.role, team: form.team, active: true, presence: 'Offline', presenceSince: new Date().toISOString(), lastActive: new Date().toISOString(), stats: { calls: 0, connected: 0, dealsWon: 0, revenue: 0, tasks: 0 } };
    dispatch({ type: 'ADD', key: 'team', item: m }); toast('User added'); setAddUser(false); setForm({ name: '', email: '', phone: '', role: 'Agent', team: 'Alpha' });
  };

  const userColumns: Column<TeamMember>[] = [
    { key: 'name', header: 'Name', sortable: true, sortValue: (m) => m.name, render: (m) => <div className="flex items-center gap-2.5"><Avatar name={m.name} size="sm" presence={m.presence} /><span className="font-medium text-ink">{m.name}</span></div> },
    { key: 'email', header: 'Email', render: (m) => <span className="text-muted">{m.email}</span> },
    { key: 'phone', header: 'Phone', render: (m) => <span className="text-muted text-xs">{m.phone}</span> },
    { key: 'role', header: 'Role', render: (m) => <StatusBadge value={m.role} /> },
    { key: 'active', header: 'Status', render: (m) => (
      <button onClick={() => dispatch({ type: 'UPDATE', key: 'team', id: m.id, patch: { active: !m.active } })} className={`relative w-10 h-5 rounded-full transition-colors ${m.active ? 'bg-success' : 'bg-line'}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${m.active ? 'left-5' : 'left-0.5'}`} /></button>
    ) },
    { key: 'lastActive', header: 'Last Active', render: (m) => <span className="text-muted text-xs">{timeAgo(m.lastActive)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Team Management" icon={<Users size={20} />} actions={tab === 'users' ? <Button onClick={() => setAddUser(true)}><Plus size={16} /> Add User</Button> : undefined} />
      <Tabs className="mb-5" active={tab} onChange={(k) => setTab(k as typeof tab)} tabs={[{ key: 'users', label: 'Users', count: state.team.length }, { key: 'teams', label: 'Teams' }, { key: 'live', label: 'Live Status' }, { key: 'roles', label: 'Roles' }]} />

      {tab === 'users' && <DataTable columns={userColumns} rows={state.team} rowKey={(m) => m.id} pageSize={10} />}

      {tab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {['Alpha', 'Bravo'].map((tname) => {
            const members = state.team.filter((m) => m.team === tname);
            const lead = members.find((m) => m.role === 'Manager' || m.role === 'Admin') ?? members[0];
            const rev = members.reduce((a, m) => a + m.stats.revenue, 0);
            return (
              <div key={tname} className="card p-5">
                <div className="flex items-center justify-between mb-3"><h3 className="text-base font-semibold text-ink">Team {tname}</h3><StatusBadge value={`${members.length} members`} tone="indigo" /></div>
                <div className="flex items-center gap-2 mb-3"><Avatar name={lead.name} size="sm" /><div><p className="text-xs text-muted">Team Lead</p><p className="text-sm font-medium text-ink">{lead.name}</p></div></div>
                <div className="flex -space-x-2 mb-3">{members.map((m) => <div key={m.id} className="ring-2 ring-white rounded-full"><Avatar name={m.name} size="sm" /></div>)}</div>
                <div className="grid grid-cols-2 gap-2 text-sm"><div><p className="text-xs text-muted">Revenue</p><p className="font-semibold text-ink">{formatCurrency(rev)}</p></div><div><p className="text-xs text-muted">Deals Won</p><p className="font-semibold text-ink">{members.reduce((a, m) => a + m.stats.dealsWon, 0)}</p></div></div>
                <Button variant="outline" size="sm" className="w-full mt-3">Manage Team</Button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'live' && <LiveStatus />}

      {tab === 'roles' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line bg-bg/40"><th className="text-left font-semibold px-4 py-3 text-xs uppercase text-muted">Module</th>{ROLES.map((r) => <th key={r} className="text-center font-semibold px-4 py-3 text-xs uppercase text-muted" colSpan={1}>{r}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {MODULES.map((mod) => (
                  <tr key={mod}><td className="px-4 py-3 font-medium text-ink">{mod}</td>{ROLES.map((r) => (
                    <td key={r} className="px-4 py-2"><div className="flex items-center justify-center gap-1.5">{PERMS.map((p) => <label key={p} title={p} className="flex flex-col items-center"><input type="checkbox" defaultChecked={r === 'Admin' || (r === 'Manager' && p !== 'Delete') || (r === 'Agent' && ['View', 'Create', 'Edit'].includes(p)) || (r === 'Viewer' && p === 'View')} className="accent-primary" /><span className="text-[9px] text-muted">{p[0]}</span></label>)}</div></td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-line flex justify-end"><Button onClick={() => toast('Permissions saved')}>Save Permissions</Button></div>
        </div>
      )}

      <Modal open={addUser} onClose={() => setAddUser(false)} title="Add User" size="md" footer={<><Button variant="outline" onClick={() => setAddUser(false)}>Cancel</Button><Button onClick={saveUser}>Add User</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" required className="col-span-2"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email" required><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Role"><Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as TeamRole })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</Select></Field>
          <Field label="Team"><Select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>{['Alpha', 'Bravo'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
        </div>
      </Modal>
    </div>
  );
};

const LiveStatus: React.FC = () => {
  const { state, dispatch } = useStore();
  const presences: PresenceStatus[] = ['Active', 'Break', 'In Call', 'Offline'];
  // auto-refresh: cycle a random agent's presence every 30s (mock)
  useEffect(() => {
    const t = setInterval(() => {
      const m = state.team[Math.floor(Math.random() * state.team.length)];
      const next = presences[Math.floor(Math.random() * presences.length)];
      dispatch({ type: 'SET_PRESENCE', id: m.id, presence: next });
    }, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const border: Record<PresenceStatus, string> = { Active: '#22C55E', Break: '#F59E0B', 'In Call': '#3B82F6', Offline: '#94A3B8' };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {state.team.map((m) => (
        <div key={m.id} className="card p-5" style={{ borderTop: `3px solid ${border[m.presence]}` }}>
          <div className="flex items-center gap-3 mb-3"><Avatar name={m.name} size="lg" presence={m.presence} /><div><p className="text-base font-semibold text-ink">{m.name}</p><p className="text-xs text-muted">{m.role} · {m.team}</p></div></div>
          <StatusBadge value={m.presence} dot />
          <p className="text-xs text-muted mt-1">Since {timeAgo(m.presenceSince)}</p>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-line text-center">
            <div><p className="text-lg font-bold text-ink">{m.stats.calls}</p><p className="text-[11px] text-muted">Calls</p></div>
            <div><p className="text-lg font-bold text-ink">{m.stats.dealsWon}</p><p className="text-[11px] text-muted">Deals</p></div>
            <div><p className="text-lg font-bold text-ink">{m.stats.tasks}</p><p className="text-[11px] text-muted">Tasks</p></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamPage;
