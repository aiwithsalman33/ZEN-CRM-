// ===== PipelineX CRM — Domain Types =====

export type ID = string;
export type Priority = 'High' | 'Medium' | 'Low';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Not Interested' | 'Junk' | 'Converted';
export type LeadSource =
  | 'FB Ads' | 'Instagram' | 'WhatsApp' | 'Web Form' | 'Referral' | 'Cold Call' | 'Google';

export interface ScoreBreakdown {
  engagement: number;
  responseRate: number;
  activity: number;
  recency: number;
}

export interface Lead {
  id: ID;
  name: string;
  phone: string;
  altPhone?: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  priority: Priority;
  assignedTo: ID;
  campaign?: string;
  tags: string[];
  notes: string;
  company?: string;
  leadScore: number;
  scoreBreakdown: ScoreBreakdown;
  lastActivity: string;
  nextFollowUp?: string;
  createdAt: string;
}

export interface Contact {
  id: ID;
  name: string;
  phones: string[];
  email: string;
  company: string;
  designation: string;
  source: LeadSource;
  assignedTo: ID;
  tags: string[];
  notes: string;
  createdAt: string;
  lastActivity: string;
}

export interface PipelineStage {
  key: string;
  name: string;
  probability: number;
  color: string;
}

export interface Pipeline {
  id: ID;
  name: string;
  stages: PipelineStage[];
}

export interface Deal {
  id: ID;
  title: string;
  pipelineId: ID;
  stage: string;
  value: number;
  currency: string;
  contactId?: ID;
  contactName: string;
  company: string;
  probability: number;
  expectedCloseDate: string;
  assignedTo: ID;
  source: LeadSource;
  productIds: ID[];
  status: 'open' | 'won' | 'lost';
  lastActivity: string;
  createdAt: string;
  activityCounts: { call: number; email: number; note: number };
}

export type ActivityType =
  | 'call' | 'email' | 'note' | 'status' | 'whatsapp' | 'task' | 'meeting' | 'stage' | 'deal_won';

export interface Activity {
  id: ID;
  type: ActivityType;
  entityType: 'lead' | 'contact' | 'deal';
  entityId: ID;
  title: string;
  description?: string;
  agentId: ID;
  timestamp: string;
  meta?: Record<string, string | number>;
}

export type CallDirection = 'Inbound' | 'Outbound';
export type CallOutcome = 'Connected' | 'Not Picked' | 'Callback' | 'Busy' | 'Wrong Number' | 'Voicemail';

export interface CallLog {
  id: ID;
  contactName: string;
  phone: string;
  direction: CallDirection;
  duration: number;
  agentId: ID;
  timestamp: string;
  outcome: CallOutcome;
  notes: string;
  hasRecording: boolean;
  leadId?: ID;
  dealId?: ID;
}

export type TeamRole = 'Admin' | 'Manager' | 'Agent' | 'Viewer';
export type PresenceStatus = 'Active' | 'Break' | 'In Call' | 'Offline';

export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  team: string;
  active: boolean;
  presence: PresenceStatus;
  presenceSince: string;
  lastActive: string;
  stats: { calls: number; connected: number; dealsWon: number; revenue: number; tasks: number };
}

export interface Task {
  id: ID;
  title: string;
  done: boolean;
  dueDate: string;
  priority: Priority;
  assignedTo: ID;
  entityType?: 'lead' | 'deal' | 'contact';
  entityId?: ID;
  entityName?: string;
}

export interface Product {
  id: ID;
  name: string;
  sku: string;
  category: string;
  price: number;
  tax: number;
  unit: string;
  stock: number;
  lowStockAlert: number;
  status: 'Active' | 'Inactive';
  description: string;
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined' | 'Expired';

export interface QuoteLineItem {
  id: ID;
  productId?: ID;
  name: string;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
}

export interface Quote {
  id: ID;
  number: string;
  title: string;
  contactName: string;
  company: string;
  billToAddress: string;
  dealId?: ID;
  items: QuoteLineItem[];
  currency: string;
  status: QuoteStatus;
  notes: string;
  terms: string;
  createdAt: string;
  expiryDate: string;
}

export type BillingCycle = 'Monthly' | 'Quarterly' | 'Yearly';
export type SubscriptionStatus = 'Active' | 'Cancelled' | 'Paused' | 'Trial';

export interface Subscription {
  id: ID;
  contactName: string;
  plan: string;
  mrr: number;
  billingCycle: BillingCycle;
  startDate: string;
  renewalDate: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  seats: number;
}

export type NotificationType = 'call' | 'lead' | 'task' | 'deal_won' | 'quote' | 'followup' | 'system';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface EmailMessage {
  id: ID;
  from: string;
  fromName: string;
  to: string;
  cc?: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'scheduled';
  label?: 'Follow-up' | 'Proposal' | 'Invoice' | 'Important';
  tag?: 'Lead' | 'Contact' | 'Deal';
  read: boolean;
  attachments: number;
}

export interface EmailTemplate {
  id: ID;
  name: string;
  category: string;
  subject: string;
  body: string;
}

export interface WhatsAppMessage {
  id: ID;
  fromMe: boolean;
  text: string;
  timestamp: string;
  type: 'text' | 'template' | 'image' | 'document';
  status?: 'sent' | 'delivered' | 'read';
}

export interface WhatsAppConversation {
  id: ID;
  contactName: string;
  phone: string;
  kind: 'Lead' | 'Contact';
  unread: number;
  messages: WhatsAppMessage[];
}

export interface WhatsAppTemplate {
  id: ID;
  name: string;
  category: 'Follow-up' | 'Reminder' | 'Invoice' | 'Promotion' | 'Welcome';
  status: 'Approved' | 'Pending' | 'Rejected';
  body: string;
}

export interface Broadcast {
  id: ID;
  name: string;
  template: string;
  recipients: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  date: string;
}

export type GoalType = 'Calls' | 'Revenue' | 'Deals Won' | 'Meetings' | 'Demos';
export type GoalPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';

export interface Goal {
  id: ID;
  name: string;
  type: GoalType;
  assigneeId: ID;
  target: number;
  current: number;
  period: GoalPeriod;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Late';
export interface AttendanceRecord {
  id: ID;
  employeeId: ID;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakMinutes: number;
  location: string;
  coords: { lat: number; lng: number };
  status: AttendanceStatus;
}

export type WorkflowNodeKind = 'trigger' | 'condition' | 'action' | 'delay';
export interface WorkflowNode {
  id: ID;
  kind: WorkflowNodeKind;
  icon: string;
  title: string;
  description: string;
}
export interface Workflow {
  id: ID;
  name: string;
  trigger: string;
  nodes: WorkflowNode[];
  active: boolean;
  lastRun?: string;
  triggeredToday: number;
}

export interface Integration {
  id: ID;
  name: string;
  category: string;
  connected: boolean;
  lastSync?: string;
}

export interface AuditEntry {
  id: ID;
  user: string;
  action: string;
  module: string;
  record: string;
  oldValue?: string;
  newValue?: string;
  ip: string;
  timestamp: string;
}

export type ToastKind = 'success' | 'error' | 'warning' | 'info';
export interface Toast {
  id: ID;
  kind: ToastKind;
  message: string;
}
