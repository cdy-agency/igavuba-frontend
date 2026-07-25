'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';
import { certificateApi } from '@/api/certificate-template.api';
import type { Certificate, DocumentOrientation, LayoutData, MutationError } from '@/types/certificate';
import {
  useCertificateBuilder,
} from '@/components/certificate-builder/context/Certificatebuildercontext';
import { toast } from '@/lib/toast';
import { OrientationModal } from '@/components/certificate-builder/modal/Orientationmodal';
import { CertificateList } from '@/components/certificate-builder/view/Certificatelist';
import { ElementsPanel } from '@/components/certificate-builder/spanel/Elementspanel';
import { BackgroundsPanel } from '@/components/certificate-builder/spanel/Backgroundspanel';
import { ElementPropertiesPanel } from '@/components/certificate-builder/spanel/Elementpropertiespanel';
import AppNavbar from '@/components/certificate-builder/nav-bar';

interface CreateCertificatePayload {
  title: string;
  orientation: DocumentOrientation;
  layoutData: LayoutData;
}

function CertificateBuilderLayoutInner({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    certificates,
    selectedCertificateId,
    selectedCertificate,
    selectCertificate,
    activeTab,
    setActiveTab,
    addElement,
    selectedElementId,
  } = useCertificateBuilder();

  const [searchQuery, setSearchQuery] = useState('');
  const [orientationModalOpen, setOrientationModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null);
  // Fetch certificates
  // const { isLoading: certificatesLoading } = useQuery({
  //   queryKey: ['certificates'],
  //   queryFn: () => certificateApi.getCertificates(),
  // });

  // Create certificate mutation
  const createCertificateMutation = useMutation({
    mutationFn: async (data: CreateCertificatePayload) => {
      return await certificateApi.createCertificate(data);
    },
    onSuccess: (newCertificate) => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      selectCertificate(newCertificate.id);
      toast.success('Certificate created successfully');
    },
    onError: (error: MutationError) => {
      console.error('Create certificate error:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to create certificate';
      toast.error(errorMessage);
    },
  });

  // Update certificate mutation
  const updateCertificateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Certificate> }) =>
      certificateApi.updateCertificate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate updated successfully');
    },
    onError: (error: MutationError) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to update certificate';
      toast.error(errorMessage);
    },
  });

  // Delete certificate mutation
  const deleteCertificateMutation = useMutation({
    mutationFn: (id: string) => certificateApi.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate deleted successfully');
    },
    onError: (error: MutationError) => {
      console.error('Delete certificate error:', error);
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete certificate';
      toast.error(errorMessage);
    },
  });

  const handleAddCertificate = () => {
    setOrientationModalOpen(true);
  };

  const handleOrientationSelect = (orientation: 'PORTRAIT' | 'LANDSCAPE') => {
    const size =
      orientation === 'PORTRAIT' ? { width: 595, height: 842 } : { width: 842, height: 595 };

    // Create template with white background
    const formData: CreateCertificatePayload = {
      title: 'New template',
      orientation: orientation as DocumentOrientation,
      layoutData: {
        size,
        value: '',
        type: 'color',
        elements: [],
        background: {
          id: 'default-bg',
          type: 'color',
          value: '#FFFFFF',
        },
      },
    };

    createCertificateMutation.mutate(formData);
  };

  const handleRenameCertificate = (id: string, title: string) => {
    updateCertificateMutation.mutate({
      id,
      updates: { title },
    });
  };

  const handleDeleteCertificate = (certificate: Certificate) => {
    setCertificateToDelete(certificate);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (certificateToDelete) {
      await deleteCertificateMutation.mutateAsync(certificateToDelete.id);

      // If deleted certificate was selected, select another one
      if (certificateToDelete.id === selectedCertificateId) {
        const remainingCerts = certificates.filter((c) => c.id !== certificateToDelete.id);
        const firstRemaining = remainingCerts[0];
        selectCertificate(firstRemaining?.id || null);
      }

      setCertificateToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const handleBackgroundUpload = async (backgroundFile: File) => {
    if (!selectedCertificate) return;

    try {
      await certificateApi.updateBackground(selectedCertificate.id, backgroundFile);
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Background uploaded successfully');
    } catch (error) {
      const mutationError = error as MutationError;
      const errorMessage =
        mutationError?.response?.data?.message ||
        mutationError?.message ||
        'Failed to upload background';
      toast.error(errorMessage);
      console.error('Upload background error:', error);
    }
  };

  const handleBackgroundDelete = async () => {
    if (!selectedCertificate) return;

    try {
      await certificateApi.deleteBackground(selectedCertificate.id);
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Background removed successfully');
    } catch (error) {
      const mutationError = error as MutationError;
      const errorMessage =
        mutationError?.response?.data?.message ||
        mutationError?.message ||
        'Failed to remove background';
      toast.error(errorMessage);
      console.error('Remove background error:', error);
    }
  };

  // Filter certificates based on search
  const filteredCertificates = certificates.filter((cert) => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = cert.title.toLowerCase().includes(searchLower);
    const idMatch = cert.id.toLowerCase().includes(searchLower);
    return titleMatch || idMatch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <AppNavbar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden py-16">
        {/* Left Sidebar - Certificate List */}
        <CertificateList
          certificates={filteredCertificates}
          selectedCertificateId={selectedCertificateId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectCertificate={selectCertificate}
          onAddCertificate={handleAddCertificate}
          onRenameCertificate={handleRenameCertificate}
          onDeleteCertificate={handleDeleteCertificate}
          isCreating={createCertificateMutation.isPending}
        />

        {/* Middle Canvas */}
        <div className="flex-1 bg-gray-50 overflow-auto">{children}</div>

        {/* Right Sidebar - Elements & Backgrounds */}
        <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('elements')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'elements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Elements
              </button>
              <button
                onClick={() => setActiveTab('backgrounds')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'backgrounds'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Backgrounds
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'elements' ? (
              <ElementsPanel onAddElement={addElement} disabled={!selectedCertificate} />
            ) : (
              <BackgroundsPanel
                selectedCertificate={selectedCertificate}
                selectedBackground={selectedCertificate?.layoutData?.background}
                onUploadBackground={handleBackgroundUpload}
                onDeleteBackground={handleBackgroundDelete}
                disabled={!selectedCertificate}
              />
            )}
          </div>

          {/* Element Properties Panel */}
          {selectedElementId && <ElementPropertiesPanel />}
        </div>
      </div>

      {/* Modals */}
      <OrientationModal
        isOpen={orientationModalOpen}
        onClose={() => setOrientationModalOpen(false)}
        onSelect={handleOrientationSelect}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete certificate"
        description="Are you sure you want to delete this certificate? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default function CertificateBuilderLayout({ children }: { children: React.ReactNode }) {
  return <CertificateBuilderLayoutInner>{children}</CertificateBuilderLayoutInner>;
}
