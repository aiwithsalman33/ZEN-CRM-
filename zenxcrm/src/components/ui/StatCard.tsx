import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StatCard: React.FC<{
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  change?: number; // percentage change vs last period
  accent?: string; // hex color for the icon chip
  children?: React.ReactNode;
}> = ({ icon: Icon, label, value, sub, change, accent = '#5B4FE8', children }) => (
  <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="text-2xl font-bold text-ink leading-tight">{value}</span>
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </div>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1a`, color: accent }}>
        <Icon size={20} />
      </div>
    </div>
    {typeof change === 'number' && (
      <div className="flex items-center gap-1.5">
        <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md', change >= 0 ? 'text-accent bg-accent/10' : 'text-danger bg-danger/10')}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(change)}%
        </span>
        <span className="text-xs text-muted">vs last month</span>
      </div>
    )}
    {children}
  </div>
);
