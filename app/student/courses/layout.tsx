// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { coursesList } from "@/lib/data";
import Link from "next/link";
import {
  Home,
  Megaphone,
  ClipboardList,
  GraduationCap,
  Users,
  FileText,
  File,
  Book,
  Folder,
  HelpCircle,
  Menu,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  fetchCourseById,
  getCourseProgress,
} from "@/lib/api/student/courses.api";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const courseId = pathname.split("/")[3];

  const [courseTitle, setCourseTitle] = useState<string>("");
  const [courseTerm, setCourseTerm] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when on a lesson page
  const isLessonPage = pathname.includes("/pages/") && pathname.split("/").length > 5;

  useEffect(() => {
    // Auto-collapse sidebar when entering lesson mode
    if (isLessonPage) {
      setIsCollapsed(true);
    }
  }, [isLessonPage]);

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;

      try {
        const course = await fetchCourseById(courseId);
        const title = course?.title || "Course";
        setCourseTitle(title);

        const match = coursesList.find((c) =>
          title.toLowerCase().includes(String(c.name).toLowerCase()),
        );
        setCourseTerm(match?.term || "");

        const progressData = await getCourseProgress(courseId);
        setProgress(progressData?.progressPercentage || 0);
      } catch {}
    };

    load();
  }, [courseId]);

  const isSpecificCoursePage =
    courseId && pathname.startsWith(`/student/courses/${courseId}`);

  const navItems = [
    { href: "home", label: "Home", icon: Home },
    { href: "announcements", label: "Announcements", icon: Megaphone },
    { href: "modules", label: "Modules", icon: Folder },
    { href: "pages", label: "Pages", icon: FileText },
    { href: "assessments", label: "Assessments", icon: ClipboardList },
    { href: "grades", label: "Grades", icon: GraduationCap },
    { href: "files", label: "Files", icon: File },
    { href: "syllabus", label: "Syllabus", icon: Book },
    { href: "collaborations", label: "Group Works", icon: Users },
    { href: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <div className="flex flex-1 min-h-screen">
      {isSpecificCoursePage && (
        <>
          {/* Desktop Sidebar */}
          <aside
            className={cn(
              "hidden lg:flex flex-col flex-shrink-0 border-r border-gray-200 bg-white transition-all duration-300",
              isCollapsed ? "w-20" : "w-60",
            )}
          >
            <div className="p-4 flex flex-col flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                {!isCollapsed && (
                  <h2
                    className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2"
                    title={courseTitle}
                  >
                    {courseTitle || "Course"}
                  </h2>
                )}

                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-gray-400 hover:text-gray-700 transition"
                  title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <PanelLeft
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isCollapsed && "rotate-180",
                    )}
                  />
                </button>
              </div>

              {/* Progress */}
              <div className="flex justify-center mb-4">
                {!isCollapsed ? (
                  <div className="w-full space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {progress}% completed
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                )}
              </div>

              {/* Term */}
              {!isCollapsed && courseTerm && (
                <p className="text-xs font-bold text-gray-600 mb-4">
                  {courseTerm}
                </p>
              )}

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = pathname.includes(
                    `/student/courses/${courseId}/${href}`,
                  );
                  return (
                    <Link
                      key={href}
                      href={`/student/courses/${courseId}/${href}`}
                      className={cn(
                        "relative flex items-center py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                        isCollapsed ? "justify-center px-2" : "gap-2.5 px-3",
                        active
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                      )}
                      title={isCollapsed ? label : undefined}
                    >
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full bg-blue-500 transition-opacity duration-200",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          active
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-gray-700",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{label}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <div className="lg:hidden fixed top-14 left-2 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 bg-white/95 backdrop-blur border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Menu className="h-3 w-3" />
                  <span className="ml-1 text-xs font-medium">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 max-w-[85vw]">
                <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
                  <h2
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={courseTitle}
                  >
                    {courseTitle || "Course"}
                  </h2>
                </div>
                <div className="p-4">
                  {courseTerm && (
                    <p className="text-sm font-bold text-gray-600 mb-4">
                      {courseTerm}
                    </p>
                  )}
                  <nav className="space-y-1">
                    {navItems.map(({ href, label, icon: Icon }) => {
                      const active = pathname.includes(
                        `/student/courses/${courseId}/${href}`,
                      );
                      return (
                        <Link
                          key={href}
                          href={`/student/courses/${courseId}/${href}`}
                          className={cn(
                            "relative flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                            active
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col bg-white">
        <div
          className={cn("flex-1", isSpecificCoursePage ? "lg:pl-0 pl-12" : "")}
        >
          {children}
        </div>
      </main>
    </div>
  );
}