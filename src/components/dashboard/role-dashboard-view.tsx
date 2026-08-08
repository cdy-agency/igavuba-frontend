'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  AreaChart,
  BarChart3,
  Briefcase,
  Check,
  Download,
  GraduationCap,
  Info,
  LineChart as LineChartIcon,
  MapPin,
  Plus,
  Users,
} from 'lucide-react';
import type {
  DashboardActivityItem,
  DashboardChart,
  DashboardChartPoint,
  DashboardPayload,
  DashboardStat,
} from '@/types/dashboard.types';
import { getChartColor } from '@/lib/dashboard-chart-theme';
import { oazisDisplayFontClass } from '@/lib/oazis-dashboard-fonts';
import { cn } from '@/lib/utils';
import { dateRangeToIsoStrings } from '@/components/ui/date-range-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import type { DateRange } from 'react-day-picker';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface RoleDashboardViewProps {
  data: DashboardPayload;
}

type FocusChartType = 'line' | 'bar' | 'area';

const CARD_COLORS = ['#1DA1F2', '#f2a93b', '#17BF63', '#E0245E', '#794BC4', '#00B5AD'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const GROWTH_CHART_ORDER = [
  'institutionGrowth',
  'courseGrowth',
  'monthlyEnrollments',
  'studentEnrollmentTrend',
  'enrollmentPerCourse',
  'weeklyLearningActivity',
];

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function normalizeLabel(label: string): string {
  return label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function sumPoints(points: DashboardChartPoint[]): number {
  return points.reduce((total, point) => total + Number(point.value || 0), 0);
}

function statByKey(cards: DashboardStat[], keys: string[]): DashboardStat | undefined {
  return cards.find((card) => keys.some((key) => card.key.toLowerCase().includes(key)));
}

function asChartData(points: DashboardChartPoint[]) {
  return points.map((point) => ({
    label: normalizeLabel(point.label),
    value: Number(point.value || 0),
  }));
}

function parsePointDate(label: string): Date | null {
  const direct = new Date(label);

  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const monthMatch = label.match(/^([A-Za-z]{3,9})\s+(\d{4})$/);

  if (!monthMatch) {
    return null;
  }

  const monthDate = new Date(`${monthMatch[1]} 1, ${monthMatch[2]}`);
  return Number.isNaN(monthDate.getTime()) ? null : monthDate;
}

function filterPointsByDate(
  points: DashboardChartPoint[],
  dateStart: string,
  dateEnd: string,
): DashboardChartPoint[] {
  if (!dateStart && !dateEnd) {
    return points;
  }

  const datedPoints = points
    .map((point) => ({ point, date: parsePointDate(point.label) }))
    .filter((entry): entry is { point: DashboardChartPoint; date: Date } => entry.date !== null);

  if (datedPoints.length === 0) {
    return points;
  }

  const start = dateStart ? new Date(`${dateStart}T00:00:00`) : null;
  const end = dateEnd ? new Date(`${dateEnd}T23:59:59`) : null;
  const filtered = datedPoints
    .filter(({ date }) => (!start || date >= start) && (!end || date <= end))
    .map(({ point }) => point);

  return filtered.length > 0 ? filtered : points;
}

function monthIndexFromLabel(label: string): number | null {
  const month = label.slice(0, 3).toLowerCase();
  const index = MONTH_LABELS.findIndex((item) => item.toLowerCase() === month);
  return index >= 0 ? index : null;
}

function normalizeMonthlyPoints(points: DashboardChartPoint[]): DashboardChartPoint[] {
  const hasMonthlyLabels = points.some((point) => monthIndexFromLabel(point.label) !== null);

  if (!hasMonthlyLabels) {
    return points;
  }

  const values = new Array(12).fill(0) as number[];

  for (const point of points) {
    const monthIndex = monthIndexFromLabel(point.label);

    if (monthIndex !== null) {
      values[monthIndex] += Number(point.value || 0);
    }
  }

  return MONTH_LABELS.map((label, index) => ({ label, value: values[index] }));
}

function deriveProgressChart(data: DashboardPayload): DashboardChartPoint[] {
  const progressChart = data.charts.find((chart) =>
    ['courseCompletionRate', 'courseCompletion', 'learningProgress'].includes(chart.key),
  );

  if (progressChart?.data.length) {
    if (progressChart.data.length === 1) {
      const completed = Math.min(100, Math.max(0, progressChart.data[0].value));
      return [
        { label: 'Completed', value: completed },
        { label: 'Ongoing', value: Math.max(0, 100 - completed) },
      ];
    }

    return progressChart.data;
  }

  const completed = statByKey(data.cards, ['completed'])?.value ?? 0;
  const enrolled =
    statByKey(data.cards, ['enrolled', 'enrollment', 'learner', 'student'])?.value ?? completed;
  const remaining = Math.max(0, enrolled - completed);

  return [
    { label: 'Completed', value: completed },
    { label: 'Ongoing', value: remaining },
  ].filter((point) => point.value > 0);
}

function deriveStatDetail(stat: DashboardStat, cards: DashboardStat[]): string {
  const completed = statByKey(cards, ['completed']);
  const enrolled = statByKey(cards, ['enrollment', 'learner', 'student']);
  const published = statByKey(cards, ['published']);

  if (stat.key.toLowerCase().includes('learner') || stat.key.toLowerCase().includes('enrollment')) {
    if (completed && enrolled && enrolled.value > 0) {
      return `${Math.round((completed.value / enrolled.value) * 100)}% completion rate`;
    }
    return 'Active learners';
  }

  if (stat.key.toLowerCase().includes('course')) {
    if (published) {
      return `${formatNumber(published.value)} published`;
    }
    return 'Available courses';
  }

  if (stat.key.toLowerCase().includes('institution')) {
    return 'Partner institutions';
  }

  if (stat.key.toLowerCase().includes('lecturer')) {
    return 'Teaching staff';
  }

  if (stat.key.toLowerCase().includes('department')) {
    return 'Organizational units';
  }

  return stat.label;
}

function pickEngagementChart(data: DashboardPayload, excludeKey?: string): DashboardChart | undefined {
  const preferredKeys = ['weeklyLearningActivity', 'lecturerActivity', 'monthlyEnrollments', 'studentEnrollmentTrend'];

  for (const key of preferredKeys) {
    const chart = data.charts.find((entry) => entry.key === key && entry.key !== excludeKey);
    if (chart?.data.length) {
      return chart;
    }
  }

  return data.charts.find(
    (chart) =>
      chart.key !== excludeKey &&
      chart.type === 'line' &&
      chart.data.length > 0 &&
      chart.data.length <= 12,
  );
}

function pickCategoryChart(data: DashboardPayload, excludeKey?: string): DashboardChart | undefined {
  return (
    data.charts.find(
      (chart) =>
        chart.key !== excludeKey &&
        chart.type === 'pie' &&
        chart.data.length > 0 &&
        !['courseCompletionRate', 'courseCompletion', 'learningProgress'].includes(chart.key),
    ) ??
    data.charts.find((chart) => chart.key !== excludeKey && chart.type === 'pie' && chart.data.length > 0) ??
    data.charts.find((chart) => chart.key !== excludeKey && chart.data.length > 0)
  );
}

function getActivityBadge(type: string) {
  const normalized = type.toUpperCase();

  if (
    normalized.includes('COMPLET') ||
    normalized.includes('APPROVED') ||
    normalized.includes('CERTIFICATE') ||
    normalized.includes('GRADED') ||
    normalized.includes('PASSED')
  ) {
    return { label: 'Completed', className: 'bg-[#e7f8ee] text-[#13934c]' };
  }

  if (normalized.includes('REVIEW') || normalized.includes('SUBMITTED') || normalized.includes('WAITING')) {
    return { label: 'Review', className: 'bg-[#fff4df] text-[#b7791f]' };
  }

  return { label: 'Enrolled', className: 'bg-[#e3f3fd] text-[#0d8ddb]' };
}

function getActivityIcon(type: string) {
  const normalized = type.toUpperCase();
  const isComplete =
    normalized.includes('COMPLET') ||
    normalized.includes('APPROVED') ||
    normalized.includes('CERTIFICATE') ||
    normalized.includes('GRADED');

  if (isComplete) {
    return { Icon: Check, className: 'bg-[#e7f8ee] text-[#13934c]' };
  }

  return { Icon: Plus, className: 'bg-[#e3f3fd] text-[#0d8ddb]' };
}

function buildHeroSummary(data: DashboardPayload, primaryCount: number, courseCount: number, institutionCount: number) {
  if (data.meta.description) {
    return data.meta.description;
  }

  return `Tracking ${formatNumber(primaryCount)} learners across ${formatNumber(courseCount)} courses${institutionCount ? ` and ${formatNumber(institutionCount)} departments` : ''}.`;
}

function pickDefaultGrowthMetric(charts: DashboardChart[]): string {
  return charts[0]?.key ?? '';
}

function sortGrowthCharts(charts: DashboardChart[]) {
  return [...charts].sort((left, right) => {
    const leftIndex = GROWTH_CHART_ORDER.indexOf(left.key);
    const rightIndex = GROWTH_CHART_ORDER.indexOf(right.key);

    if (leftIndex === -1 && rightIndex === -1) {
      return 0;
    }
    if (leftIndex === -1) {
      return 1;
    }
    if (rightIndex === -1) {
      return -1;
    }
    return leftIndex - rightIndex;
  });
}

function isGrowthTimeSeriesChart(chart: DashboardChart) {
  return chart.type === 'line' || chart.type === 'bar';
}

function buildDemoInsight(points: DashboardChartPoint[]): string {
  if (!points.length) {
    return 'Select a lens to explore how learners are distributed across your platform data.';
  }

  const sorted = [...points].sort((left, right) => right.value - left.value);
  const top = sorted[0];
  const total = sumPoints(sorted);

  if (!top || total <= 0) {
    return 'No breakdown data is available for the selected lens yet.';
  }

  const share = Math.round((top.value / total) * 100);
  return `${normalizeLabel(top.label)} represents the largest group at ${share}% of the selected breakdown.`;
}

function downloadReport(data: DashboardPayload) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${data.meta.title || 'dashboard'}-report.json`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
  anchor.click();
  URL.revokeObjectURL(url);
}

function OazisCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-[20px] border border-[#e6edf1] bg-white p-[22px] shadow-[0_1px_2px_rgba(12,42,58,.04),0_10px_30px_rgba(12,42,58,.07)]',
        className,
      )}
    >
      {children}
    </section>
  );
}

function CardHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3.5">
      <div>
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-[#0c2a3a]">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12.5px] font-medium text-[#8aa0ad]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function MetricTab({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-w-[118px] flex-col items-start rounded-[10px] border border-[#e6edf1] bg-white px-[13px] py-2 text-left transition-colors duration-150',
        active && 'border-[#1DA1F2] bg-[#1DA1F2]',
      )}
    >
      <span
        className={cn(
          'text-[11px] font-semibold leading-none text-[#8aa0ad]',
          active && 'text-white',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'mt-px text-[16px] font-extrabold leading-none tracking-[-0.01em] text-[#0c2a3a]',
          oazisDisplayFontClass,
          active && 'text-white',
        )}
      >
        {value}
      </span>
    </button>
  );
}

function ChartTypeToggle({
  chartType,
  onChange,
}: {
  chartType: FocusChartType;
  onChange: (type: FocusChartType) => void;
}) {
  const options: Array<{ type: FocusChartType; Icon: typeof LineChartIcon }> = [
    { type: 'line', Icon: LineChartIcon },
    { type: 'bar', Icon: BarChart3 },
    { type: 'area', Icon: AreaChart },
  ];

  return (
    <div className="inline-flex h-fit rounded-[10px] bg-[#eef3f6] p-[3px]">
      {options.map(({ type, Icon }) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            'grid place-items-center rounded-[7px] px-[9px] py-[7px] text-[#8aa0ad] transition-colors',
            chartType === type && 'bg-white text-[#1DA1F2] shadow-[0_1px_3px_rgba(0,0,0,0.1)]',
          )}
          title={`${type} chart`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}

function ActivityRow({ item }: { item: DashboardActivityItem }) {
  const badge = getActivityBadge(item.type);
  const { Icon, className: iconClassName } = getActivityIcon(item.type);

  const content = (
    <div className="flex gap-3 border-b border-[#e6edf1] py-3.5 last:border-0 last:pb-0">
      <span className={cn('grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px]', iconClassName)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[13.5px] leading-[1.45] text-[#0c2a3a]">
          <span className="font-bold">{item.title}</span>
          {item.description ? (
            <>
              {' · '}
              <span className="font-semibold text-[#1DA1F2]">{item.description}</span>
            </>
          ) : null}{' '}
          <span className={cn('ml-1 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold', badge.className)}>
            {badge.label}
          </span>
        </p>
        <p className="mt-0.5 text-[11.5px] text-[#8aa0ad]">
          {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  return item.href ? <Link href={item.href}>{content}</Link> : content;
}

function FocusChart({
  chart,
  type,
  dateStart,
  dateEnd,
  compact = false,
}: {
  chart?: DashboardChart;
  type: FocusChartType;
  dateStart: string;
  dateEnd: string;
  compact?: boolean;
}) {
  const gradientId = useId().replace(/:/g, '');
  const filteredPoints = filterPointsByDate(chart?.data ?? [], dateStart, dateEnd);
  const chartData = asChartData(compact ? filteredPoints : normalizeMonthlyPoints(filteredPoints));
  const maxValue = Math.max(...chartData.map((point) => point.value), 0);
  const useFixedScale = maxValue === 0;
  const tickStyle = { fill: '#8aa0ad', fontSize: compact ? 11 : 12, fontWeight: 500 };

  if (!chart || chartData.length === 0) {
    return (
      <div className={cn('grid h-full place-items-center text-[12.5px] text-[#8aa0ad]')}>
        No chart data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="#1DA1F2"
              stopOpacity={type === 'area' ? 0.28 : 0.08}
            />
            <stop offset="100%" stopColor="#1DA1F2" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#e6edf1" vertical={false} />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={tickStyle}
          dy={6}
          interval={0}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          width={46}
          tick={tickStyle}
          domain={useFixedScale ? [0, 250] : [0, 'auto']}
          ticks={useFixedScale ? [0, 50, 100, 150, 200, 250] : undefined}
          allowDecimals={false}
        />

        <Tooltip
          cursor={{ stroke: '#1DA1F2', strokeWidth: 1, strokeDasharray: '4 4' }}
          formatter={(value: number) => [formatNumber(Number(value)), chart.label]}
          labelFormatter={(label) => String(label)}
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #e6edf1',
            fontSize: 12,
          }}
        />

        {type === 'bar' ? (
          <Bar dataKey="value" fill="#1DA1F2" radius={[8, 8, 0, 0]} maxBarSize={compact ? 18 : 32} />
        ) : (
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1DA1F2"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ r: compact ? 3 : 4, fill: '#1DA1F2', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#1DA1F2' }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function DonutChart({
  points,
  center,
}: {
  points: DashboardChartPoint[];
  center?: React.ReactNode;
}) {
  const chartData = asChartData(points);

  return (
    <div className="relative h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={62} outerRadius={88} paddingAngle={2}>
            {chartData.map((point, index) => (
              <Cell key={point.label} fill={CARD_COLORS[index % CARD_COLORS.length]} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {center ? <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">{center}</div> : null}
    </div>
  );
}

function Ranking({ points }: { points: DashboardChartPoint[] }) {
  const top = [...points].sort((a, b) => b.value - a.value).slice(0, 10);
  const max = Math.max(...top.map((point) => point.value), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {top.map((point, index) => (
        <div key={`${point.label}-${index}`} className="flex items-center gap-3">
          <span className="w-4 shrink-0 text-[11px] font-bold text-[#8aa0ad]">{index + 1}</span>
          <span className="w-40 shrink-0 truncate text-[12.5px] font-semibold text-[#0c2a3a]">
            {normalizeLabel(point.label)}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded-[7px] bg-[#eef3f6]">
            <div
              className="h-full rounded-[7px] transition-[width] duration-700"
              style={{
                width: `${Math.max(4, (point.value / max) * 100)}%`,
                backgroundColor: CARD_COLORS[index % CARD_COLORS.length],
              }}
            />
          </div>
          <span className="w-16 text-right text-[12.5px] font-bold text-[#475a66]">
            {formatNumber(point.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RoleDashboardView({ data }: RoleDashboardViewProps) {
  const chartsWithData = useMemo(
    () => data.charts.filter((chart) => chart.data.length > 0),
    [data.charts],
  );
  const growthCharts = useMemo(
    () =>
      sortGrowthCharts(chartsWithData.filter(isGrowthTimeSeriesChart)).filter(
        (c) => c.label !== 'Learning Progress by Course',
      ),
    [chartsWithData],
  );
  const pieCharts = useMemo(
    () => chartsWithData.filter((chart) => chart.type === 'pie'),
    [chartsWithData],
  );
  const defaultGrowthMetric = useMemo(
    () => pickDefaultGrowthMetric(growthCharts),
    [growthCharts],
  );

  const [selectedMetric, setSelectedMetric] = useState(defaultGrowthMetric);
  const [chartType, setChartType] = useState<FocusChartType>('line');
  const [demoKey, setDemoKey] = useState(chartsWithData[0]?.key ?? '');
  const [focusAreaKey, setFocusAreaKey] = useState(pieCharts[0]?.key ?? 'all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { start: dateStart, end: dateEnd } = dateRangeToIsoStrings(dateRange);

  const focusChart =
    growthCharts.find((chart) => chart.key === selectedMetric) ??
    growthCharts.find((chart) => chart.key === defaultGrowthMetric) ??
    growthCharts[0];
  const categoryChart =
    focusAreaKey === 'all'
      ? pickCategoryChart(data, focusChart?.key ?? '')
      : chartsWithData.find((chart) => chart.key === focusAreaKey) ?? pickCategoryChart(data, focusChart?.key ?? '');
  const engagementChart = pickEngagementChart(data, focusChart?.key);
  const progressPoints = deriveProgressChart(data);
  const progressTotal = sumPoints(progressPoints);
  const completed = progressPoints.find((point) => point.label.toLowerCase().includes('complete'))?.value ?? 0;
  const completionRate = progressTotal > 0 ? Math.round((completed / progressTotal) * 100) : 0;
  const demoChart = chartsWithData.find((chart) => chart.key === demoKey) ?? chartsWithData[0];
  const demoSorted = [...(demoChart?.data ?? [])].sort((left, right) => right.value - left.value);
  const demoTop = demoSorted[0];
  const demoTotal = sumPoints(demoSorted);
  const demoShare = demoTop && demoTotal > 0 ? Math.round((demoTop.value / demoTotal) * 100) : 0;
  const heroStats = data.cards.slice(0, 4);
  const primaryCount =
    statByKey(data.cards, ['learner', 'student', 'enrollment'])?.value ??
    statByKey(data.cards, ['course'])?.value ??
    data.cards[0]?.value ??
    0;
  const courseCount = statByKey(data.cards, ['course'])?.value ?? 0;
  const institutionCount = statByKey(data.cards, ['institution', 'department'])?.value ?? 0;
  const recentActivity =
    data.recentSections.find((section) => section.key === 'recentActivity') ?? data.recentSections[0];

  return (
    <div className="-m-4 bg-[#eef3f6] p-4 text-[#0c2a3a] sm:-m-6 sm:p-6 lg:-m-8 lg:p-7">
      <div className="mx-auto max-w-[1320px]">
        <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-[#e6edf1] bg-[#eef3f6]/85 px-4 py-3 shadow-sm backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7">
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 items-start gap-6">
              <div className="flex flex-col">
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-auto min-h-[36px] justify-start gap-2 rounded-[11px] border-[#e6edf1] bg-white px-3 py-1.5 text-left font-semibold text-[#475a66]">
                        {dateRange?.from ? new Date(dateRange.from).toLocaleDateString() : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(d: Date | undefined) => {
                          setDateRange((prev) => ({ from: d ?? undefined, to: prev?.to }));
                        }}
                        numberOfMonths={1}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-auto min-h-[36px] justify-start gap-2 rounded-[11px] border-[#e6edf1] bg-white px-3 py-1.5 text-left font-semibold text-[#475a66]">
                        {dateRange?.to ? new Date(dateRange.to).toLocaleDateString() : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.to}
                        onSelect={(d: Date | undefined) => {
                          setDateRange((prev) => ({ from: prev?.from, to: d ?? undefined }));
                        }}
                        numberOfMonths={1}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-[11px] border border-[#e6edf1] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#475a66] shadow-sm">
                      {pieCharts.find((c) => c.key === focusAreaKey)?.label ?? 'All categories'}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => setFocusAreaKey('all')}>All categories</DropdownMenuItem>
                      {pieCharts.map((chart) => (
                        <DropdownMenuItem key={chart.key} onSelect={() => setFocusAreaKey(chart.key)}>
                          {chart.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-[11px] border border-[#e6edf1] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#475a66] shadow-sm">
                      {data.meta?.institution ? data.meta.institution : 'All institutions'}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => {}}>All institutions</DropdownMenuItem>
                      {(data.meta?.institutions ?? []).map((inst: any) => (
                        <DropdownMenuItem key={inst.id} onSelect={() => {}}>{inst.name}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-[11px] border border-[#e6edf1] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#475a66] shadow-sm">
                      {growthCharts.find((c) => c.key === selectedMetric)?.label ?? (growthCharts[0]?.label ?? 'Select metric')}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {growthCharts.length ? (
                        growthCharts.map((chart) => (
                          <DropdownMenuItem key={chart.key} onSelect={() => setSelectedMetric(chart.key)}>
                            {chart.label}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem>No charts</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="ml-auto flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => downloadReport(data)}
                  className="inline-flex items-center gap-2 rounded-[11px] bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download report
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="relative mb-5 overflow-hidden rounded-[26px] bg-gradient-to-r from-[#0a4f7a] via-[#1DA1F2] to-[#5cb8f7] p-7 text-white shadow-none">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/85">
              {data.meta.badge || 'Platform-wide impact'}
            </p>
            <p className="mt-2 max-w-3xl text-[23px] font-bold leading-snug text-white">
              {buildHeroSummary(data, primaryCount, courseCount, institutionCount)}
            </p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.key}>
                  <div
                    className={cn(
                      'text-[34px] font-extrabold leading-none tracking-[-0.02em]',
                      oazisDisplayFontClass,
                    )}
                  >
                    {formatNumber(stat.value)}
                  </div>
                  <div className="mt-1.5 text-sm text-white/90">{stat.label}</div>
                  <div className="mt-1.5 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11.5px] font-semibold">
                    {deriveStatDetail(stat, data.cards)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <OazisCard className="mb-[18px]">
          <CardHead
            title="Growth & Impact Over Time"
            subtitle="Tap a metric to focus · switch the view on the right"
            action={<ChartTypeToggle chartType={chartType} onChange={setChartType} />}
          />
          <div className="mb-4 flex flex-wrap gap-1.5">
            {growthCharts.map((chart) => (
              <MetricTab
                key={chart.key}
                label={chart.label}
                value={formatNumber(sumPoints(chart.data))}
                active={selectedMetric === chart.key}
                onClick={() => setSelectedMetric(chart.key)}
              />
            ))}
          </div>
          <div className="h-[300px] w-full">
            <FocusChart chart={focusChart} type={chartType} dateStart={dateStart} dateEnd={dateEnd} />
          </div>
        </OazisCard>

        <div className="mb-[18px] grid gap-[18px] xl:grid-cols-[1.4fr_1fr]">
          <OazisCard>
            <CardHead title="Learning progress" subtitle="Where enrolled learners stand" />
            <div className="grid gap-5 md:grid-cols-[200px_1fr] md:items-center">
              <DonutChart
                points={progressPoints}
                center={
                  <div>
                    <div className={cn('text-[32px] font-extrabold text-[#1DA1F2]', oazisDisplayFontClass)}>
                      {completionRate}%
                    </div>
                    <div className="text-[11.5px] font-semibold text-[#8aa0ad]">completed</div>
                  </div>
                }
              />
              <Ranking points={progressPoints} />
            </div>
          </OazisCard>

          <OazisCard>
            <CardHead
              title={categoryChart?.label ?? 'Focus Areas'}
              subtitle="Enrollments by category"
            />
            <DonutChart points={categoryChart?.data ?? []} />
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {(categoryChart?.data ?? []).slice(0, 8).map((point, index) => (
                <div key={point.label} className="flex items-center gap-2 text-[12.5px] font-medium text-[#475a66]">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: getChartColor(index) }} />
                  {normalizeLabel(point.label)} · {formatNumber(point.value)}
                </div>
              ))}
            </div>
          </OazisCard>
        </div>

        <OazisCard className="mb-[18px] bg-gradient-to-b from-white to-[#f6fafd]">
          <CardHead title="Who We're Reaching: Demographics Explorer" subtitle="Pick a lens to see the top learner profile breakdown" />
          <div className="mb-5 flex flex-wrap gap-2">
            {chartsWithData.map((chart, index) => {
              const icons = [MapPin, Briefcase, GraduationCap, Users];
              const Icon = icons[index % icons.length];
              return (
                <button
                  key={chart.key}
                  type="button"
                  onClick={() => setDemoKey(chart.key)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border border-[#e6edf1] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#475a66]',
                    demoChart?.key === chart.key && 'border-[#0c2a3a] bg-[#0c2a3a] text-white',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {chart.label}
                </button>
              );
            })}
          </div>
          <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
            <div className="relative h-[230px]">
              <DonutChart
                points={demoChart?.data ?? []}
                center={
                  <div className="px-6">
                    <div className={cn('text-[30px] font-extrabold text-[#1DA1F2]', oazisDisplayFontClass)}>
                      {demoShare}%
                    </div>
                    <div className="mt-0.5 text-xs font-semibold leading-tight text-[#475a66]">
                      {normalizeLabel(demoTop?.label ?? 'No data')}
                    </div>
                    <div className="mt-1.5 text-[10.5px] text-[#8aa0ad]">largest group</div>
                  </div>
                }
              />
            </div>
            <Ranking points={demoChart?.data ?? []} />
          </div>
          <div className="mt-5 flex items-start gap-2.5 rounded-[14px] border border-[#cae8fb] bg-[#e3f3fd] px-4 py-3 text-[13px] leading-6 text-[#0c5a8a]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{buildDemoInsight(demoChart?.data ?? [])}</span>
          </div>
        </OazisCard>

        <div className="grid gap-[18px] xl:grid-cols-2">
          <OazisCard>
            <CardHead title="Engagement This Week" subtitle="Daily active sessions" />
            <div className="relative h-[200px]">
              <FocusChart
                chart={engagementChart}
                type="line"
                dateStart={dateStart}
                dateEnd={dateEnd}
                compact
              />
            </div>
          </OazisCard>

          <OazisCard>
            <CardHead title="Recent Activity" subtitle="Latest learner milestones" />
            {recentActivity?.items.length ? (
              recentActivity.items.slice(0, 5).map((item) => <ActivityRow key={item.id} item={item} />)
            ) : (
              <p className="py-8 text-center text-sm text-[#8aa0ad]">No activity yet</p>
            )}
          </OazisCard>
        </div>

        {data.quickActions.length ? (
          <OazisCard className="mt-[18px]">
            <CardHead title="Quick Actions" subtitle="Common dashboard actions" />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.quickActions.map((action) => (
                <Link
                  key={action.key}
                  href={action.href}
                  className="rounded-[12px] border border-[#e6edf1] bg-[#f6fafd] px-4 py-3 text-sm font-semibold text-[#0c2a3a] transition-colors hover:border-[#1DA1F2] hover:text-[#1DA1F2]"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </OazisCard>
        ) : null}
      </div>
    </div>
  );
}
