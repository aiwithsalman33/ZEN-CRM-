import type { Lead, LeadSource, LeadStatus, Priority } from '@/types';
import { makeRng, pick, int, chance, daysAgo, daysAhead, firstNames, lastNames, companies, campaigns, phone } from './_gen';
import { agentIds } from './team';

const sources: LeadSource[] = ['FB Ads', 'Instagram', 'WhatsApp', 'Web Form', 'Referral', 'Cold Call', 'Google'];
const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Not Interested', 'Junk', 'Converted'];
const priorities: Priority[] = ['High', 'Medium', 'Low'];
const tagPool = ['Hot', 'Warm', 'Cold', 'VIP', 'Demo Requested', 'Budget Confirmed', 'Decision Maker', 'Price Sensitive'];

const rng = makeRng(101);

export const leads: Lead[] = Array.from({ length: 30 }).map((_, i) => {
  const fn = pick(rng, firstNames);
  const ln = pick(rng, lastNames);
  const status = i < 7 ? 'New' : pick(rng, statuses);
  const tags = [...new Set(Array.from({ length: int(rng, 0, 3) }).map(() => pick(rng, tagPool)))];
  const engagement = int(rng, 20, 100);
  const responseRate = int(rng, 10, 100);
  const activity = int(rng, 15, 100);
  const recency = int(rng, 10, 100);
  const leadScore = Math.round((engagement + responseRate + activity + recency) / 4);
  return {
    id: `l${i + 1}`,
    name: `${fn} ${ln}`,
    phone: phone(rng),
    altPhone: chance(rng, 0.3) ? phone(rng) : undefined,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${pick(rng, ['gmail.com', 'outlook.com', 'yahoo.in', 'company.com'])}`,
    source: pick(rng, sources),
    status,
    priority: pick(rng, priorities),
    assignedTo: pick(rng, agentIds),
    campaign: chance(rng, 0.7) ? pick(rng, campaigns) : undefined,
    tags,
    notes: '',
    company: chance(rng, 0.55) ? pick(rng, companies) : undefined,
    leadScore,
    scoreBreakdown: { engagement, responseRate, activity, recency },
    lastActivity: daysAgo(int(rng, 0, 14), int(rng, 0, 8)),
    nextFollowUp: status === 'Not Interested' || status === 'Junk' ? undefined : daysAhead(int(rng, -2, 9)),
    createdAt: daysAgo(int(rng, 1, 45)),
  } satisfies Lead;
});
