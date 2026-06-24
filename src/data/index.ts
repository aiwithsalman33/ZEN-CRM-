// Barrel for all PipelineX CRM mock data + the initial store seed.
import { team } from './team';
import { pipelines } from './pipelines';
import { leads } from './leads';
import { contacts } from './contacts';
import { deals } from './deals';
import { callLogs } from './callLogs';
import { products } from './products';
import { quotes } from './quotes';
import { subscriptions } from './subscriptions';
import { notifications } from './notifications';
import { emails, emailTemplates } from './emails';
import { whatsappConversations, whatsappTemplates, broadcasts } from './whatsapp';
import { attendance } from './attendance';
import { goals } from './goals';
import { workflows } from './workflows';
import { activities } from './activities';
import { tasks } from './tasks';
import { integrations, auditLog } from './misc';

export * from './team';
export * from './pipelines';
export * from './leads';
export * from './contacts';
export * from './deals';
export * from './callLogs';
export * from './products';
export * from './quotes';
export * from './subscriptions';
export * from './notifications';
export * from './emails';
export * from './whatsapp';
export * from './attendance';
export * from './goals';
export * from './workflows';
export * from './activities';
export * from './tasks';
export * from './misc';

export const seedData = {
  team,
  pipelines,
  leads,
  contacts,
  deals,
  callLogs,
  products,
  quotes,
  subscriptions,
  notifications,
  emails,
  emailTemplates,
  whatsappConversations,
  whatsappTemplates,
  broadcasts,
  attendance,
  goals,
  workflows,
  activities,
  tasks,
  integrations,
  auditLog,
};

export type SeedData = typeof seedData;
