import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, Bell, Search, ChevronDown, Settings, LogOut, UserRound, Plus,
  Calendar, UserPlus, Handshake, Contact2, CheckSquare, Users, FileText,
} from 'lucide-react';
import { useStore } from '@/store/store';
import { Avatar } from '@/components/ui';
import { navItems } from './nav';
import { cn } from '@/lib/utils';

function useOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return ref;
}

const GlobalSearch: React.FC = () => {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: { type: string; icon: React.ElementType; label: string; sub: string; to: string }[] = [];
    state.leads.filter((l) => l.name.toLowerCase().includes(term) || l.phone.includes(term)).slice(0, 4)
      .forEach((l) => out.push({ type: 'Lead', icon: UserPlus, label: l.name, sub: l.phone, to: `/leads/${l.id}` }));
    state.contacts.filter((c) => c.name.toLowerCase().includes(term) || c.company.toLowerCase().includes(term)).slice(0, 3)
      .forEach((c) => out.push({ type: 'Contact', icon: Contact2, label: c.name, sub: c.company, to: '/contacts' }));
    state.deals.filter((d) => d.title.toLowerCase().includes(term) || d.company.toLowerCase().includes(term)).slice(0, 3)
      .forEach((d) => out.push({ type: 'Deal', icon: Handshake, label: d.title, sub: d.company, to: `/deals/${d.id}` }));
    return out.slice(0, 8);
  }, [q, state]);

  return (
    <div className="relative flex-1 max-w-sm hidden sm:block" ref={ref}>
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-bg border border-transparent focus-within:border-primary focus-within:bg-white transition-colors">
        <Search size={15} className="text-muted" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search leads, deals, contacts..."
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted/70"
          aria-label="Global search"
        />
      </div>
      {open && q && (
        <div className="absolute top-11 left-0 right-0 z-40 card p-2 max-h-96 overflow-y-auto animate-scaleIn">
          {results.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">No results for “{q}”</p>
          ) : results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button key={i} onClick={() => { navigate(r.to); setOpen(false); setQ(''); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg text-left">
                <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0"><Icon size={15} /></div>
                <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink truncate">{r.label}</p><p className="text-xs text-muted truncate">{r.sub}</p></div>
                <span className="text-[10px] font-medium text-muted bg-bg rounded px-1.5 py-0.5">{r.type}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const QuickAdd: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));
  const items = [
    { icon: UserPlus, label: 'New Lead', to: '/leads' },
    { icon: Handshake, label: 'New Deal', to: '/deals' },
    { icon: Contact2, label: 'New Contact', to: '/contacts' },
    { icon: CheckSquare, label: 'New Task', to: '/tasks' },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 h-9 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark" aria-label="Quick add">
        <Plus size={16} /> <span className="hidden md:inline">Add</span> <ChevronDown size={13} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 card p-2 z-40 animate-scaleIn">
          {items.map((it) => (
            <button key={it.label} onClick={() => { navigate(it.to, { state: { openAdd: true } }); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-bg text-sm text-ink">
              <it.icon size={16} className="text-primary" /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const UserMenu: React.FC = () => {
  const { state } = useStore();
  const me = state.team.find((t) => t.id === state.currentUserId) ?? state.team[0];
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));
  const navigate = useNavigate();
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-1.5 h-9 rounded-lg hover:bg-bg" aria-label="User menu">
        <Avatar name={me.name} size="sm" presence={me.presence} />
        <ChevronDown size={14} className="text-muted hidden md:block" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 card p-2 z-40 animate-scaleIn">
          <div className="px-3 py-2 border-b border-line mb-1">
            <p className="text-sm font-semibold text-ink">{me.name}</p>
            <p className="text-xs text-muted">{me.email}</p>
          </div>
          {[{ icon: UserRound, label: 'Profile', to: '/team' }, { icon: Settings, label: 'Settings', to: '/settings' }].map((item) => (
            <button key={item.label} onClick={() => { navigate(item.to); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-bg text-sm text-ink">
              <item.icon size={16} className="text-muted" /> {item.label}
            </button>
          ))}
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-danger/10 text-sm text-danger mt-1 border-t border-line pt-2">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

function pageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  const seg = '/' + pathname.split('/')[1];
  return navItems.find((n) => n.to === seg)?.label ?? 'PipelineX';
}

export const Header: React.FC<{ onMenuClick: () => void; onBellClick: () => void }> = ({ onMenuClick, onBellClick }) => {
  const { state } = useStore();
  const { pathname } = useLocation();
  const unread = state.notifications.filter((n) => !n.read).length;

  return (
    <header className="h-[60px] shrink-0 bg-card border-b border-line flex items-center gap-3 px-4 sticky top-0 z-30">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-bg text-ink" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <h1 className="text-lg font-semibold text-ink hidden sm:block shrink-0">{pageTitle(pathname)}</h1>
      <div className="flex-1" />
      <GlobalSearch />
      <QuickAdd />
      <button onClick={onBellClick} className="relative p-2 rounded-lg hover:bg-bg text-ink" title="Notifications" aria-label="Notifications">
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <button className="p-2 rounded-lg hover:bg-bg text-ink hidden md:flex" title="Calendar" aria-label="Calendar">
        <Calendar size={19} />
      </button>
      <div className="w-px h-7 bg-line mx-0.5" />
      <UserMenu />
    </header>
  );
};
