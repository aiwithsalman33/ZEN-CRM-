import type { Pipeline } from '@/types';

export const pipelines: Pipeline[] = [
  {
    id: 'p1',
    name: 'Sales Pipeline',
    stages: [
      { key: 'new', name: 'New', probability: 10, color: '#64748B' },
      { key: 'qualified', name: 'Qualified', probability: 30, color: '#3B82F6' },
      { key: 'proposal', name: 'Proposal Sent', probability: 55, color: '#F59E0B' },
      { key: 'negotiation', name: 'Negotiation', probability: 75, color: '#8B5CF6' },
      { key: 'won', name: 'Won', probability: 100, color: '#22C55E' },
      { key: 'lost', name: 'Lost', probability: 0, color: '#EF4444' },
    ],
  },
  {
    id: 'p2',
    name: 'Enterprise Pipeline',
    stages: [
      { key: 'new', name: 'Lead In', probability: 10, color: '#64748B' },
      { key: 'qualified', name: 'Qualifying', probability: 25, color: '#3B82F6' },
      { key: 'demo', name: 'Demo', probability: 45, color: '#2DD4BF' },
      { key: 'proposal', name: 'Proposal', probability: 65, color: '#F59E0B' },
      { key: 'negotiation', name: 'Negotiation', probability: 80, color: '#8B5CF6' },
      { key: 'won', name: 'Won', probability: 100, color: '#22C55E' },
      { key: 'lost', name: 'Lost', probability: 0, color: '#EF4444' },
    ],
  },
  {
    id: 'p3',
    name: 'Renewal Pipeline',
    stages: [
      { key: 'upcoming', name: 'Upcoming', probability: 40, color: '#64748B' },
      { key: 'contacted', name: 'Contacted', probability: 60, color: '#3B82F6' },
      { key: 'negotiation', name: 'Negotiation', probability: 80, color: '#8B5CF6' },
      { key: 'won', name: 'Renewed', probability: 100, color: '#22C55E' },
      { key: 'lost', name: 'Churned', probability: 0, color: '#EF4444' },
    ],
  },
];

export const pipelineById = (id: string) => pipelines.find((p) => p.id === id);
