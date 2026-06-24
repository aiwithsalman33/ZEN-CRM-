import React from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, IconButton } from './primitives';

/** A slide-in (left) filter sidebar. Pass filter controls as children. */
export const FilterPanel: React.FC<{
  open: boolean;
  onClose: () => void;
  onClear?: () => void;
  onApply?: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, onClear, onApply, children }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="absolute top-0 bottom-0 left-0 w-full max-w-xs bg-card shadow-xl flex flex-col animate-slideInLeft">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-ink">Filters</h2>
          </div>
          <IconButton label="Close" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">{children}</div>
        <div className="flex gap-2 p-4 border-t border-line">
          {onClear && <Button variant="outline" className="flex-1" onClick={onClear}>Clear all</Button>}
          <Button className="flex-1" onClick={() => { onApply?.(); onClose(); }}>Apply</Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-2">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h4>
    {children}
  </div>
);

export const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors', active ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-line hover:border-primary/40')}
  >
    {children}
  </button>
);
