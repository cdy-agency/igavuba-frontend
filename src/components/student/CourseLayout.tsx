"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CourseList from "./course-list";
import CourseSidebar from "./course-sidebar";
import { Course } from "@/lib/types/course";
import CourseHome from "./course-home";
import CourseAnnouncements from "./course-anouncement";
import CourseAssignments from "./course-assignement";
import CourseModule from "./course-module";

export default function CourseLayout() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<string>("home");

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleBack = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="flex h-full">
      <AnimatePresence mode="wait">
        {!selectedCourse ? (
          <motion.div
            key="course-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-40"
          >
            <CourseList onSelectCourse={handleSelectCourse} />
          </motion.div>
        ) : (
          <motion.div
            key="course-sidebar"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className=""
          >
            <CourseSidebar
              course={selectedCourse}
              active={activeTab}
              onNavChange={setActiveTab}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <motion.div
        key="main-content"
        className="flex-1 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {selectedCourse && activeTab === 'home' && (
          <div className="text-lg font-semibold">
            <CourseHome course={{
              title: `${selectedCourse.title}`
            }} />
          </div>
        )}

        {selectedCourse && activeTab === "announcements" && (
          <div className="text-lg font-semibold">
            <CourseAnnouncements courseId={selectedCourse._id as unknown as string} />
          </div>
        ) }
        {selectedCourse && activeTab === "assignments" && (
          <div className="text-lg font-semibold">
            <CourseAssignments courseId={selectedCourse._id as unknown as string} />
          </div>
        ) }
        {selectedCourse && activeTab === "modules" && (
          <div className="text-lg font-semibold">
            <CourseModule chapters={[]} onSelectPage={() => {}} />
          </div>
        ) }
      </motion.div>
    </div>
  );
}
