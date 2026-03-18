'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { useCreateAssessment, useInstructorCourses, useCourseModules } from '@/lib/hooks/assessments';

export default function NewAssessmentPage() {
  const router = useRouter();
  const createAssessment = useCreateAssessment();
  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();
  const needModule = (t: string) => t === 'QUIZ' || t === 'ASSIGNMENT';
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'QUIZ' as 'QUIZ' | 'EXAM' | 'ASSIGNMENT',
    course: '',
    module: '',
    totalMarks: 0,
    duration: 30,
    dueDate: '',
    maxAttempts: 1,
    publishResults: true,
    submissionType: 'TEXT' as 'TEXT' | 'DOCUMENT' | 'BOTH',
  });

  const { data: modules = [], isLoading: loadingModules } = useCourseModules(
    form.course || undefined,
    needModule(form.type)
  );

  useEffect(() => {
    if (!needModule(form.type) || !form.course) return;
    setForm((f) => ({ ...f, module: '' }));
  }, [form.course, form.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course || !form.title.trim()) {
      toast.error('Title and course are required');
      return;
    }
    if ((form.type === 'QUIZ' || form.type === 'ASSIGNMENT') && !form.module) {
      toast.error('Module is required for Quiz and Assignment');
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      course: form.course,
      module: (form.type === 'QUIZ' || form.type === 'ASSIGNMENT') ? form.module : undefined,
      totalMarks: form.type === 'ASSIGNMENT' ? 100 : form.totalMarks,
      duration: form.type === 'ASSIGNMENT' ? undefined : form.duration,
      dueDate: form.dueDate || undefined,
      maxAttempts: form.maxAttempts,
      publishResults: form.publishResults,
      assignmentSettings: form.type === 'ASSIGNMENT' ? { submissionType: form.submissionType } : undefined,
    };
    const res = await createAssessment.mutateAsync(payload);
    if (res.ok && res.data) {
      toast.success('Assessment created');
      router.push(`/instructor/assessments/${res.data._id}`);
    } else {
      toast.error(res.ok ?? 'Failed to create');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/instructor">Instructor</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/instructor/assessments">Assessments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Assessment</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardHeader>
            <CardTitle>Create assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={form.course}
                  onValueChange={(v) => setForm((f) => ({ ...f, course: v }))}
                  required
                  disabled={loadingCourses}
                >
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c: { _id: string; title: string }) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: 'QUIZ' | 'EXAM' | 'ASSIGNMENT') =>
                    setForm((f) => ({ ...f, type: v, module: '' }))
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="QUIZ">Quiz (attached to module)</SelectItem>
                    <SelectItem value="EXAM">Exam (course-level)</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment (attached to module)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(form.type === 'QUIZ' || form.type === 'ASSIGNMENT') && (
                <div>
                  <Label htmlFor="module">Module *</Label>
                  <Select
                    value={form.module}
                    onValueChange={(v) => setForm((f) => ({ ...f, module: v }))}
                    required={form.type === 'QUIZ' || form.type === 'ASSIGNMENT'}
                    disabled={!form.course || loadingModules}
                  >
                    <SelectTrigger id="module">
                      <SelectValue placeholder={form.course ? 'Select module' : 'Select course first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((m: { _id: string; title: string }) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Assessment title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              {form.type !== 'ASSIGNMENT' && (
                <>
                  <div>
                    <Label htmlFor="totalMarks">Total marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min={0}
                      value={form.totalMarks}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, totalMarks: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={1}
                      value={form.duration}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, duration: Number(e.target.value) || 30 }))
                      }
                    />
                  </div>
                </>
              )}
              {form.type === 'ASSIGNMENT' && (
                <div>
                  <Label>Submission type</Label>
                  <Select
                    value={form.submissionType}
                    onValueChange={(v: 'TEXT' | 'DOCUMENT' | 'BOTH') =>
                      setForm((f) => ({ ...f, submissionType: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">Text only</SelectItem>
                      <SelectItem value="DOCUMENT">Document only</SelectItem>
                      <SelectItem value="BOTH">Text or document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="dueDate">Due date (optional)</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="maxAttempts">Max attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min={1}
                  value={form.maxAttempts}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxAttempts: Number(e.target.value) || 1 }))
                  }
                />
              </div>
              {form.type === 'EXAM' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publishResults"
                    checked={form.publishResults}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, publishResults: e.target.checked }))
                    }
                  />
                  <Label htmlFor="publishResults">Publish results immediately (uncheck to hide until you publish)</Label>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createAssessment.isPending}>
                  {createAssessment.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/instructor/assessments">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
