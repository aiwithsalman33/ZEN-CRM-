import type { TeamMember, PresenceStatus } from '@/types';
import { hoursAgo } from './_gen';

const mk = (
  id: string, name: string, role: TeamMember['role'], team: string, presence: PresenceStatus,
  sinceH: number, calls: number, connected: number, dealsWon: number, revenue: number, tasks: number,
): TeamMember => ({
  id, name,
  email: `${name.toLowerCase().split(' ')[0]}@pipelinex.io`,
  phone: `+91 98${id.slice(1)}00 ${10000 + Number(id.slice(1)) * 111}`.slice(0, 17),
  role, team, active: presence !== 'Offline' || true,
  presence, presenceSince: hoursAgo(sinceH),
  lastActive: hoursAgo(presence === 'Offline' ? 5 : 0),
  stats: { calls, connected, dealsWon, revenue, tasks },
});

export const team: TeamMember[] = [
  mk('u1', 'Ravi Kumar', 'Admin', 'Alpha', 'Active', 2, 42, 31, 9, 1280000, 6),
  mk('u2', 'Priya Sharma', 'Manager', 'Alpha', 'In Call', 1, 38, 27, 7, 980000, 4),
  mk('u3', 'Arjun Mehta', 'Agent', 'Bravo', 'Active', 3, 51, 33, 6, 740000, 8),
  mk('u4', 'Sneha Nair', 'Agent', 'Bravo', 'Break', 1, 29, 19, 4, 560000, 3),
  mk('u5', 'Vikram Singh', 'Agent', 'Alpha', 'Active', 4, 47, 30, 5, 690000, 5),
  mk('u6', 'Ananya Reddy', 'Agent', 'Bravo', 'Offline', 5, 22, 14, 3, 410000, 2),
];

export const agentIds = team.map((t) => t.id);
export const teamById = (id: string) => team.find((t) => t.id === id);
