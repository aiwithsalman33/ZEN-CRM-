import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationPanel } from './NotificationPanel';
import { ToastHost } from '@/components/ui';
import { cn } from '@/lib/utils';

export const Shell: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 animate-slideInLeft">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} onBellClick={() => setNotifOpen(true)} />
        <main className={cn('flex-1 overflow-y-auto p-4 sm:p-6')}>
          <div className="max-w-[1600px] mx-auto animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <ToastHost />
    </div>
  );
};
