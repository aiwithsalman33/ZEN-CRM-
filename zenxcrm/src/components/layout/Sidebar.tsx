import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems, navGroups } from './nav';
import { useStore } from '@/store/store';
import { Avatar } from '@/components/ui';

export const Sidebar: React.FC<{
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}> = ({ collapsed, onToggle, onNavigate }) => {
  const { state } = useStore();
  const me = state.team.find((t) => t.id === state.currentUserId) ?? state.team[0];

  return (
    <aside
      className={cn(
        'h-full bg-sidebar text-sidebar-text flex flex-col transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 h-[60px] px-3.5 shrink-0 border-b border-white/5">
        {collapsed ? (
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-extrabold text-lg leading-none">X</span>
          </div>
        ) : (
          <img src="/zenx-crm-logo.png" alt="ZENX CRM" className="h-9 w-auto object-contain" />
        )}
        <button
          onClick={onToggle}
          className={cn('ml-auto p-1.5 rounded-lg hover:bg-sidebar-2 text-sidebar-text/70 hidden lg:flex shrink-0', collapsed && 'rotate-180')}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2 px-2.5">
        {navGroups.map((group) => (
          <div key={group} className="mb-0.5">
            {!collapsed && <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 pt-3 pb-1">{group}</p>}
            {collapsed && <div className="h-px bg-white/5 my-2 mx-2" />}
            {navItems.filter((n) => n.group === group).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 h-10 rounded-lg my-0.5 text-sm font-medium transition-colors relative',
                      collapsed && 'justify-center',
                      isActive
                        ? 'bg-primary text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r before:bg-white/70'
                        : 'text-sidebar-text hover:bg-sidebar-2 hover:text-white',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={19} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user */}
      <div className="shrink-0 border-t border-white/5 p-2.5">
        <div className={cn('flex items-center gap-2.5 p-1.5 rounded-lg', !collapsed && 'hover:bg-sidebar-2')}>
          <Avatar name={me.name} size="sm" />
          {!collapsed && (
            <>
              <div className="flex flex-col leading-tight min-w-0 flex-1">
                <span className="text-sm font-medium text-white truncate">{me.name}</span>
                <span className="text-[11px] text-slate-500">{me.role}</span>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-danger" title="Logout" aria-label="Logout">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
