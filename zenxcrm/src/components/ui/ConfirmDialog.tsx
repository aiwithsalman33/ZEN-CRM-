import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './primitives';

export const ConfirmDialog: React.FC<{
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, title = 'Are you sure?', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = true, onConfirm, onClose }) => (
  <Modal open={open} onClose={onClose} size="sm">
    <div className="flex flex-col items-center text-center gap-3 py-2">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? 'bg-danger/10 text-danger' : 'bg-primary-light text-primary'}`}>
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-muted">{message}</p>
      <div className="flex gap-2 mt-3 w-full">
        <Button variant="outline" className="flex-1" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={danger ? 'danger' : 'primary'} className="flex-1" onClick={() => { onConfirm(); onClose(); }}>
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
