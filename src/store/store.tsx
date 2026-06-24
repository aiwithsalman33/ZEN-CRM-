import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import { seedData } from '@/data';
import type {
  TeamMember, Pipeline, Lead, Contact, Deal, CallLog, Product, Quote, Subscription,
  AppNotification, EmailMessage, EmailTemplate, WhatsAppConversation, WhatsAppTemplate, Broadcast,
  AttendanceRecord, Goal, Workflow, Activity, Task, Integration, AuditEntry,
  Toast, ToastKind, PresenceStatus,
} from '@/types';
import { uid } from '@/lib/utils';

// ===== State shape =====
export interface CompanySettings {
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  leadSources: string[];
}

export interface AppState {
  team: TeamMember[];
  pipelines: Pipeline[];
  leads: Lead[];
  contacts: Contact[];
  deals: Deal[];
  callLogs: CallLog[];
  products: Product[];
  quotes: Quote[];
  subscriptions: Subscription[];
  notifications: AppNotification[];
  emails: EmailMessage[];
  emailTemplates: EmailTemplate[];
  whatsappConversations: WhatsAppConversation[];
  whatsappTemplates: WhatsAppTemplate[];
  broadcasts: Broadcast[];
  attendance: AttendanceRecord[];
  goals: Goal[];
  workflows: Workflow[];
  activities: Activity[];
  tasks: Task[];
  integrations: Integration[];
  auditLog: AuditEntry[];
  // UI / app-level
  toasts: Toast[];
  currentUserId: string;
  settings: CompanySettings;
}

/** Collections that are arrays of `{ id }` records. */
export type CollectionKey =
  | 'team' | 'pipelines' | 'leads' | 'contacts' | 'deals' | 'callLogs' | 'products'
  | 'quotes' | 'subscriptions' | 'notifications' | 'emails' | 'emailTemplates'
  | 'whatsappConversations' | 'whatsappTemplates' | 'broadcasts'
  | 'attendance' | 'goals' | 'workflows' | 'activities' | 'tasks' | 'integrations' | 'auditLog';

const STORAGE_KEY = 'pipelinex-crm-state';
const STORAGE_VERSION = 1;

function buildInitial(): AppState {
  return {
    ...structuredClone(seedData),
    toasts: [],
    currentUserId: 'u1',
    settings: {
      name: 'PipelineX Technologies',
      industry: 'SaaS / CRM Software',
      website: 'www.pipelinex.io',
      phone: '+91 22 4000 1234',
      address: '14th Floor, Trade Tower, BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      pin: '400051',
      timezone: 'Asia/Kolkata (GMT+5:30)',
      currency: 'INR',
      dateFormat: 'DD MMM YYYY',
      leadSources: ['FB Ads', 'Instagram', 'WhatsApp', 'Web Form', 'Referral', 'Cold Call', 'Google'],
    },
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitial();
    const parsed = JSON.parse(raw);
    if (parsed.__v !== STORAGE_VERSION) return buildInitial();
    return { ...parsed.state, toasts: [] };
  } catch {
    return buildInitial();
  }
}

function persist(state: AppState) {
  try {
    const { toasts, ...rest } = state;
    void toasts;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ __v: STORAGE_VERSION, state: rest }));
  } catch {
    /* ignore quota errors */
  }
}

// ===== Actions =====
export type Action =
  | { type: 'ADD'; key: CollectionKey; item: any; prepend?: boolean }
  | { type: 'UPDATE'; key: CollectionKey; id: string; patch: any }
  | { type: 'DELETE'; key: CollectionKey; id: string }
  | { type: 'BULK_UPDATE'; key: CollectionKey; ids: string[]; patch: any }
  | { type: 'BULK_DELETE'; key: CollectionKey; ids: string[] }
  | { type: 'REPLACE'; key: CollectionKey; items: any[] }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'MARK_NOTIF_READ'; id: string }
  | { type: 'MARK_ALL_NOTIF_READ' }
  | { type: 'SET_PRESENCE'; id: string; presence: PresenceStatus }
  | { type: 'PATCH_SETTINGS'; patch: Partial<CompanySettings> }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD': {
      const list = state[action.key] as any[];
      return { ...state, [action.key]: action.prepend ? [action.item, ...list] : [...list, action.item] };
    }
    case 'UPDATE': {
      const list = state[action.key] as any[];
      return { ...state, [action.key]: list.map((r) => (r.id === action.id ? { ...r, ...action.patch } : r)) };
    }
    case 'DELETE': {
      const list = state[action.key] as any[];
      return { ...state, [action.key]: list.filter((r) => r.id !== action.id) };
    }
    case 'BULK_UPDATE': {
      const ids = new Set(action.ids);
      const list = state[action.key] as any[];
      return { ...state, [action.key]: list.map((r) => (ids.has(r.id) ? { ...r, ...action.patch } : r)) };
    }
    case 'BULK_DELETE': {
      const ids = new Set(action.ids);
      const list = state[action.key] as any[];
      return { ...state, [action.key]: list.filter((r) => !ids.has(r.id)) };
    }
    case 'REPLACE':
      return { ...state, [action.key]: action.items };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'MARK_NOTIF_READ':
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };
    case 'MARK_ALL_NOTIF_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case 'SET_PRESENCE':
      return { ...state, team: state.team.map((m) => (m.id === action.id ? { ...m, presence: action.presence } : m)) };
    case 'PATCH_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'RESET':
      return buildInitial();
    default:
      return state;
  }
}

// ===== Context =====
interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  toast: (message: string, kind?: ToastKind) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const saveTimer = useRef<number | undefined>(undefined);

  // Debounced persistence
  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => persist(state), 250);
    return () => window.clearTimeout(saveTimer.current);
  }, [state]);

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = uid('toast');
    dispatch({ type: 'ADD_TOAST', toast: { id, kind, message } });
    window.setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 3500);
  }, []);

  return <StoreContext.Provider value={{ state, dispatch, toast }}>{children}</StoreContext.Provider>;
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

/** Convenience selector hook. */
export function useAppState() {
  return useStore().state;
}
