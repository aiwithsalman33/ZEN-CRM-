import React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'blue' | 'purple' | 'green' | 'gray' | 'red' | 'amber' | 'teal' | 'indigo' | 'pink' | 'orange';

const tones: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-violet-50 text-violet-600',
  green: 'bg-emerald-50 text-emerald-600',
  gray: 'bg-gray-100 text-gray-500',
  red: 'bg-red-50 text-red-500',
  amber: 'bg-amber-50 text-amber-600',
  teal: 'bg-teal-50 text-teal-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  pink: 'bg-pink-50 text-pink-600',
  orange: 'bg-orange-50 text-orange-600',
};

// Central mapping for all known status/source strings → tone.
const map: Record<string, Tone> = {
  // Lead statuses
  New: 'gray', Contacted: 'blue', Qualified: 'green', 'Not Interested': 'red', Junk: 'gray', Converted: 'green',
  // Deal status
  open: 'blue', won: 'green', lost: 'red', Open: 'blue', Won: 'green', Lost: 'red',
  // Quote
  Draft: 'gray', Sent: 'blue', Viewed: 'purple', Accepted: 'green', Declined: 'red', Expired: 'orange',
  // Subscription
  Active: 'green', Cancelled: 'red', Paused: 'amber', Trial: 'blue',
  // Call outcomes
  Connected: 'green', 'Not Picked': 'red', Callback: 'amber', Busy: 'orange', 'Wrong Number': 'gray', Voicemail: 'purple',
  // Sources
  'FB Ads': 'blue', Instagram: 'pink', Google: 'red', WhatsApp: 'green', 'Web Form': 'gray', Referral: 'purple', 'Cold Call': 'orange',
  // Presence / attendance
  Present: 'green', Absent: 'red', 'Half Day': 'amber', Late: 'orange',
  Break: 'amber', 'In Call': 'blue', Offline: 'gray',
  // Priority
  High: 'red', Medium: 'amber', Low: 'gray',
  // Roles
  Admin: 'indigo', Manager: 'purple', Agent: 'blue', Viewer: 'gray',
  // Workflow / template
  Approved: 'green', Pending: 'amber', Rejected: 'red',
};

export const StatusBadge: React.FC<{ value: string; tone?: Tone; dot?: boolean; className?: string }> = ({
  value, tone, dot, className,
}) => {
  const t = tone ?? map[value] ?? 'gray';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', tones[t], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {value}
    </span>
  );
};
