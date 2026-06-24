import React from 'react';
import { Phone, Mail, StickyNote, CalendarDays } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useTeam } from '@/store/selectors';
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils';
import type { Deal } from '@/types';

export const DealCard: React.FC<{ deal: Deal; onClick?: () => void }> = ({ deal, onClick }) => {
  const { nameOf } = useTeam();
  const est = Math.round(deal.value * (deal.probability / 100));
  const border = deal.probability >= 70 ? '#22C55E' : deal.probability >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div onClick={onClick} className="card !shadow-sm p-3 border border-line hover:border-primary/40 hover:shadow-md transition-all" style={{ borderLeft: `3px solid ${border}` }}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-ink leading-tight line-clamp-2">{deal.title}</p>
        <Avatar name={nameOf(deal.assignedTo)} size="xs" />
      </div>
      <p className="text-xs text-muted mt-0.5">{deal.company}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-base font-bold text-primary">{formatCurrency(deal.value, deal.currency)}</span>
        <span className="text-xs font-medium text-ink bg-bg px-1.5 py-0.5 rounded-md">{deal.probability}%</span>
      </div>
      <p className="flex items-center gap-1 text-[11px] text-muted mt-1.5"><CalendarDays size={11} /> {formatDate(deal.expectedCloseDate)} · Est. {formatCurrency(est)}</p>
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line">
        <div className="flex items-center gap-2.5 text-muted">
          <span className="flex items-center gap-0.5 text-[11px]"><Phone size={11} />{deal.activityCounts.call}</span>
          <span className="flex items-center gap-0.5 text-[11px]"><Mail size={11} />{deal.activityCounts.email}</span>
          <span className="flex items-center gap-0.5 text-[11px]"><StickyNote size={11} />{deal.activityCounts.note}</span>
        </div>
        <span className="text-[11px] text-muted">{timeAgo(deal.lastActivity)}</span>
      </div>
    </div>
  );
};
