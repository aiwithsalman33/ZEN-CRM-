import type { CallLog, CallDirection, CallOutcome } from '@/types';
import { makeRng, pick, int, chance, daysAgo, firstNames, lastNames, phone } from './_gen';
import { agentIds } from './team';

const directions: CallDirection[] = ['Inbound', 'Outbound'];
const outcomes: CallOutcome[] = ['Connected', 'Not Picked', 'Callback', 'Busy', 'Wrong Number', 'Voicemail'];
const notePool = ['Discussed pricing', 'Left voicemail', 'Asked to call back later', 'Wrong contact', 'Scheduled demo', 'Sent proposal follow-up', 'Interested, needs approval', ''];

const rng = makeRng(404);

export const callLogs: CallLog[] = Array.from({ length: 50 }).map((_, i) => {
  const outcome = pick(rng, outcomes);
  const connected = outcome === 'Connected';
  return {
    id: `call${i + 1}`,
    contactName: `${pick(rng, firstNames)} ${pick(rng, lastNames)}`,
    phone: phone(rng),
    direction: pick(rng, directions),
    duration: connected ? int(rng, 30, 1200) : int(rng, 0, 25),
    agentId: pick(rng, agentIds),
    timestamp: daysAgo(int(rng, 0, 13), int(rng, 0, 9)),
    outcome,
    notes: pick(rng, notePool),
    hasRecording: connected && chance(rng, 0.6),
    leadId: chance(rng, 0.4) ? `l${int(rng, 1, 30)}` : undefined,
  } satisfies CallLog;
});
