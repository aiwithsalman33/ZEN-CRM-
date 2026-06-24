// Small seeded RNG so the first-seed mock data is stable across reloads
// (until localStorage takes over). mulberry32.
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
export const int = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;
export const chance = (rng: () => number, p: number) => rng() < p;

// ISO timestamp relative to a fixed anchor so seed data is deterministic.
const ANCHOR = new Date('2026-06-24T10:00:00').getTime();
export const daysAgo = (days: number, hourOffset = 0) =>
  new Date(ANCHOR - days * 86400000 + hourOffset * 3600000).toISOString();
export const daysAhead = (days: number) => new Date(ANCHOR + days * 86400000).toISOString();
export const hoursAgo = (h: number) => new Date(ANCHOR - h * 3600000).toISOString();

export const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Ananya', 'Diya', 'Saanvi',
  'Ishaan', 'Kabir', 'Riya', 'Aisha', 'Karan', 'Neha', 'Rahul', 'Sneha',
  'Manish', 'Pooja', 'Vikram', 'Tara', 'Dev', 'Meera', 'Nikhil', 'Kavya',
  'Sameer', 'Anjali', 'Yash', 'Isha', 'Rohit', 'Nisha', 'Suresh', 'Priya',
];
export const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Nair',
  'Mehta', 'Khan', 'Joshi', 'Iyer', 'Bose', 'Chopra', 'Malhotra', 'Rao',
];
export const companies = [
  'Brightwave Tech', 'Nimbus Labs', 'Vertex Retail', 'Quanta Foods', 'Orbit Media',
  'Stellar Logistics', 'Pinnacle Health', 'Lumen Finance', 'Apex Realty', 'Cobalt Energy',
  'Zephyr Travel', 'Forge Manufacturing', 'Aria Fashion', 'Helix Pharma', 'Drift Studios',
  'Cedar Solutions', 'Nova Edu', 'Tidal Sports', 'Onyx Security', 'Maple Interiors',
  'TechCorp Inc', 'StartupXYZ', 'Greenfield Agro', 'BlueOcean Marine', 'Skyline Builders',
];
export const cities = [
  'Mumbai, Maharashtra', 'Chennai, Tamil Nadu', 'Bengaluru, Karnataka', 'Delhi, NCR',
  'Hyderabad, Telangana', 'Pune, Maharashtra', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat',
  'Jaipur, Rajasthan', 'Kochi, Kerala',
];
export const campaigns = [
  'Summer Sale 2026', 'Q2 Webinar', 'Product Launch', 'Diwali Offer', 'LinkedIn Outreach',
  'Google Search', 'Retargeting', 'Trade Show Expo',
];

export const phone = (rng: () => number) => `+91 ${int(rng, 70000, 99999)}${int(rng, 10000, 99999)}`;
