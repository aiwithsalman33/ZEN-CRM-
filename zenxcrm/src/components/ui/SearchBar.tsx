import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SearchBar: React.FC<{
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  debounce?: number;
  categories?: string[];
  category?: string;
  onCategoryChange?: (c: string) => void;
  className?: string;
}> = ({ value, onChange, placeholder = 'Search…', debounce = 250, categories, category, onCategoryChange, className }) => {
  const [local, setLocal] = useState(value ?? '');
  const timer = useRef<number>();

  useEffect(() => {
    setLocal(value ?? '');
  }, [value]);

  const handle = (v: string) => {
    setLocal(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(v), debounce);
  };

  return (
    <div className={cn('flex items-center gap-2 h-10 px-3 rounded-lg border border-line bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-shadow', className)}>
      <Search size={16} className="text-muted shrink-0" />
      <input
        value={local}
        onChange={(e) => handle(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-muted/70"
      />
      {local && (
        <button onClick={() => handle('')} className="text-muted hover:text-ink shrink-0">
          <X size={15} />
        </button>
      )}
      {categories && onCategoryChange && (
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="text-xs font-medium text-muted bg-bg rounded-md px-2 py-1 outline-none cursor-pointer border-l border-line"
        >
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
    </div>
  );
};
