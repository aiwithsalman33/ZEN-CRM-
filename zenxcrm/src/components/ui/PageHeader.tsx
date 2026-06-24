import React from 'react';
import { cn } from '@/lib/utils';

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, actions, className }) => (
  <div className={cn('flex flex-wrap items-start justify-between gap-3 mb-5', className)}>
    <div className="flex items-center gap-3">
      {icon && <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">{icon}</div>}
      <div>
        <h1 className="text-xl font-bold text-ink leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);
