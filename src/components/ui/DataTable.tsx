import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  empty?: React.ReactNode;
  dense?: boolean;
}

export function DataTable<T>({
  columns, rows, rowKey, selectable, selected = [], onSelectedChange, onRowClick, pageSize = 10, empty, dense,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const get = col.sortValue ?? ((r: T) => String((r as Record<string, unknown>)[sortKey] ?? ''));
    return [...rows].sort((a, b) => {
      const av = get(a), bv = get(b);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const pageIds = pageRows.map(rowKey);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const toggleAll = () => {
    if (!onSelectedChange) return;
    onSelectedChange(allChecked ? selected.filter((id) => !pageIds.includes(id)) : [...new Set([...selected, ...pageIds])]);
  };
  const toggleOne = (id: string) => {
    if (!onSelectedChange) return;
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const sort = (col: Column<T>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(col.key); setSortDir('asc'); }
  };

  if (rows.length === 0 && empty) return <>{empty}</>;

  const pad = dense ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-bg/40">
              {selectable && (
                <th className={cn('w-10', pad)}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-primary w-4 h-4 cursor-pointer align-middle" />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => sort(col)}
                  className={cn(
                    'font-semibold text-muted text-xs uppercase tracking-wide whitespace-nowrap', pad,
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.sortable && 'cursor-pointer select-none hover:text-ink',
                    col.className,
                  )}
                >
                  <span className={cn('inline-flex items-center gap-1', col.align === 'right' && 'flex-row-reverse')}>
                    {col.header}
                    {col.sortable && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
                        : <ChevronsUpDown size={13} className="opacity-40" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {pageRows.map((row) => {
              const id = rowKey(row);
              const checked = selected.includes(id);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-bg/60', checked && 'bg-primary-light/50')}
                >
                  {selectable && (
                    <td className={pad} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={checked} onChange={() => toggleOne(id)} className="accent-primary w-4 h-4 cursor-pointer align-middle" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('text-ink whitespace-nowrap', pad, col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left', col.className)}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-line">
          <span className="text-xs text-muted">
            Showing {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)} className="p-1.5 rounded-md hover:bg-bg disabled:opacity-40 disabled:pointer-events-none">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-medium text-ink px-2">{safePage + 1} / {pageCount}</span>
            <button disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} className="p-1.5 rounded-md hover:bg-bg disabled:opacity-40 disabled:pointer-events-none">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
