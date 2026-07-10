'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizManagementPage } from '@/components/dashboard/quizzes/quiz-management-page';
import { ExamManagementPage } from '@/components/dashboard/exams/exam-management-page';
import { AssignmentManagementPage } from '@/components/dashboard/assignments/assignment-management-page';

const ASSESSMENT_MANAGER_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
];

export type AssessmentTab = 'quizzes' | 'exams' | 'assignments';

const TAB_ITEMS: { value: AssessmentTab; label: string }[] = [
  { value: 'quizzes', label: 'Quizzes' },
  { value: 'exams', label: 'Exams' },
  { value: 'assignments', label: 'Assignments' },
];

function isAssessmentTab(value: string | null): value is AssessmentTab {
  return value === 'quizzes' || value === 'exams' || value === 'assignments';
}

interface AssessmentsPageProps {
  initialTab?: AssessmentTab;
}

function AssessmentsPageContent({ initialTab }: AssessmentsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab');
    if (isAssessmentTab(tabParam)) {
      return tabParam;
    }
    return initialTab ?? 'quizzes';
  }, [initialTab, searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (!isAssessmentTab(value)) return;
      router.replace(`/dashboard/assessments?tab=${value}`, { scroll: false });
    },
    [router],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Assessments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage quizzes, exams, and assignments across your courses from one place.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
          {TAB_ITEMS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="quizzes" className="mt-0">
          <QuizManagementPage embedded />
        </TabsContent>
        <TabsContent value="exams" className="mt-0">
          <ExamManagementPage embedded />
        </TabsContent>
        <TabsContent value="assignments" className="mt-0">
          <AssignmentManagementPage embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AssessmentsPage(props: AssessmentsPageProps) {
  return (
    <RoleGuard allowedRoles={ASSESSMENT_MANAGER_ROLES}>
      <Suspense
        fallback={
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <AssessmentsPageContent {...props} />
      </Suspense>
    </RoleGuard>
  );
}
