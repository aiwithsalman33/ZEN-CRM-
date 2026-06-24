import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStage } from '@/types';

export const PipelineStepper: React.FC<{
  stages: PipelineStage[];
  current: string;
  onSelect?: (key: string) => void;
  lost?: boolean;
}> = ({ stages, current, onSelect, lost }) => {
  // exclude terminal lost stage from the horizontal flow
  const flow = stages.filter((s) => s.key !== 'lost');
  const currentIdx = flow.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center w-full overflow-x-auto no-scrollbar">
      {flow.map((s, i) => {
        const done = !lost && i < currentIdx;
        const active = !lost && i === currentIdx;
        return (
          <React.Fragment key={s.key}>
            <button
              onClick={() => onSelect?.(s.key)}
              disabled={!onSelect}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors shrink-0',
                onSelect && 'hover:bg-bg cursor-pointer',
                active && 'bg-primary-light',
              )}
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                  done && 'bg-accent text-white',
                  active && 'bg-primary text-white',
                  !done && !active && 'bg-line text-muted',
                )}
              >
                {done ? <Check size={13} /> : i + 1}
              </span>
              <span className={cn('text-sm font-medium', active ? 'text-primary' : done ? 'text-ink' : 'text-muted')}>{s.name}</span>
            </button>
            {i < flow.length - 1 && <div className={cn('h-0.5 flex-1 min-w-4 mx-1', i < currentIdx && !lost ? 'bg-accent' : 'bg-line')} />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
