import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckSquare, Square, Plus, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam } from '@/store/selectors';
import { PageHeader, Button, PriorityBadge, Avatar, Modal, Field, Input, Select, Tabs, EmptyState } from '@/components/ui';
import { formatDate, formatTime, uid } from '@/lib/utils';
import type { Task, Priority } from '@/types';

const TasksPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const { nameOf } = useTeam();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'done'>('all');
  const [add, setAdd] = useState(false);
  const [form, setForm] = useState({ title: '', dueDate: '', priority: 'Medium' as Priority, assignedTo: state.currentUserId });

  useEffect(() => { if ((location.state as { openAdd?: boolean })?.openAdd) { setAdd(true); navigate('/tasks', { replace: true }); } }, [location.state, navigate]);

  const now = Date.now();
  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
  const tasks = state.tasks.filter((t) => {
    if (tab === 'done') return t.done;
    if (tab === 'all') return !t.done;
    if (tab === 'today') return !t.done && isToday(t.dueDate);
    if (tab === 'overdue') return !t.done && new Date(t.dueDate).getTime() < now && !isToday(t.dueDate);
    if (tab === 'upcoming') return !t.done && new Date(t.dueDate).getTime() > now;
    return true;
  }).sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  const counts = {
    all: state.tasks.filter((t) => !t.done).length,
    today: state.tasks.filter((t) => !t.done && isToday(t.dueDate)).length,
    upcoming: state.tasks.filter((t) => !t.done && new Date(t.dueDate).getTime() > now).length,
    overdue: state.tasks.filter((t) => !t.done && new Date(t.dueDate).getTime() < now && !isToday(t.dueDate)).length,
    done: state.tasks.filter((t) => t.done).length,
  };

  const save = () => {
    if (!form.title.trim()) { toast('Title required', 'error'); return; }
    dispatch({ type: 'ADD', key: 'tasks', prepend: true, item: { id: uid('t'), title: form.title, done: false, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : new Date().toISOString(), priority: form.priority, assignedTo: form.assignedTo } as Task });
    toast('Task created'); setAdd(false); setForm({ title: '', dueDate: '', priority: 'Medium', assignedTo: state.currentUserId });
  };

  return (
    <div>
      <PageHeader title="My Tasks" icon={<CheckSquare size={20} />} actions={<Button onClick={() => setAdd(true)}><Plus size={16} /> Add Task</Button>} />
      <Tabs className="mb-4" active={tab} onChange={(k) => setTab(k as typeof tab)} tabs={[{ key: 'all', label: 'All', count: counts.all }, { key: 'today', label: 'Today', count: counts.today }, { key: 'upcoming', label: 'Upcoming', count: counts.upcoming }, { key: 'overdue', label: 'Overdue', count: counts.overdue }, { key: 'done', label: 'Completed', count: counts.done }]} />

      {tasks.length === 0 ? (
        <div className="card"><EmptyState icon={CheckCircle2} title="All clear!" description="No tasks in this view." actionLabel="Add Task" onAction={() => setAdd(true)} /></div>
      ) : (
        <div className="card divide-y divide-line">
          {tasks.map((t) => {
            const overdue = !t.done && new Date(t.dueDate).getTime() < now && !isToday(t.dueDate);
            return (
              <div key={t.id} className="flex items-center gap-3 p-3.5 hover:bg-bg/50">
                <button onClick={() => { dispatch({ type: 'UPDATE', key: 'tasks', id: t.id, patch: { done: !t.done } }); }} className="text-muted hover:text-primary">{t.done ? <CheckSquare size={20} className="text-success" /> : <Square size={20} />}</button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${t.done ? 'line-through text-muted' : 'text-ink font-medium'}`}>{t.title}</p>
                  <p className={`text-xs ${overdue ? 'text-danger font-medium' : 'text-muted'}`}>{formatDate(t.dueDate)} · {formatTime(t.dueDate)}</p>
                </div>
                <PriorityBadge priority={t.priority} />
                <Avatar name={nameOf(t.assignedTo)} size="xs" />
              </div>
            );
          })}
        </div>
      )}

      <Modal open={add} onClose={() => setAdd(false)} title="Add Task" size="md" footer={<><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={save}>Create Task</Button></>}>
        <div className="flex flex-col gap-4">
          <Field label="Task" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" autoFocus /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Due date"><Input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
            <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>{['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}</Select></Field>
          </div>
          <Field label="Assigned To"><Select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>{state.team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
        </div>
      </Modal>
    </div>
  );
};

export default TasksPage;
