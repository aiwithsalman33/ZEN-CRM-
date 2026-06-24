import type { Integration, AuditEntry } from '@/types';
import { hoursAgo, daysAgo } from './_gen';

export const integrations: Integration[] = [
  { id: 'int1', name: 'Facebook Ads', category: 'Lead Source', connected: true, lastSync: hoursAgo(2) },
  { id: 'int2', name: 'Instagram', category: 'Lead Source', connected: true, lastSync: hoursAgo(3) },
  { id: 'int3', name: 'Google Ads', category: 'Lead Source', connected: false },
  { id: 'int4', name: 'WhatsApp Business', category: 'Messaging', connected: true, lastSync: hoursAgo(1) },
  { id: 'int5', name: 'IndiaMart', category: 'Lead Source', connected: false },
  { id: 'int6', name: 'Calendly', category: 'Scheduling', connected: true, lastSync: hoursAgo(6) },
  { id: 'int7', name: 'Zapier', category: 'Automation', connected: false },
  { id: 'int8', name: 'Google Calendar', category: 'Scheduling', connected: true, lastSync: hoursAgo(1) },
  { id: 'int9', name: 'LeadSquared', category: 'CRM', connected: false },
  { id: 'int10', name: 'Zoho', category: 'CRM', connected: false },
  { id: 'int11', name: 'Freshsales', category: 'CRM', connected: false },
  { id: 'int12', name: 'HubSpot', category: 'CRM', connected: false },
];

export const auditLog: AuditEntry[] = [
  { id: 'a1', user: 'Ravi Kumar', action: 'Updated', module: 'Lead', record: 'Suresh Kumar', oldValue: 'New', newValue: 'Qualified', ip: '49.36.12.8', timestamp: hoursAgo(1) },
  { id: 'a2', user: 'Priya Sharma', action: 'Created', module: 'Deal', record: 'Brightwave — Annual License', ip: '49.36.12.10', timestamp: hoursAgo(3) },
  { id: 'a3', user: 'Arjun Mehta', action: 'Logged Call', module: 'Call', record: 'Meera Patel', ip: '49.36.12.22', timestamp: hoursAgo(4) },
  { id: 'a4', user: 'Ravi Kumar', action: 'Deleted', module: 'Lead', record: 'Spam Lead #12', ip: '49.36.12.8', timestamp: hoursAgo(6) },
  { id: 'a5', user: 'Sneha Nair', action: 'Sent Quote', module: 'Quote', record: 'Q-0025', ip: '49.36.12.31', timestamp: daysAgo(1) },
  { id: 'a6', user: 'Vikram Singh', action: 'Updated', module: 'Deal', record: 'Orbit Media — Expansion', oldValue: 'Proposal', newValue: 'Negotiation', ip: '49.36.12.44', timestamp: daysAgo(1, 2) },
  { id: 'a7', user: 'Priya Sharma', action: 'Changed Settings', module: 'Settings', record: 'Pipeline Configuration', ip: '49.36.12.10', timestamp: daysAgo(2) },
  { id: 'a8', user: 'Ananya Reddy', action: 'Created', module: 'Contact', record: 'Rahul Mehta', ip: '49.36.12.55', timestamp: daysAgo(2, 4) },
];
