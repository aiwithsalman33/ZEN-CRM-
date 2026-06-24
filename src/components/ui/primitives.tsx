import React from 'react';
import { cn } from '@/lib/utils';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
type BtnSize = 'sm' | 'md' | 'lg' | 'icon';

const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
  accent: 'bg-accent text-white hover:brightness-95 shadow-sm',
  secondary: 'bg-primary-light text-primary hover:bg-[#e3e6fb]',
  ghost: 'text-muted hover:bg-black/5 hover:text-ink',
  outline: 'border border-line bg-white text-ink hover:bg-bg',
  danger: 'bg-danger text-white hover:brightness-95 shadow-sm',
};
const btnSizes: Record<BtnSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9 justify-center',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
        btnVariants[variant],
        btnSizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-10 px-3 rounded-lg border border-line bg-white text-sm text-ink placeholder:text-muted/70',
        'outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2 rounded-lg border border-line bg-white text-sm text-ink placeholder:text-muted/70 resize-y min-h-[80px]',
        'outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full h-10 px-3 rounded-lg border border-line bg-white text-sm text-ink cursor-pointer',
        'outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export const Field: React.FC<{ label?: string; required?: boolean; error?: string; children: React.ReactNode; className?: string }> = ({
  label, required, error, children, className,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    {label && (
      <label className="text-xs font-semibold text-ink/80">
        {label} {required && <span className="text-danger">*</span>}
      </label>
    )}
    {children}
    {error && <span className="text-xs text-danger">{error}</span>}
  </div>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('card p-5', className)} {...props} />
);

export const IconButton: React.FC<ButtonProps & { label?: string }> = ({ label, className, ...props }) => (
  <Button variant="ghost" size="icon" aria-label={label} title={label} className={cn('rounded-lg', className)} {...props} />
);
