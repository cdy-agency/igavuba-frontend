'use client';

import type { DashboardPayload } from '@/types/dashboard.types';
import { ActivityFeed } from './activity-feed';
import { MiniCalendar } from './mini-calendar';
import { QuickLinksGrid } from './quick-links-grid';
import { getActivityItems } from './dashboard-helpers';

interface DashboardRightPanelProps {
  data: DashboardPayload;
  showQuickLinks?: boolean;
  showCalendar?: boolean;
  activityTitle?: string;
}

export function DashboardRightPanel({
  data,
  showQuickLinks = true,
  showCalendar = true,
  activityTitle,
}: DashboardRightPanelProps) {
  const activity = getActivityItems(data);

  return (
    <aside className="space-y-4">
      {showCalendar ? <MiniCalendar /> : null}
      {showQuickLinks ? <QuickLinksGrid actions={data.quickActions} /> : null}
      <ActivityFeed items={activity} title={activityTitle} pageSize={4} />
    </aside>
  );
}
