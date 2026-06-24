import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Avatar, StatusBadge, PriorityBadge } from '@/components/ui';
import { useTeam } from '@/store/selectors';
import { timeAgo, formatDate } from '@/lib/utils';
import type { Lead } from '@/types';

export const LeadKanbanCard: React.FC<{ lead: Lead; onClick?: () => void }> = ({ lead, onClick }) => {
  const { nameOf } = useTeam();
  return (
    <div onClick={onClick} className="card !shadow-sm p-3 border border-line hover:border-primary/40 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-ink leading-tight">{lead.name}</p>
        <StatusBadge value={lead.source} />
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted mt-1.5"><Phone size={12} /> {lead.phone}</p>
      <div className="flex items-center justify-between mt-2">
        <PriorityBadge priority={lead.priority} />
        <Avatar name={nameOf(lead.assignedTo)} size="xs" />
      </div>
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line">
        <span className="text-[11px] text-muted">{timeAgo(lead.lastActivity)}</span>
        {lead.nextFollowUp && <span className="text-[11px] text-warning font-medium">{formatDate(lead.nextFollowUp)}</span>}
      </div>
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {[Phone, Mail, MessageCircle].map((Ic, i) => (
          <span key={i} className="w-7 h-7 rounded-md bg-bg hover:bg-primary-light hover:text-primary flex items-center justify-center text-muted"><Ic size={13} /></span>
        ))}
      </div>
    </div>
  );
};
