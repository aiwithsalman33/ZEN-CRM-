import type { Workflow } from '@/types';
import { daysAgo } from './_gen';

export const workflows: Workflow[] = [
  {
    id: 'w1', name: 'New Lead Welcome', trigger: 'When a Lead is created', active: true, lastRun: daysAgo(0, 3), triggeredToday: 12,
    nodes: [
      { id: 'w1n1', kind: 'trigger', icon: 'UserPlus', title: 'Lead Created', description: 'Triggers when a new lead is added' },
      { id: 'w1n2', kind: 'action', icon: 'Mail', title: 'Send Email', description: 'Template: Welcome Email' },
      { id: 'w1n3', kind: 'delay', icon: 'Clock', title: 'Wait 2 days', description: 'Delay before next step' },
      { id: 'w1n4', kind: 'action', icon: 'MessageCircle', title: 'Send WhatsApp', description: 'Template: Follow-up Reminder' },
    ],
  },
  {
    id: 'w2', name: 'Follow-up Reminder', trigger: 'When no activity for 2 days', active: true, lastRun: daysAgo(1), triggeredToday: 5,
    nodes: [
      { id: 'w2n1', kind: 'trigger', icon: 'Clock', title: 'No Activity 2 Days', description: 'Lead has no activity in 48h' },
      { id: 'w2n2', kind: 'condition', icon: 'Filter', title: 'If Status = New', description: 'Only for new leads' },
      { id: 'w2n3', kind: 'action', icon: 'CheckSquare', title: 'Create Task', description: 'Task: Follow up with lead' },
      { id: 'w2n4', kind: 'action', icon: 'BellRing', title: 'Notify Agent', description: 'Notify the assigned agent' },
    ],
  },
  {
    id: 'w3', name: 'Deal Won Celebration', trigger: 'When a Deal is marked Won', active: false, lastRun: daysAgo(5), triggeredToday: 0,
    nodes: [
      { id: 'w3n1', kind: 'trigger', icon: 'Trophy', title: 'Deal Won', description: 'Deal stage changes to Won' },
      { id: 'w3n2', kind: 'action', icon: 'BellRing', title: 'Notify Team', description: 'Post to team channel' },
      { id: 'w3n3', kind: 'action', icon: 'Tag', title: 'Add Tag', description: 'Tag contact as Customer' },
    ],
  },
  {
    id: 'w4', name: 'Inactive Lead Re-engage', trigger: 'When no activity for 7 days', active: true, lastRun: daysAgo(2), triggeredToday: 3,
    nodes: [
      { id: 'w4n1', kind: 'trigger', icon: 'Clock', title: 'No Activity 7 Days', description: 'Lead idle for a week' },
      { id: 'w4n2', kind: 'action', icon: 'MessageCircle', title: 'Send WhatsApp', description: 'Template: Diwali Offer' },
      { id: 'w4n3', kind: 'action', icon: 'Tag', title: 'Add Tag', description: 'Tag as Cold' },
    ],
  },
  {
    id: 'w5', name: 'Quote Expiry Alert', trigger: 'Quote expiring in 2 days', active: true, lastRun: daysAgo(0, 6), triggeredToday: 2,
    nodes: [
      { id: 'w5n1', kind: 'trigger', icon: 'FileText', title: 'Quote Expiring', description: 'Quote expires in 2 days' },
      { id: 'w5n2', kind: 'action', icon: 'BellRing', title: 'Notify Agent', description: 'Alert the deal owner' },
      { id: 'w5n3', kind: 'action', icon: 'Mail', title: 'Send Email', description: 'Reminder to client' },
    ],
  },
];
