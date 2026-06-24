import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Workflow as WorkflowIcon, Plus, Zap, Clock, Activity, Edit3, Trash2, Mail, MessageCircle, Bell, Trophy, FileText, UserPlus } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, StatCard, StatusBadge, ConfirmDialog } from '@/components/ui';
import { timeAgo, uid } from '@/lib/utils';
import type { Workflow } from '@/types';

const TEMPLATES = [
  { name: 'New Lead Welcome', desc: 'Auto-send a welcome email when a lead is created', icon: UserPlus, actions: 2 },
  { name: 'Follow-up Reminder', desc: 'Create a task if no activity in 2 days', icon: Clock, actions: 2 },
  { name: 'Deal Won Celebration', desc: 'Notify the team when a deal is won', icon: Trophy, actions: 2 },
  { name: 'Inactive Lead Re-engage', desc: 'Send WhatsApp if idle for 7 days', icon: MessageCircle, actions: 2 },
  { name: 'Quote Expiry Alert', desc: 'Alert agent 2 days before expiry', icon: FileText, actions: 2 },
  { name: 'Missed Call Follow-up', desc: 'Auto-task on a missed call', icon: Bell, actions: 1 },
];

const AutomationPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const navigate = useNavigate();
  const [del, setDel] = React.useState<Workflow | null>(null);

  const active = state.workflows.filter((w) => w.active).length;
  const triggered = state.workflows.reduce((a, w) => a + w.triggeredToday, 0);

  const createFromTemplate = (name: string) => {
    const wf: Workflow = { id: uid('w'), name, trigger: 'When a Lead is created', active: false, triggeredToday: 0, nodes: [{ id: uid('n'), kind: 'trigger', icon: 'UserPlus', title: 'Lead Created', description: 'Triggers when a new lead is added' }, { id: uid('n'), kind: 'action', icon: 'Mail', title: 'Send Email', description: 'Welcome template' }] };
    dispatch({ type: 'ADD', key: 'workflows', item: wf, prepend: true }); toast('Workflow created'); navigate(`/automation/${wf.id}`);
  };

  return (
    <div>
      <PageHeader title="Workflows & Automation" icon={<WorkflowIcon size={20} />} actions={<Button onClick={() => createFromTemplate('Untitled Workflow')}><Plus size={16} /> Create Workflow</Button>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon={Zap} label="Active Workflows" value={active} accent="#FF6B35" />
        <StatCard icon={Activity} label="Triggered Today" value={triggered} accent="#3B82F6" />
        <StatCard icon={Activity} label="Actions Executed" value={triggered * 2} accent="#22C55E" />
        <StatCard icon={Clock} label="Time Saved" value={`${triggered * 3}m`} accent="#8B5CF6" />
      </div>

      <div className="card overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-line bg-bg/40 text-xs uppercase text-muted">{['Workflow', 'Trigger', 'Actions', 'Status', 'Last Triggered', ''].map((h) => <th key={h} className="text-left font-semibold px-4 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {state.workflows.map((w) => (
              <tr key={w.id} className="hover:bg-bg/50 cursor-pointer" onClick={() => navigate(`/automation/${w.id}`)}>
                <td className="px-4 py-3 font-medium text-ink">{w.name}</td>
                <td className="px-4 py-3 text-muted text-xs">{w.trigger}</td>
                <td className="px-4 py-3 text-muted">{w.nodes.filter((n) => n.kind === 'action').length}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { dispatch({ type: 'UPDATE', key: 'workflows', id: w.id, patch: { active: !w.active } }); toast(w.active ? 'Workflow paused' : 'Workflow activated'); }} className={`relative w-10 h-5 rounded-full transition-colors ${w.active ? 'bg-success' : 'bg-line'}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${w.active ? 'left-5' : 'left-0.5'}`} /></button>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{w.lastRun ? timeAgo(w.lastRun) : '—'}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-1.5"><button onClick={() => navigate(`/automation/${w.id}`)} className="w-8 h-8 rounded-lg bg-bg hover:bg-line flex items-center justify-center text-muted"><Edit3 size={14} /></button><button onClick={() => setDel(w)} className="w-8 h-8 rounded-lg bg-bg hover:bg-danger/10 hover:text-danger flex items-center justify-center text-muted"><Trash2 size={14} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold text-ink mb-3">Pre-built Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3"><t.icon size={20} /></div>
            <h4 className="text-sm font-semibold text-ink">{t.name}</h4>
            <p className="text-xs text-muted mt-1 mb-3">{t.desc}</p>
            <div className="flex items-center justify-between"><StatusBadge value={`${t.actions} actions`} tone="indigo" /><Button size="sm" variant="outline" onClick={() => createFromTemplate(t.name)}>Use Template</Button></div>
          </div>
        ))}
      </div>

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete workflow?" message={`Remove "${del?.name}"?`} confirmLabel="Delete" onConfirm={() => { if (del) { dispatch({ type: 'DELETE', key: 'workflows', id: del.id }); toast('Workflow deleted', 'warning'); } }} />
    </div>
  );
};

export default AutomationPage;
