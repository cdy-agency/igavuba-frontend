'use client';

import { useMemo, useState } from 'react';
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
  Sparkles,
  Tag,
  User,
  Wrench,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { CourseAccessType, CourseLevel, type Course, type CourseDepartment } from '@/types/course';
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
import { getCourseLifecycleLabel } from '@/lib/status-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useCreateCourse, useCoursesList, useUpdateCourse } from '@/hooks/use-courses';
import { CourseSkillsManager } from '@/components/dashboard/courses/course-skills-manager';
import { CourseToolsManager } from '@/components/dashboard/courses/course-tools-manager';
import { cn } from '@/lib/utils';

interface CourseFormProps {
  mode: 'create' | 'edit';
  course?: Course;
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
  };
}

function extractDepartments(courses: Course[]): CourseDepartment[] {
  const map = new Map<string, CourseDepartment>();
  for (const item of courses) {
    if (item.department) {
      map.set(item.department.id, item.department);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function isPublicAccessType(accessType: CourseAccessType): boolean {
  return (
    accessType === CourseAccessType.PUBLIC_FREE ||
    accessType === CourseAccessType.PUBLIC_PAID ||
    accessType === CourseAccessType.HYBRID
  );
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

function SidebarToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  icon: typeof Sparkles;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border/70 bg-background p-3">
      <div className="flex min-w-0 gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-[13px] font-semibold leading-none tracking-tight text-foreground">
            {label}
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">{description}</p>
        </div>
      </div>
      <Switch
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5"
      />
    </div>
  );
}

export function CourseForm({ mode, course, onSuccess, onCancel }: CourseFormProps) {
  const [pendingSkills, setPendingSkills] = useState<string[]>([]);
  const [pendingTools, setPendingTools] = useState<string[]>([]);
  const [isSavingSkillsTools, setIsSavingSkillsTools] = useState(false);

  const { data: departmentSource } = useCoursesList({ limit: 100, page: 1 });
  const departments = useMemo(
    () => extractDepartments(departmentSource?.data ?? []),
    [departmentSource],
  );

  const createCourseMutation = useCreateCourse();
  const updateIdentifier = course?.slug ?? course?.id ?? '';
  const updateCourseMutation = useUpdateCourse(updateIdentifier);
  const isSubmitting =
    mode === 'create'
      ? createCourseMutation.isPending || isSavingSkillsTools
      : updateCourseMutation.isPending;

  const initialValues =
    mode === 'edit' && course ? mapCourseToFormValues(course) : defaultValues;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialValues,
    values: mode === 'edit' && course ? mapCourseToFormValues(course) : undefined,
  });

  const accessType = form.watch('accessType');
  const showPublicPrice = requiresPublicPrice(accessType);
  const isPublic = isPublicAccessType(accessType);
  const isFreeCourse = accessType === CourseAccessType.PUBLIC_FREE;

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

  const handlePublicToggle = (checked: boolean) => {
    if (!checked) {
      form.setValue('accessType', CourseAccessType.INTERNAL_ONLY);
      form.setValue('publicPrice', undefined);
      return;
    }
    form.setValue('accessType', CourseAccessType.PUBLIC_FREE);
  };

  const handleFreeToggle = (checked: boolean) => {
    if (checked) {
      form.setValue('accessType', CourseAccessType.PUBLIC_FREE);
      form.setValue('publicPrice', undefined);
      return;
    }
    form.setValue('accessType', CourseAccessType.PUBLIC_PAID);
  };

  return (
    <form
      key={mode === 'edit' && course ? course.slug : 'create'}
      onSubmit={onSubmit}
      className="space-y-6"
    >
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

          {mode === 'edit' && course?.lecturer ? (
            <CourseFormField icon={User} label="Lecturer" optional>
              <Input
                value={
                  course.lecturer.user.name ??
                  course.lecturer.user.email ??
                  'Assigned lecturer'
                }
                readOnly
                disabled
                className={cn(courseFormInputClass, 'bg-muted/25')}
              />
            </CourseFormField>
          ) : null}

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

          <CourseFormField icon={Layers} label="Category" optional>
            <Controller
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <Select
                  value={field.value ?? 'none'}
                  onValueChange={(value) =>
                    field.onChange(value === 'none' ? undefined : value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={courseFormSelectTriggerClass}>
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            hint="Estimated time to complete the course (hours)."
            error={form.formState.errors.estimatedHours?.message}
          >
            <Input
              id="course-estimated-hours"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 40"
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

          <SidebarToggleRow
            icon={Sparkles}
            label="Make course public"
            description="Public courses can appear on landing pages when published."
            checked={isPublic}
            onCheckedChange={handlePublicToggle}
            disabled={isSubmitting}
          />

          {isPublic ? (
            <>
              <div className="border-t border-border/60 pt-1" />

              <CourseFormField icon={Shield} label="Access Type">
                <Controller
                  control={form.control}
                  name="accessType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as CourseAccessType)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={courseFormSelectTriggerClass}>
                        <SelectValue placeholder="Select access type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CourseAccessType)
                          .filter((type) => type !== CourseAccessType.INTERNAL_ONLY)
                          .map((type) => (
                            <SelectItem key={type} value={type}>
                              {COURSE_ACCESS_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.accessType ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.accessType.message}
                  </p>
                ) : null}
              </CourseFormField>

              <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background p-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/8 text-primary">
                    <DollarSign className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <p className="text-[13px] font-semibold tracking-tight text-foreground">
                    Free Course
                  </p>
                </div>
                <Switch
                  size="sm"
                  checked={isFreeCourse}
                  onCheckedChange={handleFreeToggle}
                  disabled={isSubmitting || accessType === CourseAccessType.HYBRID}
                />
              </div>

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
            </>
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
      </div>
    </form>
  );
}
