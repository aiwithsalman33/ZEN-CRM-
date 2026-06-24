import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, Tabs, Avatar, ProgressBar, Modal, Field, Input, Select } from '@/components/ui';
import { formatCurrency, uid } from '@/lib/utils';
import type { Goal, GoalType, GoalPeriod } from '@/types';

const fmt = (g: Goal) => (g.type === 'Revenue' ? formatCurrency(g.current) + ' / ' + formatCurrency(g.target) : `${g.current} / ${g.target}`);
const pct = (g: Goal) => (g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0);

const ScoreDonut: React.FC<{ value: number }> = ({ value }) => {
  const r = 26, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  const color = value >= 80 ? '#22C55E' : value >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64"><circle cx="32" cy="32" r={r} fill="none" stroke="#E2E8F0" strokeWidth="6" /><circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} /></svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink">{value}%</span>
    </div>
  );
};

const GoalsPage: React.FC = () => {
  const { state, dispatch, toast } = useStore();
  const [period, setPeriod] = useState<GoalPeriod>('Monthly');
  const [add, setAdd] = useState(false);
  const [form, setForm] = useState({ assigneeId: state.team[0].id, type: 'Calls' as GoalType, target: 50, period: 'Daily' as GoalPeriod, name: 'Daily Calls' });

  const teamGoal = state.goals.find((g) => g.assigneeId === 'all');
  const teamPct = teamGoal ? pct(teamGoal) : 0;

  const save = () => {
    dispatch({ type: 'ADD', key: 'goals', item: { id: uid('g'), name: form.name, type: form.type, assigneeId: form.assigneeId, target: form.target, current: 0, period: form.period } as Goal });
    toast('Goal set'); setAdd(false);
  };

  return (
    <div>
      <PageHeader title="Goals & Targets" icon={<Target size={20} />} actions={<Button onClick={() => setAdd(true)}><Plus size={16} /> Set Goal</Button>} />
      <Tabs className="mb-5" active={period} onChange={(k) => setPeriod(k as GoalPeriod)} tabs={[{ key: 'Daily', label: 'Daily' }, { key: 'Weekly', label: 'Weekly' }, { key: 'Monthly', label: 'Monthly' }, { key: 'Quarterly', label: 'Quarterly' }]} />

      {teamGoal && (
        <div className="card p-5 mb-5 bg-gradient-to-r from-primary to-primary-dark text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div><h3 className="text-sm font-semibold opacity-90">Team Revenue Target</h3><p className="text-2xl font-bold mt-0.5">{formatCurrency(teamGoal.current)} <span className="text-base font-normal opacity-80">of {formatCurrency(teamGoal.target)}</span></p></div>
            <span className="text-3xl font-bold">{teamPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/25 overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${teamPct}%` }} /></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {state.team.map((m) => {
          const goals = state.goals.filter((g) => g.assigneeId === m.id);
          const avg = goals.length ? Math.round(goals.reduce((a, g) => a + pct(g), 0) / goals.length) : 0;
          return (
            <div key={m.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5"><Avatar name={m.name} size="md" /><div><p className="text-sm font-semibold text-ink">{m.name}</p><p className="text-xs text-muted">{m.role}</p></div></div>
                <ScoreDonut value={avg} />
              </div>
              <div className="flex flex-col gap-3">
                {goals.map((g) => <ProgressBar key={g.id} label={`${g.name} · ${fmt(g)}`} value={pct(g)} showPct size="sm" threshold />)}
                {goals.length === 0 && <p className="text-sm text-muted">No goals set.</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={add} onClose={() => setAdd(false)} title="Set a Goal" size="md" footer={<><Button variant="outline" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={save}>Save Goal</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Assign To" className="col-span-2"><Select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}><option value="all">Whole Team</option>{state.team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></Field>
          <Field label="Goal Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as GoalType, name: e.target.value })}>{['Calls', 'Revenue', 'Deals Won', 'Meetings', 'Demos'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Period"><Select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as GoalPeriod })}>{['Daily', 'Weekly', 'Monthly', 'Quarterly'].map((p) => <option key={p}>{p}</option>)}</Select></Field>
          <Field label="Target Value" className="col-span-2"><Input type="number" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} /></Field>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsPage;
