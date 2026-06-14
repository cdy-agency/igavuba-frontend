'use client';

import React, { useState } from 'react';
import { Star, Award, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RatingModalProps {
  courseId: string;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RatingModal({ courseTitle, isOpen, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold dark:text-white">Rate this course</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">{courseTitle}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="p-1"
              >
                <Star
                  className={`w-7 h-7 ${
                    value <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Course ratings will be available in a future update.
          </p>
          <Button type="button" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
