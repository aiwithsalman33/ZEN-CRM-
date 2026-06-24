import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem { key: string; label: React.ReactNode; count?: number }

export const Tabs: React.FC<{
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}> = ({ tabs, active, onChange, className, variant = 'underline' }) => {
  if (variant === 'pill') {
    return (
      <div className={cn('inline-flex items-center gap-1 p-1 rounded-lg bg-bg', className)}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn('px-3 py-1.5 rounded-md text-sm font-medium transition-colors', active === t.key ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink')}
          >
            {t.label}{typeof t.count === 'number' && <span className="ml-1.5 text-xs opacity-70">{t.count}</span>}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className={cn('flex items-center gap-1 border-b border-line overflow-x-auto no-scrollbar', className)}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
            active === t.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink',
          )}
        >
          {t.label}
          {typeof t.count === 'number' && (
            <span className={cn('ml-1.5 text-xs rounded-full px-1.5 py-0.5', active === t.key ? 'bg-primary-light text-primary' : 'bg-bg text-muted')}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};
