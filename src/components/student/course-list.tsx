"use client";

import { useEffect } from "react";
import { BookOpen, ChevronRight, Loader } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useEducation } from "@/context/educationContext";
import { Course } from "@/lib/types/course";

interface CourseListProps {
  onSelectCourse: (course: Course) => void;
}

interface EnrolledCoursePreview {
  _id: string
  course_id: Pick<
    Course,
    "_id" | "title" | "difficulty_level" | "duration_weeks"
  >
}

export default function CourseList({ onSelectCourse }: CourseListProps) {
  const { user, loading } = useAuth();
  const { getEnrolledCourse, enrollment, loadingEducation } = useEducation();

  useEffect(() => {
    getEnrolledCourse();
  }, []);

  if (loadingEducation) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin w-6 h-6 text-blue-500"><Loader className="animate-spin" /></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-72 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-white">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          My Enrolled Courses
        </div>
        {enrollment.length === 0 && (
          <div className="text-gray-400 text-sm">No enrolled courses found.</div>
        )}
        {enrollment.map((e: EnrolledCoursePreview) => (
          <div
            key={e._id}
            onClick={() => onSelectCourse(e.course_id as Course)}
            className="group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 border border-transparent hover:border-blue-200 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate text-gray-900">
                {e.course_id.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {e.course_id.difficulty_level} • {e.course_id.duration_weeks} weeks
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}