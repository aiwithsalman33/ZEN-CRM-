import type { LeadSource, LeadStatus, Priority, CallOutcome } from '@/types';

export const LEAD_SOURCES: LeadSource[] = ['FB Ads', 'Instagram', 'WhatsApp', 'Web Form', 'Referral', 'Cold Call', 'Google'];

export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Not Interested', 'Junk', 'Converted'];

export const LEAD_STATUS_ACCENT: Record<LeadStatus, string> = {
  New: '#64748B',
  Contacted: '#3B82F6',
  Qualified: '#22C55E',
  'Not Interested': '#EF4444',
  Junk: '#94A3B8',
  Converted: '#16A34A',
};

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export const CALL_OUTCOMES: CallOutcome[] = ['Connected', 'Not Picked', 'Callback', 'Busy', 'Wrong Number', 'Voicemail'];

export const TAG_SUGGESTIONS = ['Hot', 'Warm', 'Cold', 'VIP', 'Demo Requested', 'Budget Confirmed', 'Decision Maker', 'Price Sensitive'];

export const GST_RATES = [0, 5, 12, 18, 28];

export const PRODUCT_UNITS = ['Piece', 'Hr', 'Kg', 'Litre', 'Set'];
