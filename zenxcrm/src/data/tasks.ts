import type { Task, Priority } from '@/types';
import { makeRng, pick, int, chance, daysAhead, daysAgo, firstNames, lastNames } from './_gen';
import { agentIds } from './team';

const rng = makeRng(909);
const titles = [
  'Call back about pricing', 'Send proposal', 'Follow up on demo', 'Share product brochure',
  'Confirm meeting time', 'Negotiate contract terms', 'Collect requirements', 'Schedule onboarding call',
  'Send invoice', 'Check renewal status', 'Reply to email', 'Prepare quote',
];
const priorities: Priority[] = ['High', 'Medium', 'Low'];

export const tasks: Task[] = Array.from({ length: 14 }).map((_, i) => {
  const name = `${pick(rng, firstNames)} ${pick(rng, lastNames)}`;
  const overdue = chance(rng, 0.3);
  return {
    id: `t${i + 1}`,
    title: `${pick(rng, titles)} — ${name}`,
    done: chance(rng, 0.25),
    dueDate: overdue ? daysAgo(int(rng, 0, 2), int(rng, 1, 8)) : daysAhead(int(rng, 0, 5)),
    priority: pick(rng, priorities),
    assignedTo: pick(rng, agentIds),
    entityType: 'lead',
    entityId: `l${int(rng, 1, 30)}`,
    entityName: name,
  } satisfies Task;
});
