import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Phone, UserPlus, CheckSquare, Trophy, FileWarning, Repeat, Settings, CheckCheck, X } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, Tabs, EmptyState } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/types';

const icons: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  call: { icon: Phone, color: '#FF6B35' }, lead: { icon: UserPlus, color: '#3B82F6' }, task: { icon: CheckSquare, color: '#8B5CF6' },
  deal_won: { icon: Trophy, color: '#22C55E' }, quote: { icon: FileWarning, color: '#F59E0B' }, followup: { icon: Repeat, color: '#EC4899' }, system: { icon: Settings, color: '#64748B' },
};
const tabMap: Record<string, NotificationType[]> = { Calls: ['call'], Leads: ['lead'], Deals: ['deal_won'], Tasks: ['task', 'followup'], System: ['system', 'quote'] };

function bucket(iso: string): 'Today' | 'Yesterday' | 'Older' {
  const d = new Date(iso), now = new Date();
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = (day(now) - day(d)) / 86400000;
  return diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday' : 'Older';
}

const NotificationsPage: React.FC = () => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');

  const filtered = state.notifications
    .filter((n) => tab === 'All' || tabMap[tab]?.includes(n.type))
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const groups: Record<string, AppNotification[]> = { Today: [], Yesterday: [], Older: [] };
  filtered.forEach((n) => groups[bucket(n.timestamp)].push(n));

  return (
    <div>
      <PageHeader title="Notifications" icon={<Bell size={20} />} actions={<Button variant="outline" onClick={() => dispatch({ type: 'MARK_ALL_NOTIF_READ' })}><CheckCheck size={16} /> Mark All Read</Button>} />
      <Tabs className="mb-5" active={tab} onChange={setTab} tabs={['All', 'Calls', 'Leads', 'Deals', 'Tasks', 'System'].map((t) => ({ key: t, label: t }))} />

      {filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Bell} title="No notifications" description="You're all caught up!" /></div>
      ) : (
        <div className="flex flex-col gap-5 max-w-3xl">
          {(['Today', 'Yesterday', 'Older'] as const).map((g) => groups[g].length === 0 ? null : (
            <div key={g}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{g}</p>
              <div className="card divide-y divide-line">
                {groups[g].map((n) => {
                  const m = icons[n.type]; const Icon = m.icon;
                  return (
                    <div key={n.id} className={`flex gap-3 p-4 ${n.read ? '' : 'bg-primary-light/20'}`}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${m.color}1a`, color: m.color }}><Icon size={17} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink">{n.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted">{timeAgo(n.timestamp)}</span>
                          {n.link && <button onClick={() => { dispatch({ type: 'MARK_NOTIF_READ', id: n.id }); navigate(n.link!); }} className="text-xs font-medium text-primary hover:underline">Go to →</button>}
                          {!n.read && <button onClick={() => dispatch({ type: 'MARK_NOTIF_READ', id: n.id })} className="text-xs font-medium text-muted hover:text-ink">Mark read</button>}
                        </div>
                      </div>
                      <button onClick={() => dispatch({ type: 'DELETE', key: 'notifications', id: n.id })} className="text-muted hover:text-danger shrink-0"><X size={15} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
