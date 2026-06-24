import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Zap, Filter, Clock, Mail, MessageCircle, BellRing, Tag,
  CheckSquare, UserPlus, Trophy, FileText, GitBranch, Settings2,
} from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, Modal, Select, Field, Input } from '@/components/ui';
import { uid } from '@/lib/utils';
import type { Workflow, WorkflowNode, WorkflowNodeKind } from '@/types';

const ICONS: Record<string, React.ElementType> = { Zap, Filter, Clock, Mail, MessageCircle, BellRing, Tag, CheckSquare, UserPlus, Trophy, FileText, GitBranch };
const kindStyle: Record<WorkflowNodeKind, { border: string; bg: string; label: string }> = {
  trigger: { border: '#3B82F6', bg: '#E8F0FE', label: 'TRIGGER' },
  condition: { border: '#8B5CF6', bg: '#F3E8FF', label: 'CONDITION' },
  action: { border: '#FF6B35', bg: '#FFF0EB', label: 'ACTION' },
  delay: { border: '#F59E0B', bg: '#FEF3E2', label: 'DELAY' },
};

const ACTION_TYPES = [
  { title: 'Send Email', icon: 'Mail', description: 'Send an email template' },
  { title: 'Send WhatsApp', icon: 'MessageCircle', description: 'Send a WhatsApp template' },
  { title: 'Assign to Agent', icon: 'UserPlus', description: 'Auto-assign to an agent' },
  { title: 'Change Lead Status', icon: 'GitBranch', description: 'Update the lead status' },
  { title: 'Create Task', icon: 'CheckSquare', description: 'Create a follow-up task' },
  { title: 'Add Tag', icon: 'Tag', description: 'Tag the record' },
  { title: 'Notify Agent', icon: 'BellRing', description: 'Send a notification' },
  { title: 'Wait', icon: 'Clock', description: 'Delay X days', kind: 'delay' as const },
];

const WorkflowBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, toast } = useStore();
  const wf = state.workflows.find((w) => w.id === id);
  const [name, setName] = useState(wf?.name ?? '');
  const [addOpen, setAddOpen] = useState(false);

  if (!wf) return <div className="card p-8 text-center text-muted">Workflow not found. <button className="text-primary" onClick={() => navigate('/automation')}>Back</button></div>;

  const update = (patch: Partial<Workflow>) => dispatch({ type: 'UPDATE', key: 'workflows', id: wf.id, patch });
  const addNode = (a: typeof ACTION_TYPES[number]) => {
    const node: WorkflowNode = { id: uid('n'), kind: a.kind ?? 'action', icon: a.icon, title: a.title, description: a.description };
    update({ nodes: [...wf.nodes, node] }); setAddOpen(false); toast('Step added');
  };
  const removeNode = (nid: string) => update({ nodes: wf.nodes.filter((n) => n.id !== nid) });

  return (
    <div>
      <PageHeader
        title="Workflow Builder"
        icon={<button onClick={() => navigate('/automation')} className="text-muted hover:text-ink"><ArrowLeft size={20} /></button>}
        actions={
          <>
            <button onClick={() => { update({ active: !wf.active }); toast(wf.active ? 'Paused' : 'Activated'); }} className={`relative w-11 h-6 rounded-full ${wf.active ? 'bg-success' : 'bg-line'}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${wf.active ? 'left-5' : 'left-0.5'}`} /></button>
            <Button onClick={() => { update({ name }); toast('Workflow saved'); navigate('/automation'); }}><Save size={16} /> Save</Button>
          </>
        }
      />

      <div className="mb-5"><Input value={name} onChange={(e) => setName(e.target.value)} className="!h-11 text-lg font-semibold max-w-md" placeholder="Workflow name" /></div>

      <div className="card p-8 rounded-2xl" style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <div className="flex flex-col items-center">
          {wf.nodes.map((node, i) => {
            const Icon = ICONS[node.icon] ?? Zap;
            const s = kindStyle[node.kind];
            return (
              <React.Fragment key={node.id}>
                <div className="w-full max-w-md card p-4 flex items-start gap-3" style={{ borderLeft: `4px solid ${s.border}` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.border }}><Icon size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold tracking-wide" style={{ color: s.border }}>{s.label}</span>
                    <p className="text-sm font-semibold text-ink">{node.title}</p>
                    <p className="text-xs text-muted">{node.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded-md hover:bg-bg flex items-center justify-center text-muted" title="Configure"><Settings2 size={13} /></button>
                    {node.kind !== 'trigger' && <button onClick={() => removeNode(node.id)} className="w-7 h-7 rounded-md hover:bg-danger/10 hover:text-danger flex items-center justify-center text-muted"><Trash2 size={13} /></button>}
                  </div>
                </div>
                {i < wf.nodes.length - 1 && <div className="w-0.5 h-6 bg-line" />}
              </React.Fragment>
            );
          })}
          <div className="w-0.5 h-6 bg-line" />
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-4 h-10 rounded-lg border border-dashed border-primary/40 text-sm font-medium text-primary hover:bg-primary-light"><Plus size={15} /> Add Action</button>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a Step" size="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTION_TYPES.map((a) => {
            const Icon = ICONS[a.icon] ?? Zap;
            return (
              <button key={a.title} onClick={() => addNode(a)} className="flex items-center gap-3 p-3 rounded-lg border border-line hover:border-primary/40 hover:bg-bg text-left">
                <div className="w-9 h-9 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0"><Icon size={16} /></div>
                <div><p className="text-sm font-medium text-ink">{a.title}</p><p className="text-xs text-muted">{a.description}</p></div>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default WorkflowBuilder;
