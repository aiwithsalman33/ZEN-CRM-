import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from '@/store/store';
import { Shell } from '@/components/layout/Shell';

import DashboardPage from '@/features/dashboard/DashboardPage';
import TasksPage from '@/features/tasks/TasksPage';
import LeadsPage from '@/features/leads/LeadsPage';
import LeadDetailPage from '@/features/leads/LeadDetailPage';
import DealsPage from '@/features/deals/DealsPage';
import DealDetailPage from '@/features/deals/DealDetailPage';
import ContactsPage from '@/features/contacts/ContactsPage';
import CallsPage from '@/features/calls/CallsPage';
import EmailsPage from '@/features/emails/EmailsPage';
import WhatsAppPage from '@/features/whatsapp/WhatsAppPage';
import QuotesPage from '@/features/quotes/QuotesPage';
import QuoteBuilder from '@/features/quotes/QuoteBuilder';
import ProductsPage from '@/features/products/ProductsPage';
import SubscriptionsPage from '@/features/subscriptions/SubscriptionsPage';
import GoalsPage from '@/features/goals/GoalsPage';
import LeaderboardPage from '@/features/goals/LeaderboardPage';
import ReportsPage from '@/features/reports/ReportsPage';
import TeamPage from '@/features/team/TeamPage';
import AttendancePage from '@/features/attendance/AttendancePage';
import AutomationPage from '@/features/automation/AutomationPage';
import WorkflowBuilder from '@/features/automation/WorkflowBuilder';
import SettingsPage from '@/features/settings/SettingsPage';
import NotificationsPage from '@/features/notifications/NotificationsPage';

const App: React.FC = () => (
  <StoreProvider>
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />

          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="deals/:id" element={<DealDetailPage />} />
          <Route path="pipeline" element={<DealsPage />} />
          <Route path="contacts" element={<ContactsPage />} />

          <Route path="calls" element={<CallsPage />} />
          <Route path="emails" element={<EmailsPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />

          <Route path="quotes" element={<QuotesPage />} />
          <Route path="quotes/new" element={<QuoteBuilder />} />
          <Route path="quotes/:id" element={<QuoteBuilder />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />

          <Route path="goals" element={<GoalsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />

          <Route path="team" element={<TeamPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="automation" element={<AutomationPage />} />
          <Route path="automation/:id" element={<WorkflowBuilder />} />

          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  </StoreProvider>
);

export default App;
