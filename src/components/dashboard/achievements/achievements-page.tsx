'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Loader2,
  Target,
  Trophy,
} from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { RoleGuard } from '@/guards/role-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyAchievements } from '@/hooks/use-achievements';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { UserRole } from '@/types/enum';
import type {
  AchievementAssessmentItem,
  AchievementAssessmentStatus,
  CourseAchievement,
} from '@/types/achievements.types';
import { cn } from '@/lib/utils';

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
}

function formatScore(item: AchievementAssessmentItem) {
  if (item.percentage !== null) {
    return formatPercent(item.percentage);
  }
  if (item.score !== null && item.maxScore !== null) {
    return `${item.score}/${item.maxScore}`;
  }
  if (item.score !== null) {
    return String(item.score);
  }
  return '—';
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusLabel(status: AchievementAssessmentStatus) {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not started';
    case 'IN_PROGRESS':
      return 'In progress';
    case 'AWAITING_REVIEW':
      return 'Awaiting review';
    case 'GRADED':
      return 'Graded';
    case 'PUBLISHED':
      return 'Published';
    default:
      return 'Submitted';
  }
}

function StatusBadge({
  status,
  passed,
}: {
  status: AchievementAssessmentStatus;
  passed: boolean | null;
}) {
  if (status === 'PUBLISHED' && passed === true) {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        Passed
      </Badge>
    );
  }

  if (status === 'PUBLISHED' && passed === false) {
    return (
      <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/10">
        Failed
      </Badge>
    );
  }

  if (status === 'AWAITING_REVIEW' || status === 'GRADED') {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        {statusLabel(status)}
      </Badge>
    );
  }

  if (status === 'IN_PROGRESS') {
    return (
      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
        In progress
      </Badge>
    );
  }

  if (status === 'NOT_STARTED') {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Not started
      </Badge>
    );
  }

  return <Badge variant="outline">{statusLabel(status)}</Badge>;
}

function getBarColor(value: number | null, variant: 'grade' | 'progress') {
  if (value === null) {
    return 'bg-muted-foreground/30';
  }

  if (variant === 'progress') {
    return value >= 100 ? 'bg-emerald-500' : 'bg-primary';
  }

  return value >= 70 ? 'bg-emerald-500' : 'bg-primary';
}

