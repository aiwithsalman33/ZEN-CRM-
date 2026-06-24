import type { Deal, LeadSource } from '@/types';
import { makeRng, pick, int, chance, daysAgo, daysAhead, firstNames, lastNames, companies } from './_gen';
import { agentIds } from './team';
import { pipelines } from './pipelines';

const sources: LeadSource[] = ['FB Ads', 'Instagram', 'Google', 'Referral', 'Web Form', 'Cold Call', 'WhatsApp'];
const dealNouns = ['Annual License', 'Implementation', 'Onboarding Package', 'Premium Plan', 'Custom Build', 'Support Retainer', 'Migration Project', 'Expansion Deal', 'Pilot Program', 'Renewal'];

const rng = makeRng(303);
const productPool = ['pr1', 'pr2', 'pr3', 'pr4', 'pr5'];

export const deals: Deal[] = Array.from({ length: 25 }).map((_, i) => {
  const pipeline = chance(rng, 0.6) ? pipelines[0] : pick(rng, pipelines);
  const stage = pick(rng, pipeline.stages);
  const fn = pick(rng, firstNames);
  const ln = pick(rng, lastNames);
  const company = pick(rng, companies);
  const status: Deal['status'] = stage.key === 'won' ? 'won' : stage.key === 'lost' ? 'lost' : 'open';
  const value = int(rng, 4, 60) * 5000;
  const products = [...new Set(Array.from({ length: int(rng, 0, 2) }).map(() => pick(rng, productPool)))];
  return {
    id: `d${i + 1}`,
    title: `${company} — ${pick(rng, dealNouns)}`,
    pipelineId: pipeline.id,
    stage: stage.key,
    value,
    currency: 'INR',
    contactName: `${fn} ${ln}`,
    company,
    probability: stage.probability,
    expectedCloseDate: daysAhead(int(rng, -10, 45)),
    assignedTo: pick(rng, agentIds),
    source: pick(rng, sources),
    productIds: products,
    status,
    lastActivity: daysAgo(int(rng, 0, 12)),
    createdAt: daysAgo(int(rng, 5, 90)),
    activityCounts: { call: int(rng, 0, 6), email: int(rng, 0, 5), note: int(rng, 0, 4) },
  } satisfies Deal;
});
