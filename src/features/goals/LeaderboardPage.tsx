import React from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '@/store/store';
import { PageHeader, Avatar } from '@/components/ui';
import { formatCurrencyFull } from '@/lib/utils';

const LeaderboardPage: React.FC = () => {
  const { state } = useStore();
  const rows = [...state.team]
    .map((m) => ({ ...m, score: m.stats.dealsWon * 100 + m.stats.connected * 2 + Math.round(m.stats.revenue / 10000) }))
    .sort((a, b) => b.score - a.score);

  const rowBg = (i: number) => (i === 0 ? 'bg-amber-50' : i === 1 ? 'bg-slate-100' : i === 2 ? 'bg-orange-50' : '');
  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <div>
      <PageHeader title="Leaderboard" icon={<Trophy size={20} />} actions={<span className="text-xs font-medium text-muted bg-bg px-2.5 py-1.5 rounded-lg">This Month</span>} />
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-line bg-bg/40 text-xs uppercase tracking-wide text-muted">
            <th className="text-left font-semibold px-4 py-3">Rank</th><th className="text-left font-semibold px-4 py-3">Agent</th>
            <th className="text-right font-semibold px-4 py-3">Calls</th><th className="text-right font-semibold px-4 py-3">Deals Won</th>
            <th className="text-right font-semibold px-4 py-3">Revenue</th><th className="text-right font-semibold px-4 py-3">Score</th><th className="text-center font-semibold px-4 py-3">Trend</th>
          </tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((m, i) => (
              <tr key={m.id} className={rowBg(i)}>
                <td className="px-4 py-3 text-lg">{medal(i)}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={m.name} size="sm" /><div><p className="font-medium text-ink">{m.name}</p><p className="text-xs text-muted">{m.role} · {m.team}</p></div></div></td>
                <td className="px-4 py-3 text-right text-muted">{m.stats.calls}</td>
                <td className="px-4 py-3 text-right text-muted">{m.stats.dealsWon}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrencyFull(m.stats.revenue)}</td>
                <td className="px-4 py-3 text-right"><span className="font-bold text-primary">{m.score}</span></td>
                <td className="px-4 py-3 text-center">{i % 2 === 0 ? <TrendingUp size={16} className="text-success inline" /> : <TrendingDown size={16} className="text-danger inline" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
