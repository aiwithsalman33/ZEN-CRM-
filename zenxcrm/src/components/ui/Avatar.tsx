import React from 'react';
import { cn, initials, colorFromName } from '@/lib/utils';
import type { PresenceStatus } from '@/types';

const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };

const presenceColor: Record<PresenceStatus, string> = {
  Active: 'bg-success',
  Break: 'bg-warning',
  'In Call': 'bg-info',
  Offline: 'bg-gray-400',
};

export const Avatar: React.FC<{
  name: string;
  size?: keyof typeof sizes;
  presence?: PresenceStatus;
  className?: string;
}> = ({ name, size = 'md', presence, className }) => (
  <div className={cn('relative inline-flex shrink-0', className)}>
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold text-white', sizes[size])}
      style={{ backgroundColor: colorFromName(name) }}
      title={name}
    >
      {initials(name)}
    </div>
    {presence && (
      <span
        className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white', presenceColor[presence])}
        title={presence}
      />
    )}
  </div>
);

export const AvatarGroup: React.FC<{ names: string[]; max?: number; size?: keyof typeof sizes }> = ({ names, max = 4, size = 'sm' }) => {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((n, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          <Avatar name={n} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div className={cn('rounded-full bg-gray-200 text-muted flex items-center justify-center font-semibold ring-2 ring-white', sizes[size])}>
          +{extra}
        </div>
      )}
    </div>
  );
};
