import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Coffee, LogIn, LogOut, Play } from 'lucide-react';
import { useStore } from '@/store/store';
import { useTeam } from '@/store/selectors';
import { PageHeader, StatusBadge, Avatar, Select, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';

type Phase = 'out' | 'in' | 'break';

const AttendancePage: React.FC = () => {
  const { state } = useStore();
  const { nameOf } = useTeam();
  const [now, setNow] = useState(new Date());
  const [phase, setPhase] = useState<Phase>('out');
  const [checkInAt, setCheckInAt] = useState<Date | null>(null);
  const [breakStart, setBreakStart] = useState<Date | null>(null);
  const [breakMs, setBreakMs] = useState(0);
  const [filterAgent, setFilterAgent] = useState('all');

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const dur = (ms: number) => { const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return `${h}h ${m}m`; };
  const workMs = checkInAt ? now.getTime() - checkInAt.getTime() - breakMs - (phase === 'break' && breakStart ? now.getTime() - breakStart.getTime() : 0) : 0;
  const currentBreakMs = phase === 'break' && breakStart ? breakMs + (now.getTime() - breakStart.getTime()) : breakMs;

  const records = state.attendance.filter((r) => filterAgent === 'all' || r.employeeId === filterAgent);
  const present = state.attendance.filter((r) => r.status === 'Present').length;
  const onBreak = state.team.filter((m) => m.presence === 'Break').length;
  const absent = state.attendance.filter((r) => r.status === 'Absent').length;

  return (
    <div>
      <PageHeader title="Attendance" icon={<MapPin size={20} />} />

      {/* My attendance card */}
      <div className="card p-6 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{formatDate(now.toISOString())}</p>
            <p className="text-3xl font-bold text-ink tabular-nums">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            <div className="flex items-center gap-2 mt-2">
              {phase === 'out' && <span className="flex items-center gap-1.5 text-sm text-muted"><Clock size={16} /> Not Checked In Yet</span>}
              {phase === 'in' && <span className="flex items-center gap-1.5 text-sm text-success font-medium"><Clock size={16} /> Working — {dur(workMs)}</span>}
              {phase === 'break' && <span className="flex items-center gap-1.5 text-sm text-warning font-medium"><Coffee size={16} /> On Break — {dur(now.getTime() - (breakStart?.getTime() ?? 0))}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'out' && <Button variant="accent" onClick={() => { setPhase('in'); setCheckInAt(new Date()); setBreakMs(0); }}><LogIn size={16} /> Check In</Button>}
            {phase === 'in' && <><Button variant="secondary" onClick={() => { setPhase('break'); setBreakStart(new Date()); }} className="!bg-warning/15 !text-warning"><Coffee size={16} /> Start Break</Button><Button variant="danger" onClick={() => { setPhase('out'); setCheckInAt(null); }}><LogOut size={16} /> Check Out</Button></>}
            {phase === 'break' && <><Button variant="accent" onClick={() => { setBreakMs((b) => b + (Date.now() - (breakStart?.getTime() ?? 0))); setBreakStart(null); setPhase('in'); }}><Play size={16} /> End Break</Button><Button variant="danger" onClick={() => { setPhase('out'); setCheckInAt(null); }}><LogOut size={16} /> Check Out</Button></>}
          </div>
        </div>
        {checkInAt && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-line">
            <div><p className="text-xs text-muted">Check-in</p><p className="text-sm font-semibold text-ink">{checkInAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p></div>
            <div><p className="text-xs text-muted">Break time</p><p className="text-sm font-semibold text-ink">{dur(currentBreakMs)}</p></div>
            <div><p className="text-xs text-muted">Active hours</p><p className="text-sm font-semibold text-ink">{dur(workMs)}</p></div>
            <div><p className="text-xs text-muted">Status</p><StatusBadge value={phase === 'break' ? 'Half Day' : 'Present'} /></div>
          </div>
        )}
      </div>

      {/* Manager summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[{ l: 'Present Today', v: present, c: '#22C55E' }, { l: 'On Break', v: onBreak, c: '#F59E0B' }, { l: 'Absent', v: absent, c: '#EF4444' }, { l: 'Total Team', v: state.team.length, c: '#3B82F6' }].map((s) => (
          <div key={s.l} className="card p-4"><p className="text-xs text-muted">{s.l}</p><p className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-line">
            <h3 className="text-sm font-semibold text-ink">Attendance Log</h3>
            <Select className="!h-9 !w-40" value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}><option value="all">All Agents</option>{state.team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line bg-bg/40 text-xs uppercase text-muted">{['Agent', 'Date', 'In', 'Out', 'Break', 'Status', 'Location'].map((h) => <th key={h} className="text-left font-semibold px-4 py-3">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-bg/50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={nameOf(r.employeeId)} size="xs" /><span className="text-ink text-xs">{nameOf(r.employeeId).split(' ')[0]}</span></div></td>
                    <td className="px-4 py-3 text-muted text-xs">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-muted text-xs">{r.checkIn ?? '—'}</td>
                    <td className="px-4 py-3 text-muted text-xs">{r.checkOut ?? '—'}</td>
                    <td className="px-4 py-3 text-muted text-xs">{r.breakMinutes}m</td>
                    <td className="px-4 py-3"><StatusBadge value={r.status} /></td>
                    <td className="px-4 py-3 text-muted text-xs">📍 {r.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Map mock */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">Team Locations</h3>
          <div className="relative h-80 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #E2E8F0, #F1F5F9)' }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }} />
            {state.attendance.slice(0, 6).map((r, i) => (
              <div key={r.id} className="absolute group" style={{ left: `${15 + (i * 13) % 70}%`, top: `${20 + (i * 17) % 60}%` }}>
                <div className="w-3 h-3 rounded-full ring-4 ring-primary/20" style={{ background: r.status === 'Present' ? '#22C55E' : r.status === 'Late' ? '#F59E0B' : '#EF4444' }} />
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-ink text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap z-10">{nameOf(r.employeeId)} · {r.checkIn ?? 'absent'}</div>
              </div>
            ))}
            <div className="absolute bottom-2 right-2 text-[10px] text-muted bg-white/70 px-2 py-0.5 rounded">Mock map</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
