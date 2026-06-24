import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Priority } from '@/types';
import { StatusBadge } from './StatusBadge';

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({ priority, className }) => {
  const dotColor = priority === 'High' ? 'bg-danger' : priority === 'Medium' ? 'bg-warning' : 'bg-gray-400';
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span className={cn('w-2 h-2 rounded-full', dotColor)} />
      {priority}
    </span>
  );
};

export { StatusBadge };

export const TagInput: React.FC<{
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}> = ({ value, onChange, placeholder = 'Type and press Enter', suggestions }) => {
  const [draft, setDraft] = useState('');
  const add = (t: string) => {
    const tag = t.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };
  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs font-medium px-2 py-1 rounded-md">
              {t}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}><X size={12} /></button>
            </span>
          ))}
        </div>
      )}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(draft); } }}
        placeholder={placeholder}
        list="tag-suggestions-shared"
        className="w-full h-10 px-3 rounded-lg border border-line bg-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      {suggestions && <datalist id="tag-suggestions-shared">{suggestions.map((s) => <option key={s} value={s} />)}</datalist>}
    </div>
  );
};

export const PhoneInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = '98765 43210' }) => (
  <div className="flex items-center h-10 rounded-lg border border-line bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 overflow-hidden">
    <span className="flex items-center gap-1.5 px-3 h-full bg-bg border-r border-line text-sm text-muted shrink-0">
      <Phone size={13} /> +91
    </span>
    <input
      value={value.replace(/^\+91\s?/, '')}
      onChange={(e) => onChange(`+91 ${e.target.value}`)}
      placeholder={placeholder}
      className="flex-1 px-3 h-full text-sm outline-none bg-transparent"
    />
  </div>
);
