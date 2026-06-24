import type { Subscription } from '@/types';
import { daysAgo, daysAhead } from './_gen';

export const subscriptions: Subscription[] = [
  { id: 's1', contactName: 'Brightwave Tech', plan: 'PipelineX Pro (25 seats)', mrr: 22500, billingCycle: 'Monthly', startDate: daysAgo(180), renewalDate: daysAhead(5), status: 'Active', autoRenew: true, seats: 25 },
  { id: 's2', contactName: 'Nimbus Labs', plan: 'PipelineX Starter (3 seats)', mrr: 4999, billingCycle: 'Monthly', startDate: daysAgo(90), renewalDate: daysAhead(20), status: 'Active', autoRenew: true, seats: 3 },
  { id: 's3', contactName: 'Quanta Foods', plan: 'PipelineX Pro (10 seats)', mrr: 9999, billingCycle: 'Quarterly', startDate: daysAgo(15), renewalDate: daysAhead(75), status: 'Trial', autoRenew: false, seats: 10 },
  { id: 's4', contactName: 'Vertex Retail', plan: 'Priority Support', mrr: 7500, billingCycle: 'Yearly', startDate: daysAgo(300), renewalDate: daysAgo(5), status: 'Cancelled', autoRenew: false, seats: 5 },
  { id: 's5', contactName: 'TechCorp Inc', plan: 'PipelineX Pro (50 seats)', mrr: 45000, billingCycle: 'Monthly', startDate: daysAgo(220), renewalDate: daysAhead(12), status: 'Active', autoRenew: true, seats: 50 },
  { id: 's6', contactName: 'StartupXYZ', plan: 'PipelineX Starter (5 seats)', mrr: 6500, billingCycle: 'Monthly', startDate: daysAgo(40), renewalDate: daysAhead(3), status: 'Paused', autoRenew: false, seats: 5 },
];
