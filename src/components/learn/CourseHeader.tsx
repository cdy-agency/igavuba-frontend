'use client';

import { useState } from 'react';
import { ChevronLeft, Sun, Moon, Menu, X, MessagesSquare, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { CourseDiscussionSheet } from './CourseDiscussionSheet';
import { RatingModal } from './Ratingmodal';

interface CourseHeaderProps {
  courseTitle: string;
  onBack: () => void;
  progress?: number;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  courseSlug?: string;
  courseId?: string; // Added for rating
}

export default function CourseHeader({
  courseTitle,
  onBack,
  progress = 0,
  sidebarOpen = true,
  onToggleSidebar,
  courseSlug,
  courseId,
}: CourseHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [discussionSheetOpen, setDiscussionSheetOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const isDark = theme === 'dark';

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b transition-colors ${
          isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Top Row: Navigation & Theme Toggle */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onBack}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label="Go back"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>

            {onToggleSidebar && (
              <>
                <div className={`w-px h-4 sm:h-5 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />

                <button
                  onClick={onToggleSidebar}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-label={sidebarOpen ? 'Close curriculum' : 'Open curriculum'}
                >
                  {sidebarOpen ? (
                    <X size={18} className="sm:w-5 sm:h-5" />
                  ) : (
                    <Menu size={18} className="sm:w-5 sm:h-5" />
                  )}
                </button>

                <span
                  className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
                >
                  Curriculum
                </span>
              </>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors sm:hidden hidden ${
              isDark
                ? 'hover:bg-gray-800 text-gray-300 hover:text-yellow-400'
                : 'hover:bg-gray-100 text-gray-600 hover:text-blue-600'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="flex-1 sm:mx-4 md:mx-8 min-w-0">
          <div className="flex gap-1.5 sm:gap-2 items-center">
            <span
              className={`text-xs sm:text-sm whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Course:
            </span>
            <h1
              className={`text-xs sm:text-sm font-bold uppercase tracking-wide truncate ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}
              title={courseTitle}
            >
              {courseTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
            <div
              className={`h-1.5 flex-1 max-w-[120px] md:max-w-[200px] lg:max-w-[40px] rounded-full overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isDark ? 'bg-blue-500' : 'bg-primary'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span
              className={`text-xs font-semibold tabular-nums whitespace-nowrap ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Actions - Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          {courseId && (
            <button
              onClick={() => setRatingModalOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
              }`}
              aria-label="Rate course"
              title="Rate Course"
            >
              <Star size={20} />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors hidden ${
              isDark
                ? 'hover:bg-gray-800 text-gray-300 hover:text-yellow-400'
                : 'hover:bg-gray-100 text-gray-600 hover:text-primary'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {courseSlug && (
            <button
              type="button"
              onClick={() => setDiscussionSheetOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label="Open course discussion"
            >
              <MessagesSquare size={20} />
            </button>
          )}
        </div>

        {/* Actions - Mobile: next to theme */}
        <div className="flex sm:hidden items-center gap-1">
          {courseId && (
            <button
              type="button"
              onClick={() => setRatingModalOpen(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Rate course"
            >
              <Star size={18} />
            </button>
          )}

          {courseSlug && (
            <button
              type="button"
              onClick={() => setDiscussionSheetOpen(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Open course discussion"
            >
              <MessagesSquare size={18} />
            </button>
          )}
        </div>

        <CourseDiscussionSheet
          courseSlug={courseSlug}
          open={discussionSheetOpen}
          onOpenChange={setDiscussionSheetOpen}
          courseTitle={courseTitle}
        />
      </div>

      {/* Rating Modal */}
      {courseId && (
        <RatingModal
          courseId={courseId}
          courseTitle={courseTitle}
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
        />
      )}
    </>
  );
}
