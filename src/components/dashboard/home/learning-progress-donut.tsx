'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { MyCourseProgressItem } from '@/types/progress';
import { getChartColor } from '@/lib/dashboard-chart-theme';
import { cn } from '@/lib/utils';

interface LearningProgressDonutProps {
  courses: MyCourseProgressItem[];
  className?: string;
}

export function LearningProgressDonut({ courses, className }: LearningProgressDonutProps) {
  const completedLessons = courses.reduce((sum, course) => sum + course.completedLessons, 0);
  const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);
  const inProgressLessons = Math.max(0, totalLessons - completedLessons);

  const overall =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const chartData =
    totalLessons > 0
      ? [
          { label: 'Completed', value: completedLessons },
          { label: 'Remaining', value: inProgressLessons },
        ].filter((entry) => entry.value > 0)
      : [{ label: 'No lessons', value: 1 }];

  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Learning progress</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Overall completion across enrolled courses</p>
      </div>

      {courses.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Enroll in a course to track progress.</p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={getChartColor(index)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums text-foreground">{overall}%</span>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Overall</span>
            </div>
          </div>

          <ul className="w-full flex-1 space-y-2 text-sm">
            <li className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Completed lessons
              </span>
              <span className="font-semibold tabular-nums text-foreground">{completedLessons}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                Remaining lessons
              </span>
              <span className="font-semibold tabular-nums text-foreground">{inProgressLessons}</span>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-lg bg-primary/5 px-3 py-2 text-primary">
              <span className="font-medium">Enrolled courses</span>
              <span className="font-semibold tabular-nums">{courses.length}</span>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
