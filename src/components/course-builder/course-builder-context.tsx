'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ContentType } from '@/types/content';

export type LessonCreateType = 'text' | 'video' | 'document' | 'quiz' | 'assignment' | 'exam';

export type BuilderSaveStatus = 'idle' | 'saving' | 'pending' | 'offline' | 'saved';

export interface BuilderSaveState {
  status: BuilderSaveStatus;
  message: string;
  isSaving: boolean;
}

interface CourseBuilderContextValue {
  selectedModuleId: string | null;
  setSelectedModuleId: (moduleId: string | null) => void;
  selectedContentId: string | null;
  setSelectedContentId: (contentId: string | null) => void;
  viewingFinalExam: boolean;
  setViewingFinalExam: (value: boolean) => void;
  selectFinalExam: () => void;
  creatingLessonType: LessonCreateType | null;
  startCreatingLesson: (type: LessonCreateType) => void;
  cancelCreatingLesson: () => void;
  builderSaveState: BuilderSaveState | null;
  setBuilderSaveState: (state: BuilderSaveState | null) => void;
}

const CourseBuilderContext = createContext<CourseBuilderContextValue | null>(null);

export function CourseBuilderProvider({ children }: { children: ReactNode }) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [viewingFinalExam, setViewingFinalExam] = useState(false);
  const [creatingLessonType, setCreatingLessonType] = useState<LessonCreateType | null>(null);
  const [builderSaveState, setBuilderSaveState] = useState<BuilderSaveState | null>(null);

  const value = useMemo(
    () => ({
      selectedModuleId,
      setSelectedModuleId: (moduleId: string | null) => {
        setSelectedModuleId(moduleId);
        if (moduleId) {
          setViewingFinalExam(false);
        }
      },
      selectedContentId,
      setSelectedContentId: (contentId: string | null) => {
        setSelectedContentId(contentId);
        if (contentId) {
          setViewingFinalExam(false);
        }
      },
      viewingFinalExam,
      setViewingFinalExam,
      selectFinalExam: () => {
        setViewingFinalExam(true);
        setSelectedContentId(null);
        setCreatingLessonType(null);
      },
      creatingLessonType,
      startCreatingLesson: (type: LessonCreateType) => {
        setCreatingLessonType(type);
        setSelectedContentId(null);
        setViewingFinalExam(false);
      },
      cancelCreatingLesson: () => setCreatingLessonType(null),
      builderSaveState,
      setBuilderSaveState,
    }),
    [selectedModuleId, selectedContentId, viewingFinalExam, creatingLessonType, builderSaveState],
  );

  return (
    <CourseBuilderContext.Provider value={value}>{children}</CourseBuilderContext.Provider>
  );
}

export function useCourseBuilder() {
  const context = useContext(CourseBuilderContext);
  if (!context) {
    throw new Error('useCourseBuilder must be used within CourseBuilderProvider');
  }
  return context;
}

export function lessonTypeLabel(type: ContentType | LessonCreateType | 'quiz'): string {
  switch (type) {
    case 'TEXT':
    case 'text':
      return 'Text';
    case 'VIDEO':
    case 'video':
      return 'Video';
    case 'DOCUMENT':
    case 'document':
      return 'Document';
    case 'QUIZ':
    case 'quiz':
      return 'Quiz';
    case 'ASSIGNMENT':
    case 'assignment':
      return 'Assignment';
    case 'EXAM':
    case 'exam':
      return 'Exam';
    default:
      return 'Lesson';
  }
}
