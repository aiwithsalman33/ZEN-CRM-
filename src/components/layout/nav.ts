import {
  LayoutDashboard, CheckSquare, UserPlus, Handshake, Contact2, GitBranch,
  Phone, Mail, MessageCircle, FileText, Package, RefreshCw, Target, BarChart3,
  Trophy, Users, MapPin, Workflow, Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'MAIN' },
  { to: '/tasks', label: 'My Tasks', icon: CheckSquare, group: 'MAIN' },

  { to: '/leads', label: 'Leads', icon: UserPlus, group: 'SALES' },
  { to: '/deals', label: 'Deals', icon: Handshake, group: 'SALES' },
  { to: '/contacts', label: 'Contacts', icon: Contact2, group: 'SALES' },
  { to: '/pipeline', label: 'Pipeline', icon: GitBranch, group: 'SALES' },

  { to: '/calls', label: 'Calls', icon: Phone, group: 'COMMUNICATION' },
  { to: '/emails', label: 'Emails', icon: Mail, group: 'COMMUNICATION' },
  { to: '/whatsapp', label: 'WhatsApp', icon: MessageCircle, group: 'COMMUNICATION' },

  { to: '/quotes', label: 'Quotes', icon: FileText, group: 'BUSINESS' },
  { to: '/products', label: 'Products', icon: Package, group: 'BUSINESS' },
  { to: '/subscriptions', label: 'Subscriptions', icon: RefreshCw, group: 'BUSINESS' },

  { to: '/goals', label: 'Goals & Targets', icon: Target, group: 'PERFORMANCE' },
  { to: '/reports', label: 'Reports', icon: BarChart3, group: 'PERFORMANCE' },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, group: 'PERFORMANCE' },

  { to: '/team', label: 'Team', icon: Users, group: 'TEAM' },
  { to: '/attendance', label: 'Attendance', icon: MapPin, group: 'TEAM' },
  { to: '/automation', label: 'Automation', icon: Workflow, group: 'TEAM' },

  { to: '/settings', label: 'Settings', icon: Settings, group: 'SETTINGS' },
];

export const navGroups = [...new Set(navItems.map((n) => n.group))];
