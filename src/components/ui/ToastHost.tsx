import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useStore } from '@/store/store';
import type { ToastKind } from '@/types';

const config: Record<ToastKind, { icon: React.ElementType; bar: string; tint: string }> = {
  success: { icon: CheckCircle2, bar: 'bg-accent', tint: 'text-accent' },
  error: { icon: XCircle, bar: 'bg-danger', tint: 'text-danger' },
  warning: { icon: AlertTriangle, bar: 'bg-warning', tint: 'text-warning' },
  info: { icon: Info, bar: 'bg-info', tint: 'text-info' },
};

export const ToastHost: React.FC = () => {
  const { state, dispatch } = useStore();
  if (state.toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {state.toasts.map((t) => {
        const c = config[t.kind];
        const Icon = c.icon;
        return (
          <div key={t.id} className="card flex items-stretch overflow-hidden animate-slideInRight">
            <div className={`w-1.5 ${c.bar}`} />
            <div className="flex items-center gap-3 p-3.5 flex-1">
              <Icon size={18} className={c.tint} />
              <span className="text-sm text-ink flex-1">{t.message}</span>
              <button onClick={() => dispatch({ type: 'REMOVE_TOAST', id: t.id })} className="text-muted hover:text-ink">
                <X size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>,
    document.body,
  );
};
