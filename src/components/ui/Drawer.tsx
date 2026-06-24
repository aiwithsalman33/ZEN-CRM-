import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './primitives';

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl' };

export const Drawer: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  side?: 'left' | 'right';
  size?: keyof typeof widths;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, side = 'right', size = 'md', footer, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div
        className={cn(
          'absolute top-0 bottom-0 w-full bg-card shadow-xl flex flex-col',
          widths[size],
          side === 'right' ? 'right-0 animate-slideInRight' : 'left-0 animate-slideInLeft',
        )}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-line shrink-0">
            <div>
              {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
              {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
            </div>
            <IconButton label="Close" onClick={onClose}><X size={18} /></IconButton>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 p-4 border-t border-line shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
