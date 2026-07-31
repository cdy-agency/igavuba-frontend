'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { DashboardChart } from '@/types/dashboard.types';
import {
  BAR_LEGEND_LABELS,
  CHART_SUBTITLES,
  DONUT_CHART_KEYS,
  getChartColor,
} from '@/lib/dashboard-chart-theme';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  chart: DashboardChart;
  className?: string;
}

interface PreparedChart extends DashboardChart {
  isDonut: boolean;
  legendItems: Array<{ label: string; color: string }>;
}

function formatStatusLabel(label: string): string {
  return label
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function prepareChart(chart: DashboardChart): PreparedChart {
  let data = chart.data;
  let isDonut = DONUT_CHART_KEYS.has(chart.key);

  if (chart.key === 'courseCompletionRate' || chart.key === 'courseCompletion') {
    const average = data[0]?.value ?? 0;
    if (data.length <= 1) {
      data = [
        { label: 'Completed', value: average },
        { label: 'Ongoing', value: Math.max(0, 100 - average) },
      ];
      isDonut = true;
    }
  }

  if (chart.key === 'quizPassRate') {
    data = data.filter((point) => point.label !== 'Pass Rate %');
    isDonut = true;
  }

  const legendItems = data.map((point, index) => ({
    label: formatStatusLabel(point.label),
    color: getChartColor(index),
  }));

  return { ...chart, data, isDonut, legendItems };
}

function ChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <ul className="flex min-w-[120px] flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2.5 text-sm">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

function BarChartLegend({ label }: { label: string }) {
  return (
    <div className="mt-2 flex justify-end">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-2.5 w-2.5 rounded-sm bg-[#4285F4]" />
        <span>{label}</span>
      </div>
    </div>
  );
}

function renderCircularChart(prepared: PreparedChart) {
  const { data, isDonut } = prepared;

  return (
    <PieChart>
      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
      <Pie
        data={data}
        dataKey="value"
        nameKey="label"
        innerRadius={isDonut ? 52 : 0}
        outerRadius={78}
        paddingAngle={isDonut ? 2 : 0}
        stroke="#fff"
        strokeWidth={2}
      >
        {data.map((entry, index) => (
          <Cell key={entry.label} fill={getChartColor(index)} />
        ))}
      </Pie>
    </PieChart>
  );
}

function renderLineChart(data: PreparedChart['data']) {
  const axisTick = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' };

  return (
    <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
      <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="4 4" />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        tick={axisTick}
        tickMargin={8}
        interval="preserveStartEnd"
      />
      <YAxis
        allowDecimals={false}
        tickLine={false}
        axisLine={false}
        tick={axisTick}
        width={36}
      />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Line
        type="monotone"
        dataKey="value"
        stroke="#4285F4"
        strokeWidth={2.5}
        dot={{ r: 4, fill: '#4285F4', strokeWidth: 0 }}
        activeDot={{ r: 5 }}
      />
    </LineChart>
  );
}

function renderBarChart(data: PreparedChart['data'], multiColor: boolean) {
  const axisTick = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' };
  const showXLabels = data.length <= 6;

  return (
    <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: showXLabels ? 20 : 0 }}>
      <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="4 4" />
      {showXLabels ? (
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          tickMargin={8}
          interval={0}
          angle={data.length > 4 ? -20 : 0}
          textAnchor={data.length > 4 ? 'end' : 'middle'}
          height={data.length > 4 ? 48 : 30}
        />
      ) : (
        <XAxis dataKey="label" hide />
      )}
      <YAxis
        allowDecimals={false}
        tickLine={false}
        axisLine={false}
        tick={axisTick}
        width={40}
      />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={42}>
        {data.map((entry, index) => (
          <Cell
            key={entry.label}
            fill={multiColor ? getChartColor(index) : '#4285F4'}
          />
        ))}
      </Bar>
    </BarChart>
  );
}

export function ChartCard({ chart, className }: ChartCardProps) {
  const prepared = prepareChart(chart);
  const subtitle = CHART_SUBTITLES[chart.key];
  const isEmpty = prepared.data.length === 0;
  const isCircular = chart.type === 'pie' || prepared.isDonut;
  const multiColorBar =
    chart.key === 'enrollmentPerCourse' ||
    chart.key === 'learningProgress' ||
    chart.key === 'lecturerActivity';

  const config = Object.fromEntries(
    prepared.data.map((point, index) => [
      point.label,
      { label: point.label, color: getChartColor(index) },
    ]),
  );

  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border border-border/50 bg-card p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{chart.label}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
          No data yet
        </div>
      ) : isCircular ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:items-center sm:justify-start">
          <ChartContainer config={config} className="mx-auto h-[180px] w-[180px] sm:mx-0">
            {renderCircularChart(prepared)}
          </ChartContainer>
          <ChartLegend items={prepared.legendItems} />
        </div>
      ) : (
        <>
          <ChartContainer
            config={config}
            className={cn('w-full', chart.type === 'line' ? 'h-[220px]' : 'h-[240px]')}
          >
            {chart.type === 'line'
              ? renderLineChart(prepared.data)
              : renderBarChart(prepared.data, multiColorBar)}
          </ChartContainer>
          {chart.type === 'bar' ? (
            <BarChartLegend label={BAR_LEGEND_LABELS[chart.key] ?? 'value'} />
          ) : null}
        </>
      )}
    </div>
  );
}
