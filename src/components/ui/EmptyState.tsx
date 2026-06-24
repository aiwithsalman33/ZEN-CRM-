import React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './primitives';

export const EmptyState: React.FC<{
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}> = ({ icon: Icon = Inbox, title, description, actionLabel, onAction, className }) => (
  <div className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className ?? ''}`}>
    <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4">
      <Icon size={28} className="text-primary" />
    </div>
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    {description && <p className="text-sm text-muted mt-1 max-w-sm">{description}</p>}
    {actionLabel && onAction && (
      <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);
