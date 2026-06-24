import React from 'react';
import { Phone, Mail, StickyNote, RefreshCw, MessageCircle, CheckSquare, Calendar, GitBranch, Trophy } from 'lucide-react';
import type { Activity, ActivityType } from '@/types';
import { useTeam } from '@/store/selectors';
import { timeAgo, formatDateTime } from '@/lib/utils';
import { Avatar } from './Avatar';

const meta: Record<ActivityType, { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: '#5B4FE8' },
  email: { icon: Mail, color: '#3B82F6' },
  note: { icon: StickyNote, color: '#FFA502' },
  status: { icon: RefreshCw, color: '#00C897' },
  whatsapp: { icon: MessageCircle, color: '#25D366' },
  task: { icon: CheckSquare, color: '#8B5CF6' },
  meeting: { icon: Calendar, color: '#EC4899' },
  stage: { icon: GitBranch, color: '#2DD4BF' },
  deal_won: { icon: Trophy, color: '#FF6B35' },
};

export const ActivityTimeline: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const { nameOf } = useTeam();
  if (activities.length === 0) {
    return <p className="text-sm text-muted py-6 text-center">No activity yet.</p>;
  }
  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-line" />
      <ul className="flex flex-col gap-5">
        {activities.map((a) => {
          const m = meta[a.type];
          const Icon = m.icon;
          return (
            <li key={a.id} className="relative flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-card" style={{ backgroundColor: `${m.color}1a`, color: m.color }}>
                <Icon size={15} />
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{a.title}</p>
                  <span className="text-xs text-muted shrink-0" title={formatDateTime(a.timestamp)}>{timeAgo(a.timestamp)}</span>
                </div>
                {a.description && <p className="text-sm text-muted mt-0.5">{a.description}</p>}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Avatar name={nameOf(a.agentId)} size="xs" />
                  <span className="text-xs text-muted">{nameOf(a.agentId)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
