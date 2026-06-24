import React from 'react';
import { Field, Input, Select, Textarea, Button, TagInput, PhoneInput } from '@/components/ui';
import { useStore } from '@/store/store';
import { LEAD_SOURCES, LEAD_STATUSES, TAG_SUGGESTIONS, PRIORITIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Lead, LeadSource, LeadStatus, Priority } from '@/types';

export interface LeadFormValues {
  name: string;
  phone: string;
  altPhone: string;
  email: string;
  source: LeadSource;
  campaign: string;
  assignedTo: string;
  status: LeadStatus;
  priority: Priority;
  company: string;
  tags: string[];
  notes: string;
  nextFollowUp: string;
}

export function emptyLead(assignedTo: string): LeadFormValues {
  return { name: '', phone: '+91 ', altPhone: '', email: '', source: 'Web Form', campaign: '', assignedTo, status: 'New', priority: 'Medium', company: '', tags: [], notes: '', nextFollowUp: '' };
}

export function leadToForm(l: Lead): LeadFormValues {
  return { name: l.name, phone: l.phone, altPhone: l.altPhone ?? '', email: l.email, source: l.source, campaign: l.campaign ?? '', assignedTo: l.assignedTo, status: l.status, priority: l.priority, company: l.company ?? '', tags: l.tags, notes: l.notes, nextFollowUp: l.nextFollowUp ? l.nextFollowUp.slice(0, 16) : '' };
}

export const LeadForm: React.FC<{
  values: LeadFormValues;
  onChange: (v: LeadFormValues) => void;
  errors: Partial<Record<keyof LeadFormValues, string>>;
}> = ({ values, onChange, errors }) => {
  const { state } = useStore();
  const set = <K extends keyof LeadFormValues>(k: K, v: LeadFormValues[K]) => onChange({ ...values, [k]: v });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" required error={errors.name}>
          <Input value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Suresh Kumar" />
        </Field>
        <Field label="Phone" required error={errors.phone}>
          <PhoneInput value={values.phone} onChange={(v) => set('phone', v)} />
        </Field>
        <Field label="Alternate Phone">
          <PhoneInput value={values.altPhone} onChange={(v) => set('altPhone', v)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input value={values.email} onChange={(e) => set('email', e.target.value)} placeholder="name@company.com" />
        </Field>
        <Field label="Source">
          <Select value={values.source} onChange={(e) => set('source', e.target.value as LeadSource)}>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Campaign">
          <Input value={values.campaign} onChange={(e) => set('campaign', e.target.value)} placeholder="e.g. Summer Sale 2026" />
        </Field>
        <Field label="Company">
          <Input value={values.company} onChange={(e) => set('company', e.target.value)} placeholder="Company name" />
        </Field>
        <Field label="Assigned To">
          <Select value={values.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
            {state.team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={values.status} onChange={(e) => set('status', e.target.value as LeadStatus)}>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Follow-up Date & Time">
          <Input type="datetime-local" value={values.nextFollowUp} onChange={(e) => set('nextFollowUp', e.target.value)} />
        </Field>
      </div>

      <Field label="Priority">
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set('priority', p)}
              className={cn('flex-1 h-10 rounded-lg border text-sm font-medium transition-colors',
                values.priority === p ? 'border-primary bg-primary-light text-primary' : 'border-line text-muted hover:border-primary/40')}
            >
              {p}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Tags">
        <TagInput value={values.tags} onChange={(v) => set('tags', v)} suggestions={TAG_SUGGESTIONS} />
      </Field>

      <Field label="Notes">
        <Textarea value={values.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Add any context about this lead…" />
      </Field>
    </div>
  );
};

export function validateLead(v: LeadFormValues): Partial<Record<keyof LeadFormValues, string>> {
  const e: Partial<Record<keyof LeadFormValues, string>> = {};
  if (!v.name.trim()) e.name = 'Name is required';
  const digits = v.phone.replace(/\D/g, '');
  if (digits.length <= 2) e.phone = 'Phone is required';
  else if (digits.length < 12) e.phone = 'Enter a valid 10-digit phone';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Enter a valid email';
  return e;
}

export const LeadFormActions: React.FC<{
  onCancel: () => void;
  onSave: () => void;
  onSaveAnother?: () => void;
  editing?: boolean;
}> = ({ onCancel, onSave, onSaveAnother, editing }) => (
  <>
    <Button variant="outline" onClick={onCancel}>Cancel</Button>
    {!editing && onSaveAnother && <Button variant="secondary" onClick={onSaveAnother}>Save & Add Another</Button>}
    <Button onClick={onSave}>{editing ? 'Save Changes' : 'Save Lead'}</Button>
  </>
);
