import type { AppNotification, NotificationType } from '@/types';
import { makeRng, pick, int, chance, daysAgo } from './_gen';

const rng = makeRng(505);
const templates: Record<NotificationType, string[]> = {
  call: ['Ravi logged a call with {n} — Connected — 4m 32s', 'Missed call from {n}', 'Sneha connected with {n} — 6m 10s'],
  lead: ['New lead assigned: {n} (Facebook Ads)', 'Lead {n} marked Qualified', 'New web form lead: {n}'],
  task: ['Task due: "Send proposal to {n}"', 'Reminder: follow up with {n}', 'Task overdue for {n}'],
  deal_won: ['🏆 Deal WON: {n} ₹45,000 — by Priya Sharma', 'Vikram closed a deal with {n}', 'Deal {n} moved to Won'],
  quote: ['Quote #Q-0023 viewed by {n}', 'Quote for {n} expiring soon', 'Quote accepted by {n}'],
  followup: ['Follow-up overdue: {n} — 2 hours overdue', 'Follow-up due with {n} today', '{n} requested a callback'],
  system: ['Workflow "New Lead Welcome" executed 12 times', 'Daily backup completed', 'New team member added: Ananya Reddy'],
};
const types = Object.keys(templates) as NotificationType[];
const names = ['Priya Sharma', 'TechCorp Inc', 'Suresh Kumar', 'Meera Patel', 'Brightwave Tech', 'StartupXYZ', 'Karan Singh', 'Quanta Foods'];
const links: Record<NotificationType, string> = {
  call: '/calls', lead: '/leads', task: '/tasks', deal_won: '/deals', quote: '/quotes', followup: '/leads', system: '/automation',
};

export const notifications: AppNotification[] = Array.from({ length: 25 }).map((_, i) => {
  const type = pick(rng, types);
  const msg = pick(rng, templates[type]).replace('{n}', pick(rng, names));
  return {
    id: `n${i + 1}`,
    type,
    message: msg,
    timestamp: daysAgo(int(rng, 0, 5), int(rng, 0, 9)),
    read: i > 5 ? chance(rng, 0.7) : false,
    link: links[type],
  } satisfies AppNotification;
});
