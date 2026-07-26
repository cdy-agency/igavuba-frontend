'use client';

import { useState } from 'react';
import { createCourseSkill } from '@/api/course-skill.api';
import { createCourseTool } from '@/api/course-tool.api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  AlignLeft,
  BookOpen,
  Clock,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  Link2,
  Loader2,
  Lock,
  Settings2,
  Shield,
  FolderOpen,
  Tag,
  User,
  Wrench,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import TiptapEditor from '@/components/editor/TiptapEditor';
import {
  CourseFormField,
  courseFormInputClass,
  courseFormSelectTriggerClass,
} from '@/components/dashboard/courses/course-form-field';
import { CourseFormMediaField } from '@/components/dashboard/courses/course-form-media-field';
import { courseFormSchema, type CourseFormValues } from '@/schema/course.schema';
import { CourseAccessType, CourseLevel, type Course } from '@/types/course';
import {
  COURSE_LANGUAGE_OPTIONS,
  isCourseLanguageCode,
} from '@/types/course-language';
import {
  COURSE_ACCESS_TYPE_LABELS,
  COURSE_LEVEL_LABELS,
  getCourseStatusClassName,
  requiresPublicPrice,
} from '@/lib/course-utils';
import { CourseCatalogVisibilityNotice } from '@/components/dashboard/courses/course-catalog-visibility-notice';
import { CourseLifecycleStatus } from '@/types/course-status';
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';
import { useDepartmentsList } from '@/hooks/use-departments';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { CourseSkillsManager } from '@/components/dashboard/courses/course-skills-manager';
import { CourseToolsManager } from '@/components/dashboard/courses/course-tools-manager';
import { CourseCategorySelect } from '@/components/dashboard/courses/course-category-select';
import { CourseLecturerSelect } from '@/components/dashboard/courses/course-lecturer-select';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/contexts/dashboard-context';
import { hasAnyRole } from '@/lib/role-utils';
import { UserRole } from '@/types/enum';

interface CourseFormProps {
  mode: 'create' | 'edit';
  course?: Course;
  readOnly?: boolean;
  onSuccess?: (course: Course) => void;
  onCancel?: () => void;
}

const defaultValues: CourseFormValues = {
  title: '',
  shortDescription: undefined,
  description: undefined,
  thumbnail: undefined,
  previewVideo: undefined,
  level: undefined,
  language: undefined,
  estimatedHours: undefined,
  accessType: CourseAccessType.INTERNAL_ONLY,
  publicPrice: undefined,
  departmentId: undefined,
  lecturerId: undefined,
  categoryIds: [],
};

function mapCourseToFormValues(course: Course): CourseFormValues {
  return {
    title: course.title,
    shortDescription: course.shortDescription ?? undefined,
    description: course.description ?? undefined,
    thumbnail: course.thumbnail ?? undefined,
    previewVideo: course.previewVideo ?? undefined,
    level: course.level ?? undefined,
    language: isCourseLanguageCode(course.language) ? course.language : undefined,
    estimatedHours: course.estimatedHours ?? undefined,
    accessType: course.accessType,
    publicPrice: course.publicPrice ?? undefined,
    departmentId: course.departmentId ?? undefined,
    lecturerId: course.lecturerId ?? undefined,
    categoryIds: course.categories?.map((entry) => entry.category.id) ?? [],
  };
}

function accessTypeHint(accessType: CourseAccessType): string {
  switch (accessType) {
    case CourseAccessType.INTERNAL_ONLY:
      return 'Only learners enrolled or assigned by your institution can access this course.';
    case CourseAccessType.PUBLIC_FREE:
      return 'Anyone can enroll for free. Published courses appear on / and /courses.';
    case CourseAccessType.PUBLIC_PAID:
      return 'Anyone can purchase and enroll. Published courses appear on / and /courses.';
    case CourseAccessType.HYBRID:
      return 'Institution learners get internal access; external learners can also enroll publicly.';
    default:
      return '';
  }
}

