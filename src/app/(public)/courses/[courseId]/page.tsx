"use client";

import {
  Clock,
  BarChart3,
  Award,
  CheckCircle2,
  BookOpen,
  Users,
  Share2,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import EnhancedVideoPlayer from "@/components/Customvideoplayer";
import { Course } from "@/lib/api";
import { getCourseById } from "@/lib/api/public";
import LandingHeader from "@/components/landingpages/header";
import { LandingFooter } from "@/components/landingpages/landingFooter";
import { EnrollButton } from "@/components/Course/enrollButton";
import { useAuth } from "@/lib/hooks/use-auth";
import { useEnrolledCourseById } from "@/lib/hooks/student";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: enrollmentData } = useEnrolledCourseById(courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !courseId) {
      setIsEnrolled(false);
      return;
    }

    const enrollment = Array.isArray(enrollmentData) ? enrollmentData[0] : null;
    setIsEnrolled(enrollment?.status === "active");
  }, [isAuthenticated, authLoading, courseId, enrollmentData]);

  const loadCourse = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await getCourseById(courseId);
      if (result.success) {
        setCourse(result.data);
      } else {
        setError(result.message || "Failed to load course");
      }
    } catch (err) {
      console.error("Error loading course:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: `Check out this course: ${course?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `${price.toLocaleString()} RWF`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-red-600 dark:text-red-400 mb-4">
            {error || "Course not found"}
          </p>
          <button
            onClick={() => router.push("/course")}
            className="text-primary hover:text-blue-700 underline"
          >
            Back to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <LandingHeader />

      {/* Hero Section */}
      <div className="relative text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${course.thumbnail || "/placeholder-course.jpg"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/40 to-primary/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                {course.category && (
                  <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full uppercase">
                    {course.category.name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl text-white md:text-4xl font-bold mb-6 drop-shadow-lg">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 mb-6">
                {course.instructor_id && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600/80 backdrop-blur flex items-center justify-center text-white font-semibold text-lg">
                      {course.instructor_id.user_id?.name
                        ?.charAt(0)
                        .toUpperCase() || "I"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Instructor</p>
                      <p className="font-semibold">
                        {course.instructor_id.user_id?.name || "Instructor"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white dark:bg-gray-800 rounded shadow-sm">
              {course.video && course.video.trim() !== "" ? (
                <EnhancedVideoPlayer
                  videoUrl={course.video}
                  posterUrl={course.videoThumbnail || course.thumbnail}
                  className="aspect-video rounded overflow-hidden"
                />
              ) : course.externalUrl && course.externalUrl.trim() !== "" ? (
                <EnhancedVideoPlayer
                  videoUrl={course.externalUrl}
                  posterUrl={course.videoThumbnail || course.thumbnail}
                  className="aspect-video rounded overflow-hidden"
                />
              ) : (
                <div className="aspect-video rounded bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  {course.thumbnail || course.videoThumbnail ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={course.thumbnail || course.videoThumbnail || ""}
                        alt="Course preview"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-30" />
                      <p>No preview available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {course.description && (
              <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  About this course
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
              </div>
            )}

            {/* What You'll Learn */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  What You&apos;ll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.prerequisites.map((item, i) => {
                    const prerequisite =
                      typeof item === "string" ? item : JSON.stringify(item);
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {prerequisite}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Course Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-gray-800 rounded shadow-sm overflow-hidden">
                {/* Course Thumbnail */}
                <div className="relative rounded h-48 bg-gradient-to-br from-blue-600 to-blue-800">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  {/* Price */}
                  <div className="flex gap-3 items-center mb-4">
                    <p className="text-base text-gray-500 dark:text-gray-400">
                      Course Price:
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {formatPrice(course.price || 0)}
                    </p>
                  </div>

                  {/* ✅ No token prop needed anymore */}
                  <EnrollButton
                    courseId={course._id}
                    courseName={course.title}
                    isEnrolled={isEnrolled}
                    className="py-2.5 font-semibold text-sm shadow-md"
                  />

                  {/* Share */}
                  <div className="flex items-center justify-center gap-6 mb-6 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                      Course details
                    </h3>
                    <div className="space-y-3">
                      {course.duration_weeks && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Duration</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {course.duration_weeks} weeks
                          </span>
                        </div>
                      )}

                      {course.difficulty_level && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-sm">Level</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {course.difficulty_level}
                          </span>
                        </div>
                      )}

                      {course.is_certified && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Award className="w-5 h-5" />
                            <span className="text-sm">Certificate</span>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            Included
                          </span>
                        </div>
                      )}

                      {course.totalStudent > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="w-5 h-5" />
                            <span className="text-sm">Students Enrolled</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {course.totalStudent.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Institution Card */}
              {course.institution && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded shadow-sm p-6">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-4">
                    Institution
                  </h3>
                  <div className="flex items-center gap-3">
                    {course.institution.logo ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={course.institution.logo}
                          alt={course.institution.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                        {course.institution.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {course.institution.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
