'use client';

import { useRef, useState } from 'react';
import { createCourseSkill } from '@/api/course-skill.api';
import { createCourseTool } from '@/api/course-tool.api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadFile } from '@/api/upload';
import { courseFormSchema, type CourseFormValues } from '@/schema/course.schema';
import { CourseAccessType, CourseLevel, type Course } from '@/types/course';
import {
  COURSE_LANGUAGE_OPTIONS,
  isCourseLanguageCode,
} from '@/types/course-language';
import {
  COURSE_ACCESS_TYPE_LABELS,
  COURSE_LEVEL_LABELS,
  requiresPublicPrice,
} from '@/lib/course-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';
import { CourseSkillsManager } from '@/components/dashboard/courses/course-skills-manager';
import { CourseToolsManager } from '@/components/dashboard/courses/course-tools-manager';

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

interface MediaUploadFieldProps {
  label: string;
  accept: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  kind: 'image' | 'video';
}

function MediaUploadField({
  label,
  accept,
  value,
  onChange,
  disabled,
  kind,
}: MediaUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast.success(`${label} uploaded successfully.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Unable to upload ${label.toLowerCase()}.`));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        <div className="space-y-3 rounded-lg border border-border p-3">
          {kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={`${label} preview`}
              className="h-32 w-full rounded-md object-cover"
            />
          ) : (
            <video src={value} controls className="h-32 w-full rounded-md object-cover" />
          )}
          <p className="truncate text-xs text-muted-foreground">{value}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {value ? 'Replace file' : 'Upload file'}
            </>
          )}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => onChange(undefined)}
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

export function CourseForm({ mode, course, onSuccess, onCancel }: CourseFormProps) {
  const [pendingSkills, setPendingSkills] = useState<string[]>([]);
  const [pendingTools, setPendingTools] = useState<string[]>([]);
  const [isSavingSkillsTools, setIsSavingSkillsTools] = useState(false);

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
      onSubmit={onSubmit}
      className="space-y-8"
    >
      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Basic information</h2>
          <p className="text-sm text-muted-foreground">
            Core details that identify your course.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-title">Title</Label>
          <Input
            id="course-title"
            placeholder="Introduction to Web Development"
            disabled={isSubmitting}
            {...form.register('title')}
          />
          {form.formState.errors.title ? (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-short-description">Short description</Label>
          <Textarea
            id="course-short-description"
            placeholder="A brief summary shown in listings"
            rows={2}
            disabled={isSubmitting}
            {...form.register('shortDescription')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-description">Description</Label>
          <Textarea
            id="course-description"
            placeholder="Full course description"
            rows={5}
            disabled={isSubmitting}
            {...form.register('description')}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Media</h2>
          <p className="text-sm text-muted-foreground">
            Upload a thumbnail and optional preview video.
          </p>
        </div>

        <Controller
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <MediaUploadField
              label="Thumbnail"
              accept="image/*"
              kind="image"
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
            <MediaUploadField
              label="Preview video"
              accept="video/*"
              kind="video"
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Course settings</h2>
          <p className="text-sm text-muted-foreground">
            Level, language, duration, and access configuration.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Level</Label>
            <Controller
              control={form.control}
              name="level"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as CourseLevel)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Controller
              control={form.control}
              name="language"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-estimated-hours">Estimated hours</Label>
            <Input
              id="course-estimated-hours"
              type="number"
              min={1}
              step={1}
              placeholder="40"
              disabled={isSubmitting}
              {...form.register('estimatedHours')}
            />
            {form.formState.errors.estimatedHours ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.estimatedHours.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Access type</Label>
            <Controller
              control={form.control}
              name="accessType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as CourseAccessType)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
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
            {form.formState.errors.accessType ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.accessType.message}
              </p>
            ) : null}
          </div>

          {showPublicPrice ? (
            <div className="space-y-2">
              <Label htmlFor="course-public-price">Public price</Label>
              <Input
                id="course-public-price"
                type="number"
                min={0}
                step="0.01"
                placeholder="49.99"
                disabled={isSubmitting}
                {...form.register('publicPrice')}
              />
              {form.formState.errors.publicPrice ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.publicPrice.message}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <CourseSkillsManager
          mode={mode}
          courseId={course?.id}
          initialSkills={course?.skills}
          pendingSkills={pendingSkills}
          onPendingSkillsChange={setPendingSkills}
          disabled={isSubmitting}
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <CourseToolsManager
          mode={mode}
          courseId={course?.id}
          initialTools={course?.tools}
          pendingTools={pendingTools}
          onPendingToolsChange={setPendingTools}
          disabled={isSubmitting}
        />
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create'
                ? isSavingSkillsTools
                  ? 'Saving skills and tools...'
                  : 'Creating...'
                : 'Saving...'}
            </>
          ) : mode === 'create' ? (
            'Create course'
          ) : (
            'Save changes'
          )}
        </Button>
      </div>
    </form>
  );
}
