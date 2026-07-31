'use client';

import React from 'react';
import { FileQuestion } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-12 h-12 text-gray-400" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          No Certificate Templates Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          You haven&apos;t created any certificate templates yet. Create your first template to set
          it as the default certificate for all your courses.
        </p>
        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Once you create a template, you can set it as the default
            certificate that will be automatically applied to all courses without a specific
            certificate.
          </p>
        </div>
      </div>
    </div>
  );
}
