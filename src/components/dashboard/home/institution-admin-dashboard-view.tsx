'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { useDashboard } from '@/contexts/dashboard-context';
import { WelcomeBanner } from './welcome-banner';
import { HeroStatCards } from './hero-stat-cards';
import { StatCardsGrid } from './stat-cards-grid';
import { DashboardChartCard } from './dashboard-chart-card';
import { QuickLinksGrid } from './quick-links-grid';
import { ActivityFeed } from './activity-feed';
import { MiniCalendar } from './mini-calendar';
import { PendingSummaryCard } from './pending-summary-card';
import { getActivityItems, getStatValue, getChart } from './dashboard-helpers';
import { DASHBOARD_HERO_ILLUSTRATIONS } from './dashboard-hero-illustrations';

interface InstitutionAdminDashboardViewProps {
  data: DashboardPayload;
}

export function InstitutionAdminDashboardView({ data }: InstitutionAdminDashboardViewProps) {
  const { user, institution } = useDashboard();

  const pendingReviews = getStatValue(data.cards, 'pendingCourseReviews');
  const assignmentsWaiting = getStatValue(data.cards, 'assignmentsWaitingGrading');
  const enrollmentTrend = getChart(data, 'studentEnrollmentTrend');
  const courseStatus = getChart(data, 'courseStatusDistribution');
  const completionRate = getChart(data, 'courseCompletionRate');
  const lecturerActivity = getChart(data, 'lecturerActivity');

  const institutionName = institution?.name ?? 'your institution';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <WelcomeBanner
          name={user?.name}
          roleLabel="Institution Admin"
          subtitle={`Overview of learners, lecturers, courses, and enrollments at ${institutionName}.`}
          illustrationSrc={DASHBOARD_HERO_ILLUSTRATIONS.admin}
          illustrationAlt="Institution administrator"
          illustrationVariant="hero"
          primaryAction={{ label: 'Review courses', href: '/dashboard/course-reviews' }}
        />
        <HeroStatCards
          cards={data.cards}
          keys={['internalLearners', 'courses', 'pendingCourseReviews']}
          viewAllHref="/dashboard/course-reviews"
        />
      </div>

      <StatCardsGrid
        cards={data.cards}
        keys={[
          'departments',
          'lecturers',
          'publishedCourses',
          'assignmentsWaitingGrading',
          'averageCourseRating',
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <QuickLinksGrid actions={data.quickActions} title="Administration" />

          {enrollmentTrend ? (
            <DashboardChartCard chart={enrollmentTrend} height={260} />
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {courseStatus ? <DashboardChartCard chart={courseStatus} /> : null}
            {completionRate ? <DashboardChartCard chart={completionRate} /> : null}
          </div>

          {lecturerActivity ? <DashboardChartCard chart={lecturerActivity} height={240} /> : null}
        </div>

        <aside className="space-y-4">
          <MiniCalendar />
          <PendingSummaryCard
            title="Pending tasks"
            items={[
              {
                label: 'Courses awaiting review',
                value: pendingReviews,
                href: '/dashboard/course-reviews',
                tone: 'info',
              },
              {
                label: 'Assignments to grade',
                value: assignmentsWaiting,
                href: '/dashboard/grades',
                tone: 'warning',
              },
            ]}
          />
          <ActivityFeed items={getActivityItems(data)} title="Recent activity" pageSize={4} />
        </aside>
      </div>
    </div>
  );
}
