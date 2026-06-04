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
        <span className="animate-spin w-6 h-6 text-link"><Loader className="animate-spin" /></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-72 bg-background border-r border-border shadow-sm">
      <div className="flex items-center gap-2 p-2 border-b border-border bg-background">
        <div className="w-8 h-8 bg-primary-muted rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Courses</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          My Enrolled Courses
        </div>
        {enrollment.length === 0 && (
          <div className="text-muted-foreground text-sm">No enrolled courses found.</div>
        )}
        {enrollment.map((e: EnrolledCoursePreview) => (
          <div
            key={e._id}
            onClick={() => onSelectCourse(e.course_id as Course)}
            className="group p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-primary-subtle border border-transparent hover:border-primary-muted flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-primary-light" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate text-foreground">
                {e.course_id.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {e.course_id.difficulty_level} • {e.course_id.duration_weeks} weeks
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-link group-hover:text-primary transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
}