function CompactScoreBar({
  label,
  value,
  variant = 'grade',
}: {
  label: string;
  value: number | null;
  variant?: 'grade' | 'progress';
}) {
  const display = value ?? 0;
  const hasValue = value !== null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-foreground">
          {hasValue ? `${display}%` : '—'}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            getBarColor(value, variant),
          )}
          style={{ width: hasValue ? `${Math.min(display, 100)}%` : '0%' }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/40 px-2 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function CourseMetricsPanel({ course }: { course: CourseAchievement }) {
  const formula = buildGradeFormula(course);

  return (
    <div className="w-[200px] shrink-0 self-end sm:self-start">
      <div className="rounded-lg border border-border/60 bg-background/80 p-3 shadow-sm">
        <div className="space-y-3">
          <CompactScoreBar
            label="Progress"
            value={course.enrollment.progress}
            variant="progress"
          />
          <CompactScoreBar
            label="Grade"
            value={course.performance.overallAverage}
            variant="grade"
          />
        </div>

        {formula ? (
          <p className="mt-2.5 border-t border-border/60 pt-2.5 text-[10px] leading-snug text-muted-foreground">
            {formula}
          </p>
        ) : null}

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-border/60 pt-2.5">
          <MiniStat label="Quiz" value={formatPercent(course.performance.quizAverage)} />
          <MiniStat label="Assign" value={formatPercent(course.performance.assignmentAverage)} />
          <MiniStat label="Exam" value={formatPercent(course.performance.examAverage)} />
          <MiniStat
            label="Done"
            value={`${course.assessmentCounts.completed}/${course.assessmentCounts.total}`}
          />
        </div>

        <Button variant="outline" size="sm" className="mt-3 h-8 w-full text-xs" asChild>
          <Link href={`/learn/${course.slug}`}>Continue</Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryStatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  hint?: string;
  accent?: 'primary' | 'emerald' | 'amber' | 'blue';
}) {
  const accentClasses = {
    primary: 'from-primary/15 to-primary/5 text-primary',
    emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600',
    amber: 'from-amber-500/15 to-amber-500/5 text-amber-600',
    blue: 'from-blue-500/15 to-blue-500/5 text-blue-600',
  }[accent ?? 'primary'];

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br',
            accentClasses,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AssessmentTable({ items }: { items: AchievementAssessmentItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        No assessments in this category yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full text-sm">
        <thead className="border-b bg-muted/30 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Assessment</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Pass mark</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-medium">{item.title}</td>
              <td className="px-4 py-3 tabular-nums">{formatScore(item)}</td>
              <td className="px-4 py-3 tabular-nums text-muted-foreground">
                {item.passingScore}%
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} passed={item.passed} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(item.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildGradeFormula(course: CourseAchievement) {
  const scored = [
    ...course.assessments.quizzes,
    ...course.assessments.assignments,
    ...course.assessments.exams,
  ].filter((item) => item.percentage !== null);

  if (scored.length === 0) {
    return null;
  }

  const parts = scored.map((item) => `${item.percentage}%`);
  const total = scored.reduce((sum, item) => sum + (item.percentage ?? 0), 0);
  const average = Math.round(total / scored.length);

  return `Average: ${parts.join(' + ')} ÷ ${scored.length} = ${average}%`;
}

function CourseAchievementCard({ course }: { course: CourseAchievement }) {
  const defaultTab =
    course.assessments.quizzes.length > 0
      ? 'quizzes'
      : course.assessments.assignments.length > 0
        ? 'assignments'
        : 'exams';

  return (
    <article className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="border-b bg-gradient-to-r from-muted/30 to-transparent px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="relative h-16 w-[72px] shrink-0 overflow-hidden rounded-lg bg-muted sm:h-[4.5rem] sm:w-20">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {course.institution.name}
              </p>
              <h2 className="mt-0.5 text-base font-semibold leading-snug sm:text-lg">{course.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {course.enrollment.isCompleted ? (
                  <Badge className="h-5 border-emerald-200 bg-emerald-50 px-2 text-[10px] text-emerald-700 hover:bg-emerald-50">
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="h-5 px-2 text-[10px]">
                    {course.enrollment.progress}% progress
                  </Badge>
                )}
                {course.performance.passed === true ? (
                  <Badge className="h-5 border-emerald-200 bg-emerald-50 px-2 text-[10px] text-emerald-700 hover:bg-emerald-50">
                    Passing
                  </Badge>
                ) : course.performance.passed === false ? (
                  <Badge
                    variant="destructive"
                    className="h-5 bg-destructive/10 px-2 text-[10px] text-destructive hover:bg-destructive/10"
                  >
                    Below pass
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <CourseMetricsPanel course={course} />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-4 h-auto flex-wrap justify-start gap-1 bg-muted/40 p-1">
            <TabsTrigger value="quizzes" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Quizzes ({course.assessments.quizzes.length})
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Assignments ({course.assessments.assignments.length})
            </TabsTrigger>
            <TabsTrigger value="exams" className="gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" />
              Exams ({course.assessments.exams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes">
            <AssessmentTable items={course.assessments.quizzes} />
          </TabsContent>
          <TabsContent value="assignments">
            <AssessmentTable items={course.assessments.assignments} />
          </TabsContent>
          <TabsContent value="exams">
            <AssessmentTable items={course.assessments.exams} />
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
}

function AchievementsContent() {
  const authReady = useAuthReady();
  const { data, isPending, isError } = useMyAchievements(authReady);

  if (!authReady || isPending) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-6 py-10 text-center">
        <p className="font-medium text-destructive">Unable to load your achievements.</p>
      </div>
    );
  }

  if (data.courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
        <Trophy className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">No course marks yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Enroll in a course and complete quizzes, assignments, and exams to see your marks here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/my-learning">Go to My Learning</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStatCard
          icon={BookOpen}
          label="Enrolled courses"
          value={String(data.summary.enrolledCourses)}
          accent="blue"
        />
        <SummaryStatCard
          icon={CheckCircle2}
          label="Assessments completed"
          value={`${data.summary.completedAssessments}/${data.summary.totalAssessments}`}
          hint="Quizzes, assignments, and exams"
          accent="primary"
        />
        <SummaryStatCard
          icon={GraduationCap}
          label="Overall grade average"
          value={formatPercent(data.summary.overallAverage)}
          hint="Average of all published assessment scores"
          accent="amber"
        />
        <SummaryStatCard
          icon={Award}
          label="Courses passed"
          value={String(data.summary.coursesPassed)}
          hint="70% overall mark or higher"
          accent="emerald"
        />
      </div>

      <div className="space-y-5">
        {data.courses.map((course) => (
          <CourseAchievementCard key={course.courseId} course={course} />
        ))}
      </div>
    </div>
  );
}

export function AchievementsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.LEARNER]}>
      <div className="space-y-6">
        <PageHeader
          badge="Performance"
          title="Achievements"
          description="Track your marks across quizzes, assignments, exams, and overall course performance."
        />
        <AchievementsContent />
      </div>
    </RoleGuard>
  );
}
