import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RangePreset = 'Today' | 'This Week' | 'This Month' | 'Last 6 Months' | 'Custom';
export interface DateRange { preset: RangePreset; from?: string; to?: string }

const presets: RangePreset[] = ['Today', 'This Week', 'This Month', 'Last 6 Months', 'Custom'];

export const DateRangePicker: React.FC<{
  value: DateRange;
  onChange: (r: DateRange) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-line bg-white text-sm font-medium text-ink hover:bg-bg"
      >
        <Calendar size={15} className="text-muted" />
        {value.preset}
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 w-56 card p-2 animate-scaleIn">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => { onChange({ ...value, preset: p }); if (p !== 'Custom') setOpen(false); }}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-bg', value.preset === p && 'bg-primary-light text-primary font-medium')}
              >
                {p}
              </button>
            ))}
            {value.preset === 'Custom' && (
              <div className="flex flex-col gap-2 p-2 border-t border-line mt-1">
                <input type="date" value={value.from ?? ''} onChange={(e) => onChange({ ...value, from: e.target.value })} className="h-9 px-2 rounded-md border border-line text-sm" />
                <input type="date" value={value.to ?? ''} onChange={(e) => onChange({ ...value, to: e.target.value })} className="h-9 px-2 rounded-md border border-line text-sm" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
