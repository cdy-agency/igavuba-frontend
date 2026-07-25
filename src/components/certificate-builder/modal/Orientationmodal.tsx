'use client';

import React from 'react';
import { X } from 'lucide-react';
import { DocumentOrientation } from '@/types/certificate';

interface OrientationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (orientation: DocumentOrientation) => void;
}

export function OrientationModal({ isOpen, onClose, onSelect }: OrientationModalProps) {
  if (!isOpen) return null;

  const handleSelect = (orientation: DocumentOrientation) => {
    onSelect(orientation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-8 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a new certificate</h2>
          <p className="text-sm text-gray-600">
            Choose the layout orientation for your certificate
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-6">
          {/* Portrait Option */}
          <button
            onClick={() => handleSelect(DocumentOrientation.PORTRAIT)}
            className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Portrait Icon/Preview */}
              <div className="relative">
                <div className="w-24 h-32 bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg shadow-sm group-hover:border-blue-400 group-hover:shadow-md transition-all duration-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-1 bg-gray-300 rounded mb-2 mx-auto group-hover:bg-blue-300" />
                    <div className="w-16 h-1 bg-gray-300 rounded mb-2 mx-auto group-hover:bg-blue-300" />
                    <div className="w-10 h-1 bg-gray-300 rounded mx-auto group-hover:bg-blue-300" />
                  </div>
                </div>
                {/* Dimension label */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap bg-white px-2 rounded group-hover:text-blue-600">
                  1050 × 1600
                </div>
              </div>

              {/* Label */}
              <div className="mt-2">
                <span className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
                  Portrait
                </span>
                <p className="text-xs text-gray-500 mt-1">Vertical layout</p>
              </div>
            </div>
          </button>

          {/* Landscape Option */}
          <button
            onClick={() => handleSelect(DocumentOrientation.LANDSCAPE)}
            className="group relative p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-32 h-24 bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg shadow-sm group-hover:border-blue-400 group-hover:shadow-md transition-all duration-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-1 bg-gray-300 rounded mb-2 mx-auto group-hover:bg-blue-300" />
                    <div className="w-20 h-1 bg-gray-300 rounded mb-2 mx-auto group-hover:bg-blue-300" />
                    <div className="w-12 h-1 bg-gray-300 rounded mx-auto group-hover:bg-blue-300" />
                  </div>
                </div>
                {/* Dimension label */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap bg-white px-2 rounded group-hover:text-blue-600">
                  1600 × 1050
                </div>
              </div>

              {/* Label */}
              <div className="mt-2">
                <span className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
                  Landscape
                </span>
                <p className="text-xs text-gray-500 mt-1">Horizontal layout</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
