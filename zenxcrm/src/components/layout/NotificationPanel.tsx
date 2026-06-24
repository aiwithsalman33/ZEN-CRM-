import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, UserPlus, CheckSquare, Trophy, FileWarning, Repeat, CheckCheck, Settings } from 'lucide-react';
import { Drawer, Button } from '@/components/ui';
import { useStore } from '@/store/store';
import { timeAgo } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/types';

const icons: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: '#5B4FE8' },
  lead: { icon: UserPlus, color: '#3B82F6' },
  task: { icon: CheckSquare, color: '#8B5CF6' },
  deal_won: { icon: Trophy, color: '#00C897' },
  quote: { icon: FileWarning, color: '#F59E0B' },
  followup: { icon: Repeat, color: '#EC4899' },
  system: { icon: Settings, color: '#64748B' },
};

function bucket(iso: string): 'Today' | 'Yesterday' | 'Older' {
  const d = new Date(iso); const now = new Date();
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = (day(now) - day(d)) / 86400000;
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return 'Older';
}

export const NotificationPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const groups: Record<string, AppNotification[]> = { Today: [], Yesterday: [], Older: [] };
  [...state.notifications]
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .forEach((n) => groups[bucket(n.timestamp)].push(n));

  const go = (n: AppNotification) => {
    dispatch({ type: 'MARK_NOTIF_READ', id: n.id });
    if (n.link) { navigate(n.link); onClose(); }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notifications"
      subtitle={`${state.notifications.filter((n) => !n.read).length} unread`}
    >
      <div className="flex justify-end -mt-2 mb-2">
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'MARK_ALL_NOTIF_READ' })}>
          <CheckCheck size={15} /> Mark all read
        </Button>
      </div>
      <div className="flex flex-col gap-5">
        {(['Today', 'Yesterday', 'Older'] as const).map((g) =>
          groups[g].length === 0 ? null : (
            <div key={g}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{g}</p>
              <div className="flex flex-col gap-1.5">
                {groups[g].map((n) => {
                  const m = icons[n.type];
                  const Icon = m.icon;
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-3 rounded-xl border transition-colors ${n.read ? 'border-line bg-white' : 'border-primary/20 bg-primary-light/40'}`}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${m.color}1a`, color: m.color }}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink">{n.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted">{timeAgo(n.timestamp)}</span>
                          {!n.read && (
                            <button onClick={() => dispatch({ type: 'MARK_NOTIF_READ', id: n.id })} className="text-xs font-medium text-primary hover:underline">
                              Mark read
                            </button>
                          )}
                          {n.link && (
                            <button onClick={() => go(n)} className="text-xs font-medium text-primary hover:underline">Go to</button>
                          )}
                        </div>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>
    </Drawer>
  );
};
