import type { Activity, ActivityType } from '@/types';
import { makeRng, pick, int, daysAgo } from './_gen';
import { agentIds } from './team';
import { leads } from './leads';
import { deals } from './deals';

const rng = makeRng(808);
const byType: Record<ActivityType, (n: string) => string> = {
  call: (n) => `Logged a call with ${n}`,
  email: (n) => `Sent an email to ${n}`,
  note: () => `Added a note`,
  status: () => `Changed status`,
  whatsapp: (n) => `Sent WhatsApp to ${n}`,
  task: () => `Scheduled a follow-up`,
  meeting: (n) => `Met with ${n}`,
  stage: () => `Moved to next stage`,
  deal_won: (n) => `Won the deal with ${n}`,
};
const leadTypes: ActivityType[] = ['call', 'email', 'note', 'status', 'whatsapp', 'task'];
const dealTypes: ActivityType[] = ['call', 'email', 'note', 'stage', 'meeting', 'task'];

function build(entityType: 'lead' | 'deal', id: string, name: string, types: ActivityType[]): Activity[] {
  const count = int(rng, 2, 5);
  return Array.from({ length: count }).map((_, j) => {
    const type = pick(rng, types);
    return {
      id: `act-${entityType}-${id}-${j}`,
      type,
      entityType,
      entityId: id,
      title: byType[type](name),
      description: type === 'note' ? 'Customer is evaluating against 2 competitors. Price-sensitive.' : undefined,
      agentId: pick(rng, agentIds),
      timestamp: daysAgo(j + int(rng, 0, 1), int(rng, 0, 9)),
    } satisfies Activity;
  });
}

export const activities: Activity[] = [
  ...leads.flatMap((l) => build('lead', l.id, l.name, leadTypes)),
  ...deals.flatMap((d) => build('deal', d.id, d.contactName, dealTypes)),
];
