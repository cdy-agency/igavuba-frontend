'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { useDashboard } from '@/contexts/dashboard-context';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useMyProgress } from '@/hooks/use-progress';
import { WelcomeBanner } from './welcome-banner';
import { HeroStatCards } from './hero-stat-cards';
import { LearnerCurrentCourses } from './learner-current-courses';
import { LearningProgressDonut } from './learning-progress-donut';
import { DashboardChartCard } from './dashboard-chart-card';
import { ActivityFeed } from './activity-feed';
import { MiniCalendar } from './mini-calendar';
import { QuickLinksGrid } from './quick-links-grid';
import { UpcomingScheduleCard } from './upcoming-schedule-card';
import { getActivityItems, getChart } from './dashboard-helpers';
import { DASHBOARD_HERO_ILLUSTRATIONS } from './dashboard-hero-illustrations';

interface LearnerDashboardViewProps {
  data: DashboardPayload;
}

export function LearnerDashboardView({ data }: LearnerDashboardViewProps) {
  const { user } = useDashboard();
  const authReady = useAuthReady();
  const { data: progressCourses = [] } = useMyProgress(authReady);

  const continueAction = data.quickActions.find((action) => action.key === 'continueLearning');
  const weeklyActivity = getChart(data, 'weeklyLearningActivity');
  const assessmentPerformance = getChart(data, 'assessmentPerformance');

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
        <WelcomeBanner
          name={user?.name}
          roleLabel="Student"
          subtitle="Track your learning progress, complete lessons, and earn certificates."
          illustrationSrc={DASHBOARD_HERO_ILLUSTRATIONS.learner}
          illustrationAlt="Student learning online"
          illustrationVariant="hero"
          primaryAction={
            continueAction
              ? { label: continueAction.label, href: continueAction.href }
              : { label: 'Continue learning', href: '/dashboard/my-learning' }
          }
        />
        <HeroStatCards
          cards={data.cards}
          keys={['enrolledCourses', 'completedCourses', 'certificatesEarned']}
          viewAllHref="/dashboard/my-learning"
          className="xl:pt-1"
        />
      </div>

      <LearnerCurrentCourses />

      <UpcomingScheduleCard variant="deadlines" limit={5} hideWhenEmpty />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <LearningProgressDonut courses={progressCourses} />
            {weeklyActivity ? <DashboardChartCard chart={weeklyActivity} height={220} /> : null}
          </div>
          {assessmentPerformance ? (
            <DashboardChartCard chart={assessmentPerformance} height={220} />
          ) : null}
        </div>

        <aside className="space-y-4">
          <UpcomingScheduleCard variant="events" limit={4} />
          <MiniCalendar />
          <QuickLinksGrid actions={data.quickActions} />
          <ActivityFeed items={getActivityItems(data)} title="Recent activity" pageSize={4} />
        </aside>
      </div>
    </div>
  );
}
