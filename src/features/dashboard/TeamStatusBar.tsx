import React, { useState } from 'react';
import { Avatar, StatusBadge, ActivityTimeline, Drawer } from '@/components/ui';
import { useStore } from '@/store/store';
import type { PresenceStatus, TeamMember } from '@/types';

const dot: Record<PresenceStatus, string> = {
  Active: 'bg-success', Break: 'bg-warning', 'In Call': 'bg-info', Offline: 'bg-gray-400',
};

export const TeamStatusBar: React.FC = () => {
  const { state } = useStore();
  const [sel, setSel] = useState<TeamMember | null>(null);
  const timeline = sel
    ? state.activities.filter((a) => a.agentId === sel.id).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)).slice(0, 10)
    : [];

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink">Team Live Status</h3>
        <div className="flex items-center gap-3">
          {(['Active', 'Break', 'In Call', 'Offline'] as PresenceStatus[]).map((s) => (
            <span key={s} className="hidden sm:flex items-center gap-1.5 text-xs text-muted">
              <span className={`w-2 h-2 rounded-full ${dot[s]}`} /> {s}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {state.team.map((m) => (
          <button
            key={m.id}
            onClick={() => setSel(m)}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-line hover:border-primary/40 hover:shadow-sm transition-all shrink-0 min-w-[180px]"
          >
            <Avatar name={m.name} size="md" presence={m.presence} />
            <div className="text-left">
              <p className="text-sm font-semibold text-ink leading-tight">{m.name}</p>
              <p className="text-[11px] text-muted">{m.role}</p>
              <p className="text-[11px] text-muted mt-1">Calls: <b className="text-ink">{m.stats.calls}</b> · Deals: <b className="text-ink">{m.stats.dealsWon}</b></p>
            </div>
          </button>
        ))}
      </div>

      <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.name} subtitle={sel ? `${sel.role} · ${sel.presence}` : undefined}>
        {sel && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge value={sel.presence} dot />
              <span className="text-sm text-muted">{sel.stats.calls} calls · {sel.stats.dealsWon} deals won today</span>
            </div>
            <h4 className="text-sm font-semibold text-ink mb-3">Recent activity</h4>
            <ActivityTimeline activities={timeline} />
          </div>
        )}
      </Drawer>
    </div>
  );
};
