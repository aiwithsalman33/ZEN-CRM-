import React from 'react';
import { cn } from '@/lib/utils';

export const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('shimmer rounded-md', className)} />
);

export const CardShimmer: React.FC = () => (
  <div className="card p-5 flex flex-col gap-3">
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-6 w-28" />
      </div>
      <Shimmer className="h-11 w-11 rounded-xl" />
    </div>
    <Shimmer className="h-3 w-24" />
  </div>
);

export const KanbanShimmer: React.FC<{ cols?: number }> = ({ cols = 4 }) => (
  <div className="flex gap-3 overflow-hidden">
    {Array.from({ length: cols }).map((_, c) => (
      <div key={c} className="w-72 shrink-0 card !p-0 overflow-hidden">
        <div className="p-3 border-b border-line"><Shimmer className="h-4 w-24" /></div>
        <div className="p-2 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((__, i) => <Shimmer key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      </div>
    ))}
  </div>
);

export const ListShimmer: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="card flex items-center gap-3 p-3">
        <Shimmer className="h-10 w-10 rounded-full" />
        <div className="flex-1 flex flex-col gap-2"><Shimmer className="h-3 w-1/3" /><Shimmer className="h-3 w-1/2" /></div>
      </div>
    ))}
  </div>
);

/** Unified loading skeleton by type. */
export const LoadingSkeleton: React.FC<{ type?: 'card' | 'table' | 'list' | 'kanban'; count?: number }> = ({ type = 'card', count = 4 }) => {
  if (type === 'table') return <TableShimmer />;
  if (type === 'kanban') return <KanbanShimmer />;
  if (type === 'list') return <ListShimmer />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <CardShimmer key={i} />)}
    </div>
  );
};

export const TableShimmer: React.FC<{ rows?: number; cols?: number }> = ({ rows = 6, cols = 5 }) => (
  <div className="card overflow-hidden">
    <div className="p-4 border-b border-line">
      <Shimmer className="h-4 w-40" />
    </div>
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 p-4">
          {Array.from({ length: cols }).map((__, c) => (
            <Shimmer key={c} className={cn('h-4', c === 0 ? 'w-32' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  </div>
);
