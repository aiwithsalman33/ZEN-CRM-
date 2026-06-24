import React from 'react';
import { cn } from '@/lib/utils';

/** Returns a color based on percent thresholds: green >=80, yellow 50-79, red <50. */
export function thresholdColor(pct: number): string {
  if (pct >= 80) return '#00C897';
  if (pct >= 50) return '#FFA502';
  return '#FF4757';
}

export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  label?: string;
  showPct?: boolean;
  color?: string;
  threshold?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ value, max = 100, label, showPct, color, threshold, size = 'md', className }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = threshold ? thresholdColor(pct) : color ?? '#5B4FE8';
  return (
    <div className={cn('w-full', className)}>
      {(label || showPct) && (
        <div className="flex items-center justify-between mb-1.5 text-xs">
          {label && <span className="font-medium text-ink/80">{label}</span>}
          {showPct && <span className="font-semibold text-muted">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-line overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
};
