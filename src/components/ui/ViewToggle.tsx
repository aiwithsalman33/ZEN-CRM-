import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleOption { key: string; icon: React.ReactNode; label: string }

export const ViewToggle: React.FC<{
  options: ToggleOption[];
  active: string;
  onChange: (key: string) => void;
}> = ({ options, active, onChange }) => (
  <div className="inline-flex items-center p-1 rounded-lg bg-bg border border-line">
    {options.map((o) => (
      <button
        key={o.key}
        onClick={() => onChange(o.key)}
        title={o.label}
        className={cn('flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-colors', active === o.key ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-ink')}
      >
        {o.icon}<span className="hidden sm:inline">{o.label}</span>
      </button>
    ))}
  </div>
);
