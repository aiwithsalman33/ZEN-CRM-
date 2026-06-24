import React from 'react';
import { Field, Input, Select } from '@/components/ui';
import { useStore } from '@/store/store';
import { LEAD_SOURCES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Deal, LeadSource, ID } from '@/types';

export interface DealFormValues {
  title: string;
  pipelineId: string;
  stage: string;
  value: number;
  contactName: string;
  company: string;
  probability: number;
  expectedCloseDate: string;
  assignedTo: string;
  source: LeadSource;
  productIds: ID[];
}

export function emptyDeal(pipelineId: string, stage: string, assignedTo: string): DealFormValues {
  return { title: '', pipelineId, stage, value: 50000, contactName: '', company: '', probability: 10, expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), assignedTo, source: 'Web Form', productIds: [] };
}

export function dealToForm(d: Deal): DealFormValues {
  return { title: d.title, pipelineId: d.pipelineId, stage: d.stage, value: d.value, contactName: d.contactName, company: d.company, probability: d.probability, expectedCloseDate: d.expectedCloseDate.slice(0, 10), assignedTo: d.assignedTo, source: d.source, productIds: d.productIds };
}

export const DealForm: React.FC<{
  values: DealFormValues;
  onChange: (v: DealFormValues) => void;
  errors: Partial<Record<keyof DealFormValues, string>>;
}> = ({ values, onChange, errors }) => {
  const { state } = useStore();
  const set = <K extends keyof DealFormValues>(k: K, v: DealFormValues[K]) => onChange({ ...values, [k]: v });
  const pipeline = state.pipelines.find((p) => p.id === values.pipelineId) ?? state.pipelines[0];

  return (
    <div className="flex flex-col gap-4">
      <Field label="Deal Title" required error={errors.title}>
        <Input value={values.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Brightwave Tech — Annual License" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact Name" required error={errors.contactName}>
          <Input value={values.contactName} onChange={(e) => set('contactName', e.target.value)} placeholder="Primary contact" />
        </Field>
        <Field label="Company">
          <Input value={values.company} onChange={(e) => set('company', e.target.value)} placeholder="Company" />
        </Field>
        <Field label="Pipeline">
          <Select value={values.pipelineId} onChange={(e) => {
            const p = state.pipelines.find((x) => x.id === e.target.value)!;
            onChange({ ...values, pipelineId: p.id, stage: p.stages[0].key, probability: p.stages[0].probability });
          }}>
            {state.pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Stage">
          <Select value={values.stage} onChange={(e) => {
            const st = pipeline.stages.find((s) => s.key === e.target.value)!;
            onChange({ ...values, stage: st.key, probability: st.probability });
          }}>
            {pipeline.stages.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Deal Value (₹)" required error={errors.value}>
          <Input type="number" value={values.value} onChange={(e) => set('value', Number(e.target.value))} />
        </Field>
        <Field label="Probability (%)">
          <Input type="number" min={0} max={100} value={values.probability} onChange={(e) => set('probability', Number(e.target.value))} />
        </Field>
        <Field label="Expected Close Date">
          <Input type="date" value={values.expectedCloseDate} onChange={(e) => set('expectedCloseDate', e.target.value)} />
        </Field>
        <Field label="Assigned To">
          <Select value={values.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
            {state.team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="Source">
          <Select value={values.source} onChange={(e) => set('source', e.target.value as LeadSource)}>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
      </div>

      <Field label="Products">
        <div className="flex flex-wrap gap-2">
          {state.products.filter((p) => p.status === 'Active').map((p) => {
            const on = values.productIds.includes(p.id);
            return (
              <button key={p.id} type="button" onClick={() => set('productIds', on ? values.productIds.filter((x) => x !== p.id) : [...values.productIds, p.id])}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors', on ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-line hover:border-primary/40')}>
                {p.name}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
};

export function validateDeal(v: DealFormValues): Partial<Record<keyof DealFormValues, string>> {
  const e: Partial<Record<keyof DealFormValues, string>> = {};
  if (!v.title.trim()) e.title = 'Title is required';
  if (!v.contactName.trim()) e.contactName = 'Contact is required';
  if (!v.value || v.value <= 0) e.value = 'Enter a valid value';
  return e;
}
