"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, BookOpen, Star, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/lib/api";
import { useInstitutions, useLandingData } from "@/lib/hooks/landing/use-landing-data";

// Type definition for Institution response
export interface InstitutionUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
}

export interface InstitutionResponse {
  _id: string;
  name: string;
  bio: string;
  logo?: string;
  user_id: InstitutionUser;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

type FilterType = "trending" | "new" | "oldest";

export default function LandingCourses() {
  const { landingData, loading } = useLandingData();
  const { institutions, loading: institutionsLoading } = useInstitutions();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);

  // Get courses based on active filter
  const displayedCourses = useMemo(() => {
    if (!landingData) return [];
    
    switch (activeFilter) {
      case "trending":
        return landingData.trending;
      case "new":
        return landingData.new;
      case "oldest":
        return [...landingData.new].reverse();
      default:
        return landingData.trending;
    }
  }, [landingData, activeFilter]);

  // Filter courses by search query
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return displayedCourses;
    
    const query = searchQuery.toLowerCase();
    return displayedCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.category?.name.toLowerCase().includes(query)
    );
  }, [displayedCourses, searchQuery]);

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "text-success";
      case "intermediate":
        return "text-accent";
      case "advanced":
        return "text-destructive";
      default:
        return "text-foreground-muted";
    }
  };

  const getModuleCount = (course: Course) => {
    return 2;
  };

  // Create loading skeleton institutions
  const loadingInstitutions: InstitutionResponse[] = Array.from({ length: 10 }).map((_, index) => ({
    _id: `loading-${index}`,
    name: "Institution",
    bio: "",
    user_id: {
      _id: `user-${index}`,
      email: "",
      name: "Institution",
      phone: "",
    },
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __v: 0,
  }));

  const displayInstitutions = institutionsLoading ? loadingInstitutions : institutions;

  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Main Content - Courses */}
          <div className="lg:col-span-3">
            {/* Header with Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-background p-1.5 border border-border shadow-sm">
                <button
                  onClick={() => setActiveFilter("trending")}
                  className={`px-6 py-2.5 font-medium text-sm transition-all ${
                    activeFilter === "trending"
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overall Rating
                </button>
                <button
                  onClick={() => setActiveFilter("new")}
                  className={`px-6 py-2.5 font-medium text-sm transition-all ${
                    activeFilter === "new"
                      ? "bg-primary-light text-panel-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setActiveFilter("oldest")}
                  className={`px-6 py-2.5 font-medium text-sm transition-all ${
                    activeFilter === "oldest"
                      ? "bg-primary-light text-panel-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Oldest
                </button>
              </div>

              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden border-0 shadow-sm">
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardContent className="p-5 space-y-3">
                      <div className="h-4 bg-muted animate-pulse w-3/4" />
                      <div className="h-3 bg-muted animate-pulse w-full" />
                      <div className="h-3 bg-muted animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No courses found
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="relative group"
                    onMouseEnter={() => setHoveredCourse(course)}
                    onMouseLeave={() => setHoveredCourse(null)}
                  >
                    {/* Main Card */}
                    <Link href={`/course/${course._id}`}>
                      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                        {/* Image */}
                        <div className="relative h-48 bg-muted">
                          {course.thumbnail ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-secondary" />
                          )}
                        </div>

                        <CardContent className="p-5">
                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge
                              variant="outline"
                              className="text-xs font-medium uppercase rounded-none border-none bg-transparent hover:bg-transparent"
                            >
                              {course.category?.name || "General"}
                            </Badge>

                            <Badge
                              className={`text-xs font-medium uppercase bg-background hover:bg-transparent ${getDifficultyColor(course.difficulty_level)}`}
                            >
                              {course.difficulty_level}
                            </Badge>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-foreground text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            {/* Duration */}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {course.duration_weeks
                                  ? `${course.duration_weeks} weeks`
                                  : "—"}
                              </span>
                            </div>

                            {/* Price */}
                            <span className="text-sm font-bold text-foreground">
                              {course.price === 0 ? (
                                "Free"
                              ) : (
                                <span>{course.price.toLocaleString()} RWF</span>
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Hover Popup */}
                    {hoveredCourse?._id === course._id && (
                      <div className="absolute inset-0 bg-background z-50 scale-105 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 ease-out shadow-xl">
                        <div className="p-6">
                          {/* Category Badge */}
                          <div className="mb-4">
                            <Badge
                              variant="outline"
                              className="text-sm font-medium uppercase rounded-none border-none"
                            >
                              {course.category?.name || "General"}
                            </Badge>
                          </div>

                          {/* Title */}
                          <h2 className="text-lg font-bold text-foreground mb-4">
                            {course.title}
                          </h2>

                          {/* Description */}
                          <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                            {course.description}
                          </p>

                          {/* Course Details Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                              <BookOpen className="h-4 w-4" />
                              <span>{getModuleCount(course)} Modules</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-foreground-muted">
                              <Clock className="h-4 w-4" />
                              <span>
                                {course.duration_weeks
                                  ? `${course.duration_weeks} weeks`
                                  : "4 hours"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[12px] text-foreground-muted">
                              <Star className="h-3 w-3" />
                              <span className="uppercase">
                                {course.difficulty_level}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[12px] text-foreground-muted">
                              <Lock className="h-3 w-3" />
                              <span>
                                {course.price === 0
                                  ? "Free"
                                  : `${course.price.toLocaleString()} RWF`}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Link href={`/course/${course._id}`} className="flex-1">
                            <button className="w-full bg-primary hover:bg-primary text-panel-foreground p-1 rounded">
                              Preview
                            </button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* View All Link */}
            {!loading && filteredCourses.length > 0 && (
              <div className="text-center mt-12">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium"
                >
                  View all courses
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Institutions Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  World-Class <span className="text-primary">Institutions</span>
                </h3>
                <p className="text-muted-foreground text-sm">
                  Top universities and companies
                </p>
              </div>
              <div className="relative h-96 overflow-hidden bg-background shadow-lg">
                <div className="flex flex-col animate-scroll-vertical space-y-4 p-4">
                  {displayInstitutions.map((institution) => (
                    <div key={institution._id} className="flex-shrink-0">
                      <div className="bg-surface p-3 hover:bg-muted transition-all duration-200 flex items-center space-x-3">
                        <div className="w-10 h-10 overflow-hidden bg-primary-muted border border-primary-muted rounded-md flex items-center justify-center flex-shrink-0">
                          {institution.logo ? (
                            <Image
                              src={institution.logo}
                              alt={institution.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-active font-bold text-xs">
                              {institution.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {institution.name}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
