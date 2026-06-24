import type { Contact, LeadSource } from '@/types';
import { makeRng, pick, int, chance, daysAgo, firstNames, lastNames, companies, phone } from './_gen';
import { agentIds } from './team';

const sources: LeadSource[] = ['FB Ads', 'Instagram', 'WhatsApp', 'Web Form', 'Referral', 'Google'];
const designations = ['CEO', 'CTO', 'Founder', 'Procurement Head', 'Marketing Manager', 'Operations Lead', 'Sales Director', 'IT Manager'];
const tagPool = ['Key Account', 'Partner', 'Repeat Buyer', 'Newsletter', 'High Value'];

const rng = makeRng(202);

export const contacts: Contact[] = Array.from({ length: 20 }).map((_, i) => {
  const fn = pick(rng, firstNames);
  const ln = pick(rng, lastNames);
  const phones = [phone(rng)];
  if (chance(rng, 0.4)) phones.push(phone(rng));
  return {
    id: `c${i + 1}`,
    name: `${fn} ${ln}`,
    phones,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${pick(rng, companies).toLowerCase().replace(/[^a-z]/g, '')}.com`,
    company: pick(rng, companies),
    designation: pick(rng, designations),
    source: pick(rng, sources),
    assignedTo: pick(rng, agentIds),
    tags: [...new Set(Array.from({ length: int(rng, 0, 2) }).map(() => pick(rng, tagPool)))],
    notes: '',
    createdAt: daysAgo(int(rng, 5, 120)),
    lastActivity: daysAgo(int(rng, 0, 20)),
  } satisfies Contact;
});
