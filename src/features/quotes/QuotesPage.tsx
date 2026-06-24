import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, CheckCircle2, Clock, DollarSign, Percent } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Button, DataTable, StatusBadge, StatCard, type Column } from '@/components/ui';
import { formatCurrency, formatCurrencyFull, formatDate, lineAmount } from '@/lib/utils';
import type { Quote } from '@/types';

export const quoteTotal = (q: Quote) => q.items.reduce((a, it) => a + lineAmount(it).total, 0);

const QuotesPage: React.FC = () => {
  const { state } = useStore();
  const navigate = useNavigate();
  const quotes = [...state.quotes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const accepted = quotes.filter((q) => q.status === 'Accepted');
  const pending = quotes.filter((q) => ['Sent', 'Viewed', 'Draft'].includes(q.status));
  const totalValue = quotes.reduce((a, q) => a + quoteTotal(q), 0);
  const decided = quotes.filter((q) => ['Accepted', 'Declined'].includes(q.status));
  const acceptRate = decided.length ? Math.round((accepted.length / decided.length) * 100) : 0;

  const columns: Column<Quote>[] = [
    { key: 'number', header: 'Quote #', sortable: true, sortValue: (q) => q.number, render: (q) => <span className="font-semibold text-ink">{q.number}</span> },
    { key: 'title', header: 'Title', render: (q) => <div><p className="font-medium text-ink">{q.title}</p><p className="text-xs text-muted">{q.company}</p></div> },
    { key: 'items', header: 'Items', align: 'center', render: (q) => <span className="text-muted">{q.items.length}</span> },
    { key: 'total', header: 'Total', align: 'right', sortable: true, sortValue: (q) => quoteTotal(q), render: (q) => <span className="font-semibold text-ink">{formatCurrencyFull(quoteTotal(q), q.currency)}</span> },
    { key: 'status', header: 'Status', sortable: true, sortValue: (q) => q.status, render: (q) => <StatusBadge value={q.status} /> },
    { key: 'createdAt', header: 'Created', sortable: true, sortValue: (q) => q.createdAt, render: (q) => <span className="text-muted text-xs">{formatDate(q.createdAt)}</span> },
    { key: 'expiryDate', header: 'Expiry', render: (q) => { const exp = new Date(q.expiryDate).getTime() < Date.now(); return <span className={`text-xs ${exp ? 'text-danger font-medium' : 'text-muted'}`}>{formatDate(q.expiryDate)}</span>; } },
  ];

  return (
    <div>
      <PageHeader title="Quotes & Proposals" icon={<FileText size={20} />} actions={<Button onClick={() => navigate('/quotes/new')}><Plus size={16} /> Create Quote</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        <StatCard icon={FileText} label="Total Quotes" value={quotes.length} accent="#FF6B35" />
        <StatCard icon={CheckCircle2} label="Accepted" value={accepted.length} accent="#22C55E" />
        <StatCard icon={Clock} label="Pending" value={pending.length} accent="#F59E0B" />
        <StatCard icon={DollarSign} label="Total Value" value={formatCurrency(totalValue)} accent="#3B82F6" />
        <StatCard icon={Percent} label="Acceptance Rate" value={`${acceptRate}%`} accent="#2DD4BF" />
      </div>
      <DataTable columns={columns} rows={quotes} rowKey={(q) => q.id} onRowClick={(q) => navigate(`/quotes/${q.id}`)} pageSize={10} />
    </div>
  );
};

export default QuotesPage;
