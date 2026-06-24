import type { AttendanceRecord, AttendanceStatus } from '@/types';
import { makeRng, pick, int, chance, daysAgo, cities } from './_gen';
import { agentIds } from './team';

const rng = makeRng(707);
const baseLat = 19.076, baseLng = 72.8777;

export const attendance: AttendanceRecord[] = Array.from({ length: 20 }).map((_, i) => {
  const r = rng();
  const status: AttendanceStatus = r > 0.88 ? 'Absent' : r > 0.78 ? 'Half Day' : r > 0.68 ? 'Late' : 'Present';
  const day = int(rng, 0, 6);
  const present = status !== 'Absent';
  const late = status === 'Late';
  return {
    id: `att${i + 1}`,
    employeeId: pick(rng, agentIds),
    date: daysAgo(day).slice(0, 10),
    checkIn: present ? (late ? '10:35 AM' : pick(rng, ['09:02 AM', '09:15 AM', '08:58 AM', '09:30 AM'])) : undefined,
    checkOut: present ? (status === 'Half Day' ? '01:30 PM' : pick(rng, ['06:05 PM', '06:30 PM', '07:10 PM'])) : undefined,
    breakMinutes: present ? int(rng, 20, 75) : 0,
    location: pick(rng, cities),
    coords: { lat: +(baseLat + (rng() - 0.5) * 0.12).toFixed(4), lng: +(baseLng + (rng() - 0.5) * 0.12).toFixed(4) },
    status,
  } satisfies AttendanceRecord;
});
