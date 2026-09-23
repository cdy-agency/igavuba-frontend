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
import { UpcomingScheduleCard } from './upcoming-schedule-card';
import { getActivityItems, getChart, getStatValue } from './dashboard-helpers';
import { DASHBOARD_HERO_ILLUSTRATIONS } from './dashboard-hero-illustrations';

interface LecturerDashboardViewProps {
  data: DashboardPayload;
}

export function LecturerDashboardView({ data }: LecturerDashboardViewProps) {
  const { user } = useDashboard();

  const assignmentsWaiting = getStatValue(data.cards, 'assignmentsWaitingGrading');
  const underReview = getStatValue(data.cards, 'coursesUnderReview');
  const enrollmentChart = getChart(data, 'enrollmentPerCourse');
  const assignmentStatus = getChart(data, 'assignmentStatus');
  const quizPassRate = getChart(data, 'quizPassRate');
  const courseCompletion = getChart(data, 'courseCompletion');

  const subtitle =
    assignmentsWaiting > 0 || underReview > 0
      ? `You have ${assignmentsWaiting} assignment${assignmentsWaiting === 1 ? '' : 's'} to grade${underReview > 0 ? ` and ${underReview} course${underReview === 1 ? '' : 's'} under review` : ''}.`
      : 'Manage your courses, track learner progress, and stay on top of grading.';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <WelcomeBanner
          name={user?.name}
          roleLabel="Lecturer"
          subtitle={subtitle}
          illustrationSrc={DASHBOARD_HERO_ILLUSTRATIONS.lecturer}
          illustrationAlt="Lecturer teaching mathematics"
          illustrationVariant="hero"
          primaryAction={{ label: 'View my courses', href: '/dashboard/courses' }}
        />
        <HeroStatCards
          cards={data.cards}
          keys={['myCourses', 'totalLearners', 'assignmentsWaitingGrading']}
          viewAllHref="/dashboard/courses"
        />
      </div>

      <StatCardsGrid
        cards={data.cards}
        keys={[
          'publishedCourses',
          'draftCourses',
          'coursesUnderReview',
          'quizzes',
          'averageCourseRating',
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <QuickLinksGrid actions={data.quickActions} title="Teaching tools" />

          <div className="grid gap-4 lg:grid-cols-2">
            {enrollmentChart ? <DashboardChartCard chart={enrollmentChart} /> : null}
            {assignmentStatus ? <DashboardChartCard chart={assignmentStatus} /> : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {quizPassRate ? <DashboardChartCard chart={quizPassRate} /> : null}
            {courseCompletion ? <DashboardChartCard chart={courseCompletion} /> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <UpcomingScheduleCard variant="events" limit={5} />
          <MiniCalendar />
          <PendingSummaryCard
            items={[
              {
                label: 'Assignments waiting grading',
                value: assignmentsWaiting,
                href: '/dashboard/grades',
                tone: 'warning',
              },
              {
                label: 'Courses under review',
                value: underReview,
                href: '/dashboard/course-reviews',
                tone: 'info',
              },
            ]}
          />
          <ActivityFeed items={getActivityItems(data)} title="Recent activity" pageSize={4} />
        </aside>
      </div>
    </div>
  );
}
