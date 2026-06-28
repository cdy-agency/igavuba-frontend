'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import type { DashboardPayload } from '@/types/dashboard.types';
import { FULL_WIDTH_CHART_KEYS } from '@/lib/dashboard-chart-theme';
import { ChartCard } from './shared/chart-card';
import { EmptyState } from './shared/empty-state';
import { QuickActions } from './shared/quick-actions';
import { RecentActivity } from './shared/recent-activity';
import { StatCard } from './shared/stat-card';
import { cn } from '@/lib/utils';

interface RoleDashboardViewProps {
  data: DashboardPayload;
}

export function RoleDashboardView({ data }: RoleDashboardViewProps) {
  const hasCards = data.cards.length > 0;
  const hasCharts = data.charts.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        badge={data.meta.badge}
        title={data.meta.title}
        description={data.meta.description}
      />

      {hasCards ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {data.cards.map((card) => (
            <StatCard key={card.key} label={card.label} value={card.value} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No dashboard metrics yet."
          description="Metrics will appear here once platform activity begins."
        />
      )}

      {data.quickActions.length > 0 ? <QuickActions actions={data.quickActions} /> : null}

      {hasCharts ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.charts.map((chart) => (
            <ChartCard
              key={chart.key}
              chart={chart}
              className={cn(FULL_WIDTH_CHART_KEYS.has(chart.key) && 'md:col-span-2')}
            />
          ))}
        </div>
      ) : null}

      <RecentActivity sections={data.recentSections} />
    </div>
  );
}
