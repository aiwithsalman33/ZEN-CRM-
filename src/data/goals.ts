import type { Goal } from '@/types';

export const goals: Goal[] = [
  // per-agent goals
  { id: 'g1', name: 'Daily Calls', type: 'Calls', assigneeId: 'u1', target: 60, current: 42, period: 'Daily' },
  { id: 'g2', name: 'Monthly Revenue', type: 'Revenue', assigneeId: 'u1', target: 1500000, current: 1280000, period: 'Monthly' },
  { id: 'g3', name: 'Deals Won', type: 'Deals Won', assigneeId: 'u1', target: 10, current: 9, period: 'Monthly' },

  { id: 'g4', name: 'Daily Calls', type: 'Calls', assigneeId: 'u2', target: 50, current: 38, period: 'Daily' },
  { id: 'g5', name: 'Monthly Revenue', type: 'Revenue', assigneeId: 'u2', target: 1200000, current: 980000, period: 'Monthly' },
  { id: 'g6', name: 'Deals Won', type: 'Deals Won', assigneeId: 'u2', target: 8, current: 7, period: 'Monthly' },

  { id: 'g7', name: 'Daily Calls', type: 'Calls', assigneeId: 'u3', target: 60, current: 51, period: 'Daily' },
  { id: 'g8', name: 'Monthly Revenue', type: 'Revenue', assigneeId: 'u3', target: 900000, current: 740000, period: 'Monthly' },
  { id: 'g9', name: 'Deals Won', type: 'Deals Won', assigneeId: 'u3', target: 6, current: 6, period: 'Monthly' },

  { id: 'g10', name: 'Daily Calls', type: 'Calls', assigneeId: 'u4', target: 45, current: 29, period: 'Daily' },
  { id: 'g11', name: 'Monthly Revenue', type: 'Revenue', assigneeId: 'u4', target: 800000, current: 560000, period: 'Monthly' },
  { id: 'g12', name: 'Deals Won', type: 'Deals Won', assigneeId: 'u4', target: 6, current: 4, period: 'Monthly' },

  { id: 'g13', name: 'Daily Calls', type: 'Calls', assigneeId: 'u5', target: 55, current: 47, period: 'Daily' },
  { id: 'g14', name: 'Monthly Revenue', type: 'Revenue', assigneeId: 'u5', target: 900000, current: 690000, period: 'Monthly' },
  { id: 'g15', name: 'Deals Won', type: 'Deals Won', assigneeId: 'u5', target: 7, current: 5, period: 'Monthly' },

  { id: 'g16', name: 'Daily Calls', type: 'Calls', assigneeId: 'u6', target: 45, current: 22, period: 'Daily' },
  { id: 'g17', name: 'Monthly Revenue', type: 'Revenue', assigneeId: 'u6', target: 700000, current: 410000, period: 'Monthly' },
  { id: 'g18', name: 'Deals Won', type: 'Deals Won', assigneeId: 'u6', target: 5, current: 3, period: 'Monthly' },

  // team goal
  { id: 'gt', name: 'Team Revenue Target', type: 'Revenue', assigneeId: 'all', target: 6000000, current: 4660000, period: 'Monthly' },
];
