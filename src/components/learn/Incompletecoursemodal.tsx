'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface IncompleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IncompleteCourseModal({ isOpen, onClose }: IncompleteCourseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded max-w-md w-full overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-chart-1 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-white" />
            <h3 className="text-lg font-semibold text-white">Course Incomplete</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white cursor-pointer hover:bg-chart-1/60 rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            Please complete all course lessons before marking the course as complete.
          </p>
        </div>
      </div>
    </div>
  );
}
