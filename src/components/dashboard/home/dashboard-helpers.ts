import type {
  DashboardActivityItem,
  DashboardChart,
  DashboardPayload,
  DashboardStat,
} from '@/types/dashboard.types';

export function formatDashboardNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getStat(cards: DashboardStat[], key: string): DashboardStat | undefined {
  return cards.find((card) => card.key === key);
}

export function getStatValue(cards: DashboardStat[], key: string, fallback = 0): number {
  return getStat(cards, key)?.value ?? fallback;
}

export function getChart(data: DashboardPayload, key: string): DashboardChart | undefined {
  return data.charts.find((chart) => chart.key === key);
}

export function getActivityItems(data: DashboardPayload): DashboardActivityItem[] {
  return data.recentSections.flatMap((section) => section.items);
}

export function pickCharts(data: DashboardPayload, keys: string[]): DashboardChart[] {
  return keys
    .map((key) => getChart(data, key))
    .filter((chart): chart is DashboardChart => Boolean(chart?.data.length));
}
