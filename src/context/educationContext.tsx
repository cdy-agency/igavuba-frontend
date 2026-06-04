"use client";

import React, { createContext, useContext, useState } from "react";
import type { Course, Institution } from "@/lib/api";

interface Enrollment {
  _id: string;
  course_id: Course;
}

interface EducationContextTypes {
  institution: Institution[];
  selectedInstitution: Institution | null;
  setSelectedInstitution: (institution: Institution | null) => void;
  course: Course[];
  enrollment: Enrollment[];
  fetchInstitution: () => Promise<void>;
  fetchCourseByInstitution: (id: string) => Promise<void>;
  getEnrolledCourse: () => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  loadingEducation: boolean;
}

const EducationContext = createContext<EducationContextTypes | undefined>(
  undefined
);

export function EducationProvider({ children }: { children: React.ReactNode }) {
  const [institution, setInstitution] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);
  const [course, setCourse] = useState<Course[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment[]>([]);
  const [loadingEducation, setLoadingEducation] = useState(false);

  const fetchInstitution = async () => {
    setLoadingEducation(true);
    try {
      const response = await fetch("/api/institutions");
      const payload = response.ok ? await response.json() : [];
      setInstitution(Array.isArray(payload) ? payload : payload?.data ?? []);
    } finally {
      setLoadingEducation(false);
    }
  };

  const fetchCourseByInstitution = async (id: string) => {
    setLoadingEducation(true);
    try {
      const response = await fetch(`/api/institutions/${id}/courses`);
      const payload = response.ok ? await response.json() : [];
      setCourse(Array.isArray(payload) ? payload : payload?.data ?? []);
    } finally {
      setLoadingEducation(false);
    }
  };

  const getEnrolledCourse = async () => {
    setLoadingEducation(true);
    try {
      const response = await fetch("/api/enrollement");
      const payload = response.ok ? await response.json() : [];
      setEnrollment(Array.isArray(payload) ? payload : payload?.data ?? []);
    } finally {
      setLoadingEducation(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    setLoadingEducation(true);
    try {
      await fetch(`/api/enrollement/${courseId}`, {
        method: "POST",
      });
    } finally {
      setLoadingEducation(false);
    }
  };

  return (
    <EducationContext.Provider
      value={{
        institution,
        selectedInstitution,
        setSelectedInstitution,
        course,
        enrollment,
        fetchInstitution,
        fetchCourseByInstitution,
        getEnrolledCourse,
        enrollInCourse,
        loadingEducation,
      }}
    >
      {children}
    </EducationContext.Provider>
  );
}

export function useEducation() {
  const context = useContext(EducationContext);

  if (!context) {
    throw new Error("useEducation must be used within an EducationProvider");
  }

  return context;
}
