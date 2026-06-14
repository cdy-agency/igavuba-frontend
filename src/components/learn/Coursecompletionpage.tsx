'use client';

import React from 'react';
import { Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseCompletionPageProps {
  courseId: string;
  courseTitle: string;
  enrollmentId: string;
  userId: string;
  userName?: string;
}

export function CourseCompletionPage({
  courseTitle,
  userName = 'Student',
}: CourseCompletionPageProps) {
  return (
    <div className="h-full overflow-y-auto dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <Award className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Congratulations, {userName}!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          You have completed <span className="font-semibold">{courseTitle}</span>.
        </p>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold dark:text-white">Rate this course</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Course ratings will be available in a future update.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-left space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold dark:text-white">Certificate</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Certificate generation will be available in a future update.
          </p>
          <Button type="button" disabled className="w-full sm:w-auto">
            Certificate coming soon
          </Button>
        </div>
      </div>
    </div>
  );
}