function CourseFormSidebarHeading({
  icon: Icon,
  title,
}: {
  icon: typeof Settings2;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 pb-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <h2 className="text-[13px] font-semibold tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

export function CourseForm({ mode, course, readOnly = false, onSuccess, onCancel }: CourseFormProps) {
  const { role } = useDashboard();
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;
  const isLecturer = role === UserRole.LECTURER;
  const canSelectLecturer =
    hasAnyRole(role, [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN]) &&
    (mode === 'create' || !readOnly);
  const [pendingSkills, setPendingSkills] = useState<string[]>([]);
  const [pendingTools, setPendingTools] = useState<string[]>([]);
  const [isSavingSkillsTools, setIsSavingSkillsTools] = useState(false);

  const authReady = useAuthReady();
  const { data: departmentData } = useDepartmentsList(undefined, authReady);
  const departments = departmentData?.data ?? [];

  const createCourseMutation = useCreateCourse();
  const updateIdentifier = course?.slug ?? course?.id ?? '';
  const updateCourseMutation = useUpdateCourse(updateIdentifier);
  const isSubmitting =
    mode === 'create'
      ? createCourseMutation.isPending || isSavingSkillsTools
      : updateCourseMutation.isPending;
  const isFormDisabled = isSubmitting || readOnly;

  const initialValues =
    mode === 'edit' && course ? mapCourseToFormValues(course) : defaultValues;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialValues,
    values: mode === 'edit' && course ? mapCourseToFormValues(course) : undefined,
  });

  const accessType = form.watch('accessType');
  const showPublicPrice = requiresPublicPrice(accessType);
  const isPublished = course?.status === CourseLifecycleStatus.PUBLISHED;

  const persistPendingSkillsAndTools = async (courseId: string) => {
    if (pendingSkills.length === 0 && pendingTools.length === 0) {
      return;
    }

    setIsSavingSkillsTools(true);

    try {
      const skillResults = await Promise.allSettled(
        pendingSkills.map((name) => createCourseSkill(courseId, { name })),
      );
      const toolResults = await Promise.allSettled(
        pendingTools.map((name) => createCourseTool(courseId, { name })),
      );

      const skillSuccessCount = skillResults.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const toolSuccessCount = toolResults.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const skillFailureCount = skillResults.length - skillSuccessCount;
      const toolFailureCount = toolResults.length - toolSuccessCount;

      if (skillSuccessCount === 1) {
        toast.success('Skill added successfully.');
      } else if (skillSuccessCount > 1) {
        toast.success(`${skillSuccessCount} skills added successfully.`);
      }

      if (toolSuccessCount === 1) {
        toast.success('Tool added successfully.');
      } else if (toolSuccessCount > 1) {
        toast.success(`${toolSuccessCount} tools added successfully.`);
      }

      if (skillFailureCount > 0) {
        toast.error(
          skillFailureCount === 1
            ? 'Failed to add skill.'
            : `Failed to add ${skillFailureCount} skills.`,
        );
      }

      if (toolFailureCount > 0) {
        toast.error(
          toolFailureCount === 1
            ? 'Failed to add tool.'
            : `Failed to add ${toolFailureCount} tools.`,
        );
      }
    } finally {
      setIsSavingSkillsTools(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (mode === 'create') {
      const response = await createCourseMutation.mutateAsync(values);
      await persistPendingSkillsAndTools(response.data.id);
      onSuccess?.(response.data);
      return;
    }

    if (!course) return;
    const response = await updateCourseMutation.mutateAsync(values);
    onSuccess?.(response.data);
  });

  return (
    <form
      key={mode === 'edit' && course ? course.slug : 'create'}
      onSubmit={readOnly ? (event) => event.preventDefault() : onSubmit}
      className="space-y-6"
    >
      <fieldset disabled={isFormDisabled} className="m-0 min-w-0 space-y-6 border-0 p-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18.5rem] xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
        {/* Left column — primary content */}
        <div className="space-y-6">
          <CourseFormField
            icon={BookOpen}
            label="Course Title"
            required
            error={form.formState.errors.title?.message}
          >
            <Input
              id="course-title"
              placeholder="e.g. Enter course title"
              disabled={isSubmitting}
              className={courseFormInputClass}
              {...form.register('title')}
            />
          </CourseFormField>

          {mode === 'edit' && course ? (
            <CourseFormField
              icon={Link2}
              label="Course URL Slug"
              hint={`Preview: /courses/${course.slug}`}
            >
              <div className="flex items-center gap-2">
                <Input
                  value={course.slug}
                  readOnly
                  disabled
                  className={cn(courseFormInputClass, 'bg-muted/25')}
                />
                <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  Auto
                </span>
              </div>
            </CourseFormField>
          ) : (
            <CourseFormField
              icon={Link2}
              label="Course URL Slug"
              hint="Slug is generated automatically from the title when you save."
            >
              <Input
                value="your-slug-here"
                readOnly
                disabled
                className={cn(courseFormInputClass, 'bg-muted/25 text-muted-foreground')}
              />
            </CourseFormField>
          )}

          <CourseFormField icon={FileText} label="Short Description" optional>
            <Textarea
              id="course-short-description"
              placeholder="What will students learn in this course?"
              rows={3}
              disabled={isSubmitting}
              className="min-h-[5.5rem] resize-y border-border/80 text-[13px] shadow-none placeholder:text-muted-foreground/55"
              {...form.register('shortDescription')}
            />
          </CourseFormField>

          <CourseFormField icon={AlignLeft} label="Detailed Description" optional>
            <div className="overflow-hidden rounded-md border border-border/80 shadow-sm">
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <TiptapEditor
                    name="course-description"
                    content={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="Write the full course description..."
                    stickyToolbar={false}
                  />
                )}
              />
            </div>
          </CourseFormField>

          <Controller
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <CourseFormMediaField
                label="Thumbnail"
                accept="image/*"
                kind="image"
                optional
                hint="Recommended for course listings and cards."
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />

          <Controller
            control={form.control}
            name="previewVideo"
            render={({ field }) => (
              <CourseFormMediaField
                label="Preview Video"
                accept="video/*"
                kind="video"
                optional
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />

          <div className="space-y-3 rounded-md border border-border/80 bg-muted/10 p-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary">
                <Zap className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <h3 className="text-[13px] font-semibold tracking-tight text-foreground">Skills</h3>
            </div>
            <CourseSkillsManager
              mode={mode}
              courseId={course?.id}
              initialSkills={course?.skills}
              pendingSkills={pendingSkills}
              onPendingSkillsChange={setPendingSkills}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3 rounded-md border border-border/80 bg-muted/10 p-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary">
                <Wrench className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <h3 className="text-[13px] font-semibold tracking-tight text-foreground">Tools</h3>
            </div>
            <CourseToolsManager
              mode={mode}
              courseId={course?.id}
              initialTools={course?.tools}
              pendingTools={pendingTools}
              onPendingToolsChange={setPendingTools}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Right column — settings sidebar */}
        <aside className="lg:sticky lg:top-4 lg:z-[1] lg:self-start">
          <div className="space-y-4 rounded-lg border border-border/80 bg-muted/10 p-4 shadow-sm">
            <CourseFormSidebarHeading icon={Settings2} title="Course Settings" />

          {canSelectLecturer ? (
            <CourseFormField
              icon={User}
              label="Lecturer"
              optional={!isSuperAdmin}
              hint={
                isSuperAdmin
                  ? 'Select a lecturer to assign course ownership and link the course to their institution.'
                  : 'Select a lecturer from your institution — they will become the course owner.'
              }
            >
              <Controller
                control={form.control}
                name="lecturerId"
                render={({ field }) => (
                  <CourseLecturerSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isFormDisabled}
                    placeholder="Select lecturer"
                  />
                )}
              />
            </CourseFormField>
          ) : null}

          {isLecturer && mode === 'create' ? (
            <CourseFormField
              icon={User}
              label="Course owner"
              optional
              hint="You will be assigned as the owner when this course is saved."
            >
              <p className="rounded-md border border-border/80 bg-muted/20 px-3 py-2 text-[13px] text-muted-foreground">
                You (lecturer)
              </p>
            </CourseFormField>
          ) : null}

          <CourseFormField icon={GraduationCap} label="Level" optional>
            <Controller
              control={form.control}
              name="level"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as CourseLevel)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={courseFormSelectTriggerClass}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CourseLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {COURSE_LEVEL_LABELS[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </CourseFormField>

          <CourseFormField icon={FolderOpen} label="Category">
            <Controller
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <CourseCategorySelect
                  value={field.value ?? []}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              )}
            />
          </CourseFormField>

          <CourseFormField
            icon={Globe}
            label="Language"
            optional
          >
            <Controller
              control={form.control}
              name="language"
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={courseFormSelectTriggerClass}>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </CourseFormField>

          <CourseFormField
            icon={Clock}
            label="Duration"
            optional
            hint="Estimated time to complete the course. Examples: 2 hours, 4 weeks."
            error={form.formState.errors.estimatedHours?.message}
          >
            <Input
              id="course-estimated-hours"
              type="text"
              placeholder="e.g. 2 hours, 4 weeks"
              disabled={isSubmitting}
              className={courseFormInputClass}
              {...form.register('estimatedHours')}
            />
          </CourseFormField>

          {mode === 'edit' && course ? (
            <CourseFormField icon={Tag} label="Status" optional>
              <Badge
                variant="outline"
                className={cn(
                  'h-9 w-full justify-center px-3 text-[12px] font-semibold',
                  getCourseStatusClassName(course.status),
                )}
              >
                {getCourseLifecycleLabel(course.status)}
              </Badge>
            </CourseFormField>
          ) : null}

          {mode === 'edit' && course ? (
            <CourseCatalogVisibilityNotice course={course} />
          ) : null}

          <CourseFormField
            icon={Shield}
            label="Access Type"
            hint={
              isPublished
                ? 'Access type changes apply immediately on published courses.'
                : 'Choose who can access this course once it is published.'
            }
          >
            <Controller
              control={form.control}
              name="accessType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const next = value as CourseAccessType;
                    field.onChange(next);
                    if (next === CourseAccessType.PUBLIC_FREE) {
                      form.setValue('publicPrice', undefined);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={courseFormSelectTriggerClass}>
                    <SelectValue placeholder="Select access type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CourseAccessType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {COURSE_ACCESS_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {accessTypeHint(accessType)}
            </p>
            {form.formState.errors.accessType ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.accessType.message}
              </p>
            ) : null}
          </CourseFormField>

          {showPublicPrice ? (
            <CourseFormField
              icon={DollarSign}
              label="Public Price"
              error={form.formState.errors.publicPrice?.message}
            >
              <Input
                id="course-public-price"
                type="number"
                min={0}
                step="0.01"
                placeholder="49.99"
                disabled={isSubmitting}
                className={courseFormInputClass}
                {...form.register('publicPrice')}
              />
            </CourseFormField>
          ) : null}
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-5">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        {!readOnly ? (
          <Button type="submit" size="sm" className="h-8 px-4 text-xs" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {mode === 'create'
                  ? isSavingSkillsTools
                    ? 'Saving skills and tools...'
                    : 'Creating...'
                  : 'Saving...'}
              </>
            ) : mode === 'create' ? (
              'Create Course'
            ) : (
              'Save Changes'
            )}
          </Button>
        ) : null}
      </div>
      </fieldset>
    </form>
  );
}
