'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificateApi } from '@/api/certificate-template.api';
import * as courseApi from '@/api/course.api';
import type { CertificateTemplate, CertificateTab, MutationError } from '@/types/certificate';
import type { Course } from '@/types/course';
import { toast } from '@/lib/toast';
import { CertificateLinkHeader } from '@/components/certificate-builder/view/Certificatelinkhero';
import { DefaultCertificatePreview } from '@/components/certificate-builder/view/Defaultcertificatepreview';
import { TemplateSelectionSidebar } from '@/components/certificate-builder/view/Templateselectionsidebar';
import { CoursesTab } from '@/components/certificate-builder/view/Courselistitem';
import { AssignCertificateDialog } from '@/components/dialog/Assigncertificatedialog';
import { LoadingState } from '@/components/certificate-builder/state/Loadingstate';
import { EmptyState } from '@/components/certificate-builder/state/Emptystate';

export default function CertificateLinkPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CertificateTab>('default');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Course assignment dialog state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [courseToAssign, setCourseToAssign] = useState<Course | null>(null);

  // Fetch certificates
  const {
    data: certificatesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateApi.getCertificates(),
  });

  // Extract templates and default template ID
  const { templates, defaultTemplateId } = useMemo(() => {
    if (!certificatesData) return { templates: [], defaultTemplateId: null };

    let fetchedTemplates: CertificateTemplate[] = [];
    let institutionDefaultId: string | null = null;

    if ('data' in certificatesData && certificatesData.data) {
      const templatesData = certificatesData.data.templates;
      fetchedTemplates = Array.isArray(templatesData) ? templatesData : [templatesData];
      institutionDefaultId =
        certificatesData.data.institution?.defaultCertificateTemplateId || null;
    } else if ('templates' in certificatesData) {
      const templatesData = (certificatesData as { templates: CertificateTemplate[] }).templates;
      fetchedTemplates = Array.isArray(templatesData) ? templatesData : [];
      const institutionData = (
        certificatesData as { institution?: { defaultCertificateTemplateId?: string } }
      ).institution;
      institutionDefaultId = institutionData?.defaultCertificateTemplateId || null;
    }

    return {
      templates: fetchedTemplates,
      defaultTemplateId: institutionDefaultId,
    };
  }, [certificatesData]);

  // Auto-select initial template
  React.useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      const initialTemplate = defaultTemplateId
        ? templates.find((t) => t.id === defaultTemplateId)
        : templates[0];

      setSelectedTemplateId(initialTemplate?.id || templates[0]!.id);
    }
  }, [templates, selectedTemplateId, defaultTemplateId]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Apply default template mutation
  const applyTemplateMutation = useMutation({
    mutationFn: (templateId: string) =>
      certificateApi.applyTemplateToCoursesWithoutCertificate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['courses-for-certificates'] });
      toast.success('Default certificate template set and applied to courses successfully');
      setIsApplying(false);
    },
    onError: (err: MutationError) => {
      const errorMessage = err?.response?.data?.message;

      if (errorMessage === 'This certificate template is already set as default') {
        toast.error('This template is already set as default');
      } else {
        toast.error(errorMessage ?? 'Failed to apply default certificate');
      }
      setIsApplying(false);
    },
  });

  // Assign template to specific course mutation
  const assignTemplateMutation = useMutation({
    mutationFn: async ({ courseId, templateId }: { courseId: string; templateId: string }) => {
      await certificateApi.assignTemplateToCourse(templateId, courseId);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses-for-certificates'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      toast.success('Certificate template assigned to course successfully');
    },

    onError: (err: MutationError) => {
      const errorMessage = err?.response?.data?.message;
      toast.error(errorMessage ?? 'Failed to assign certificate template to course');
    },
  });

  // Handlers
  const handleApplyDefault = () => {
    if (!selectedTemplate) {
      toast.error('No certificate template selected');
      return;
    }

    if (selectedTemplate.id === defaultTemplateId) {
      toast.error('This template is already set as default');
      return;
    }

    setIsApplying(true);
    applyTemplateMutation.mutate(selectedTemplate.id);
  };

  const handleSelectTemplate = (template: CertificateTemplate) => {
    setSelectedTemplateId(template.id);
  };

  const handleOpenAssignDialog = (course: Course) => {
    setCourseToAssign(course);
    setIsAssignDialogOpen(true);
  };

  const handleAssignCertificate = async (courseId: string, templateId: string) => {
    await assignTemplateMutation.mutateAsync({ courseId, templateId });
  };

  const normalizeCourseForDialog = (course: Course) => ({
    id: course.id,
    title: course.title,
    certificateTemplateId: course.certificateTemplateId ?? null,
  });

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <CertificateLinkHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <CertificateLinkHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Templates</h2>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'Failed to load certificate templates'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTemplate && activeTab === 'default') {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <CertificateLinkHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <CertificateLinkHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'default' ? (
        // Default Certificate Tab
        <div className="flex flex-1">
          <div className="flex-1">
            <DefaultCertificatePreview
              certificate={selectedTemplate!}
              onApplyDefault={handleApplyDefault}
              isApplying={isApplying}
            />
          </div>

          <TemplateSelectionSidebar
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            defaultTemplateId={defaultTemplateId}
            onSelectTemplate={handleSelectTemplate}
          />
        </div>
      ) : (
        // Courses Tab
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <CoursesTab
              templates={templates}
              defaultTemplateId={defaultTemplateId}
              onAssignCertificate={handleOpenAssignDialog}
              courseApi={courseApi}
            />
          </div>
        </div>
      )}

      {/* Assignment Dialog */}
      <AssignCertificateDialog
        isOpen={isAssignDialogOpen}
        onClose={() => {
          setIsAssignDialogOpen(false);
          setCourseToAssign(null);
        }}
        course={courseToAssign ? normalizeCourseForDialog(courseToAssign) : null}
        templates={templates}
        defaultTemplateId={defaultTemplateId}
        onAssign={handleAssignCertificate}
      />
    </div>
  );
}
