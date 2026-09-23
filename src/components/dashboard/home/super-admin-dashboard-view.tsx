'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { useDashboard } from '@/contexts/dashboard-context';
import { WelcomeBanner } from './welcome-banner';
import { HeroStatCards } from './hero-stat-cards';
import { StatCardsGrid } from './stat-cards-grid';
import { DashboardChartCard } from './dashboard-chart-card';
import { ActivityFeed } from './activity-feed';
import { MiniCalendar } from './mini-calendar';
import { getActivityItems, getChart } from './dashboard-helpers';
import { DASHBOARD_HERO_ILLUSTRATIONS } from './dashboard-hero-illustrations';

interface SuperAdminDashboardViewProps {
  data: DashboardPayload;
}

export function SuperAdminDashboardView({ data }: SuperAdminDashboardViewProps) {
  const { user } = useDashboard();

  const institutionGrowth = getChart(data, 'institutionGrowth');
  const courseGrowth = getChart(data, 'courseGrowth');
  const userDistribution = getChart(data, 'userDistribution');
  const monthlyEnrollments = getChart(data, 'monthlyEnrollments');

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <WelcomeBanner
          name={user?.name}
          roleLabel="Platform Admin"
          subtitle="Monitor institutions, users, courses, and enrollments across the platform."
          illustrationSrc={DASHBOARD_HERO_ILLUSTRATIONS.admin}
          illustrationAlt="Platform administrator"
          illustrationVariant="hero"
          primaryAction={{ label: 'Manage institutions', href: '/dashboard/institutions' }}
        />
        <HeroStatCards
          cards={data.cards}
          keys={['totalInstitutions', 'learners', 'courses']}
          viewAllHref="/dashboard/institutions"
        />
      </div>

      <StatCardsGrid
        cards={data.cards}
        keys={[
          'institutionAdmins',
          'lecturers',
          'publishedCourses',
          'coursesUnderReview',
          'totalEnrollments',
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {institutionGrowth ? <DashboardChartCard chart={institutionGrowth} /> : null}
            {courseGrowth ? <DashboardChartCard chart={courseGrowth} /> : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {userDistribution ? <DashboardChartCard chart={userDistribution} /> : null}
            {monthlyEnrollments ? <DashboardChartCard chart={monthlyEnrollments} /> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <MiniCalendar />
          <ActivityFeed items={getActivityItems(data)} title="Platform activity" pageSize={4} />
        </aside>
      </div>
    </div>
  );
}
