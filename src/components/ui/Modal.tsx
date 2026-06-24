import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './primitives';

const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  size?: keyof typeof widths;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, size = 'md', footer, children }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className={cn('relative w-full bg-card rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-scaleIn', widths[size])}>
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 p-5 border-b border-line">
            <div>
              {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
              {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
            </div>
            <IconButton label="Close" onClick={onClose}><X size={18} /></IconButton>
          </div>
        )}
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 p-4 border-t border-line bg-bg/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
