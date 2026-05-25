// "use client";

// import { useState, useMemo, useCallback, useEffect } from "react";
// import { CourseFilters } from "@/components/landingpages/Course/courseFilter";
// import { CourseListItem } from "@/components/landingpages/Course/courseItem";
// import { CourseSearchSort } from "@/components/landingpages/Course/courseSearch";
// import { Pagination } from "@/components/ui/pagination";
// import {
//   useCourses,
//   useCategories,
//   useInstructors,
// } from "@/context/courseContext";
// import { useInstitutions } from "@/lib/hooks/landing/use-landing-data";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import LandingHeader from "@/components/landingpages/header";
// import { useSearchParams } from "next/navigation";

// // Type definitions for query params
// export type SortOption =
//   | "trending"
//   | "newest"
//   | "oldest"
//   | "price_low"
//   | "price_high";
// export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
// export type PricingOption = "free" | "paid";

// export interface CourseQueryParams {
//   page: number;
//   limit: number;
//   sort: SortOption;
//   q?: string;
//   category?: string;
//   difficulty?: DifficultyLevel;
//   price_max?: number;
//   price_min?: number;
//   institution?: string;
//   instructor?: string;
// }

// const ITEMS_PER_PAGE = 12;

// export default function CoursesPage() {
//   const searchParams = useSearchParams();

//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortBy, setSortBy] = useState<SortOption>("trending");

//   // Filter states
//   const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
//   const [selectedDifficulties, setSelectedDifficulties] = useState<
//     DifficultyLevel[]
//   >([]);
//   const [selectedPricing, setSelectedPricing] = useState<
//     PricingOption | undefined
//   >();
//   const [selectedInstitutionIds, setSelectedInstitutionIds] = useState<
//     string[]
//   >([]);
//   const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>(
//     [],
//   );

//   // Panel visibility states
//   const [isCategoryOpen, setIsCategoryOpen] = useState(true);
//   const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
//   const [isPricingOpen, setIsPricingOpen] = useState(false);
//   const [isInstitutionsOpen, setIsInstitutionsOpen] = useState(false);
//   const [isInstructorsOpen, setIsInstructorsOpen] = useState(false);

//   // Read URL params on mount and set initial filters
//   useEffect(() => {
//     const categoryParam = searchParams.get("category");
//     const difficultyParam = searchParams.get("difficulty");
//     const pricingParam = searchParams.get("pricing");
//     const searchParam = searchParams.get("q");

//     if (categoryParam) {
//       setSelectedCategoryIds([categoryParam]);
//     }

//     if (
//       difficultyParam &&
//       ["beginner", "intermediate", "advanced"].includes(difficultyParam)
//     ) {
//       setSelectedDifficulties([difficultyParam as DifficultyLevel]);
//     }

//     if (pricingParam && ["free", "paid"].includes(pricingParam)) {
//       setSelectedPricing(pricingParam as PricingOption);
//     }

//     if (searchParam) {
//       setSearchQuery(searchParam);
//     }
//   }, [searchParams]);

//   const queryParams = useMemo(() => {
//     const params: CourseQueryParams = {
//       page: currentPage,
//       limit: ITEMS_PER_PAGE,
//       sort: sortBy,
//     };

//     if (searchQuery) {
//       params.q = searchQuery;
//     }

//     // Support multiple categories
//     if (selectedCategoryIds.length > 0) {
//       params.category = selectedCategoryIds[0];
//     }

//     // FIXED: Support multiple difficulties
//     if (selectedDifficulties.length > 0) {
//       params.difficulty = selectedDifficulties[0];
//     }

//     // Pricing filter
//     if (selectedPricing === "free") {
//       params.price_max = 0;
//     } else if (selectedPricing === "paid") {
//       params.price_min = 1;
//     }

//     // Support multiple institutions
//     if (selectedInstitutionIds.length > 0) {
//       params.institution = selectedInstitutionIds[0];
//     }

//     // FIXED: Support multiple instructors
//     if (selectedInstructorIds.length > 0) {
//       params.instructor = selectedInstructorIds[0];
//     }

//     return params;
//   }, [
//     currentPage,
//     sortBy,
//     searchQuery,
//     selectedCategoryIds,
//     selectedDifficulties,
//     selectedPricing,
//     selectedInstitutionIds,
//     selectedInstructorIds,
//   ]);

//   const {
//     courses: apiCourses,
//     loading: coursesLoading,
//     error: coursesError,
//     pagination,
//   } = useCourses(queryParams);

//   const { categories: rawCategories, loading: categoriesLoading } =
//     useCategories();
//   const { institutions, loading: institutionsLoading } = useInstitutions();
//   const { instructors, loading: instructorsLoading } = useInstructors();

//   // Client-side filtering as safety net (in case API doesn't filter correctly)
//   const courses = useMemo(() => {
//     if (!apiCourses) return [];

//     const filtered = apiCourses.filter((course) => {
//       // Filter by difficulty
//       if (selectedDifficulties.length > 0) {
//         if (
//           !selectedDifficulties.includes(
//             course.difficulty_level as DifficultyLevel,
//           )
//         ) {
//           console.warn("⚠️ Filtering out course - Wrong difficulty:", {
//             course: course.title,
//             actual: course.difficulty_level,
//             expected: selectedDifficulties,
//           });
//           return false;
//         }
//       }

//       // Filter by category
//       if (selectedCategoryIds.length > 0) {
//         if (!selectedCategoryIds.includes(course.category?._id || "")) {
//           console.warn("⚠️ Filtering out course - Wrong category:", {
//             course: course.title,
//             actual: course.category?._id,
//             expected: selectedCategoryIds,
//           });
//           return false;
//         }
//       }

//       // Filter by pricing
//       if (selectedPricing === "free" && course.price > 0) {
//         console.warn("⚠️ Filtering out course - Should be free:", {
//           course: course.title,
//           price: course.price,
//         });
//         return false;
//       }
//       if (selectedPricing === "paid" && course.price === 0) {
//         console.warn("⚠️ Filtering out course - Should be paid:", {
//           course: course.title,
//           price: course.price,
//         });
//         return false;
//       }

//       // Filter by institution
//       if (selectedInstitutionIds.length > 0) {
//         if (!selectedInstitutionIds.includes(course.institution?._id || "")) {
//           console.warn("⚠️ Filtering out course - Wrong institution:", {
//             course: course.title,
//             actual: course.institution?._id,
//             expected: selectedInstitutionIds,
//           });
//           return false;
//         }
//       }

//       // Filter by instructor
//       if (selectedInstructorIds.length > 0) {
//         if (!selectedInstructorIds.includes(course.instructor_id?._id || "")) {
//           console.warn("⚠️ Filtering out course - Wrong instructor:", {
//             course: course.title,
//             actual: course.instructor_id?._id,
//             expected: selectedInstructorIds,
//           });
//           return false;
//         }
//       }

//       return true;
//     });

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       return filtered.filter(
//         (course) =>
//           course.title?.toLowerCase().includes(q) ||
//           course.description?.toLowerCase().includes(q),
//       );
//     }

//     return filtered;
//   }, [
//     apiCourses,
//     searchQuery,
//     selectedDifficulties,
//     selectedCategoryIds,
//     selectedPricing,
//     selectedInstitutionIds,
//     selectedInstructorIds,
//   ]);

//   // Categories are flat from API
//   const categories = rawCategories ?? [];

//   // Map categoryId -> name
//   const categoryMap = useMemo(() => {
//     const map = new Map<string, string>();
//     (rawCategories ?? []).forEach((cat) => {
//       map.set(cat._id, cat.name);
//     });
//     return map;
//   }, [rawCategories]);

//   // HANDLERS
//   const handlePageChange = useCallback((page: number) => {
//     setCurrentPage(page);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, []);

//   const handleSearchChange = useCallback((query: string) => {
//     setSearchQuery(query);
//     setCurrentPage(1);
//   }, []);

//   const handleSortChange = useCallback((sort: SortOption) => {
//     setSortBy(sort);
//     setCurrentPage(1);
//   }, []);

//   const handleToggleCategory = useCallback((categoryId: string) => {
//     setSelectedCategoryIds((prev) => {
//       const newIds = prev.includes(categoryId)
//         ? prev.filter((id) => id !== categoryId)
//         : [...prev, categoryId];
//       return newIds;
//     });
//     setCurrentPage(1);
//   }, []);

//   const handleToggleDifficulty = useCallback((difficulty: DifficultyLevel) => {
//     setSelectedDifficulties((prev) => {
//       const newDifficulties = prev.includes(difficulty)
//         ? prev.filter((d) => d !== difficulty)
//         : [...prev, difficulty];
//       return newDifficulties;
//     });
//     setCurrentPage(1);
//   }, []);

//   const handlePricingChange = useCallback(
//     (pricing: PricingOption | undefined) => {
//       setSelectedPricing(pricing);
//       setCurrentPage(1);
//     },
//     [],
//   );

//   const handleToggleInstitution = useCallback((institutionId: string) => {
//     setSelectedInstitutionIds((prev) => {
//       const newIds = prev.includes(institutionId)
//         ? prev.filter((id) => id !== institutionId)
//         : [...prev, institutionId];
//       return newIds;
//     });
//     setCurrentPage(1);
//   }, []);

//   const handleToggleInstructor = useCallback((instructorId: string) => {
//     setSelectedInstructorIds((prev) => {
//       const newIds = prev.includes(instructorId)
//         ? prev.filter((id) => id !== instructorId)
//         : [...prev, instructorId];
//       return newIds;
//     });
//     setCurrentPage(1);
//   }, []);

//   const handleClearFilters = useCallback(() => {
//     setSelectedCategoryIds([]);
//     setSelectedDifficulties([]);
//     setSelectedPricing(undefined);
//     setSelectedInstitutionIds([]);
//     setSelectedInstructorIds([]);
//     setSearchQuery("");
//     setCurrentPage(1);
//   }, []);

//   // Check if any filters are active
//   const hasActiveFilters = useMemo(() => {
//     return (
//       selectedCategoryIds.length > 0 ||
//       selectedDifficulties.length > 0 ||
//       selectedPricing !== undefined ||
//       selectedInstitutionIds.length > 0 ||
//       selectedInstructorIds.length > 0 ||
//       searchQuery !== ""
//     );
//   }, [
//     selectedCategoryIds,
//     selectedDifficulties,
//     selectedPricing,
//     selectedInstitutionIds,
//     selectedInstructorIds,
//     searchQuery,
//   ]);

//   return (
//     <div className="min-h-screen bg-background">
//       <LandingHeader />
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
//             Explore Our Courses
//           </h1>
//           <p className="text-muted-foreground">
//             Discover and learn from our extensive collection of courses
//           </p>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           {/* Filters Sidebar */}
//           <CourseFilters
//             categories={categories}
//             categoriesLoading={categoriesLoading}
//             selectedCategoryIds={selectedCategoryIds}
//             onToggleCategory={handleToggleCategory}
//             selectedDifficulties={selectedDifficulties}
//             onToggleDifficulty={handleToggleDifficulty}
//             selectedPricing={selectedPricing}
//             onPricingChange={handlePricingChange}
//             institutions={institutions}
//             institutionsLoading={institutionsLoading}
//             selectedInstitutionIds={selectedInstitutionIds}
//             onToggleInstitution={handleToggleInstitution}
//             instructors={instructors}
//             instructorsLoading={instructorsLoading}
//             selectedInstructorIds={selectedInstructorIds}
//             onToggleInstructor={handleToggleInstructor}
//             isCategoryOpen={isCategoryOpen}
//             isDifficultyOpen={isDifficultyOpen}
//             isPricingOpen={isPricingOpen}
//             isInstitutionsOpen={isInstitutionsOpen}
//             isInstructorsOpen={isInstructorsOpen}
//             onCategoryToggle={() => setIsCategoryOpen(!isCategoryOpen)}
//             onDifficultyToggle={() => setIsDifficultyOpen(!isDifficultyOpen)}
//             onPricingToggle={() => setIsPricingOpen(!isPricingOpen)}
//             onInstitutionsToggle={() =>
//               setIsInstitutionsOpen(!isInstitutionsOpen)
//             }
//             onInstructorsToggle={() => setIsInstructorsOpen(!isInstructorsOpen)}
//           />

//           {/* Courses List */}
//           <div className="md:col-span-3">
//             {/* Search and Sort */}
//             <div className="mb-6">
//               <CourseSearchSort
//                 searchQuery={searchQuery}
//                 onSearchChange={handleSearchChange}
//                 sortBy={sortBy}
//                 onSortChange={handleSortChange}
//                 totalResults={courses.length}
//               />
//             </div>

//             {/* Active Filters Badge */}
//             {hasActiveFilters && (
//               <div className="mb-4 flex items-center gap-2">
//                 <span className="text-sm text-muted-foreground">
//                   Active filters applied
//                 </span>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleClearFilters}
//                   className="h-7 text-xs"
//                 >
//                   Clear all filters
//                 </Button>
//               </div>
//             )}

//             {/* Loading State */}
//             {coursesLoading && (
//               <div className="flex items-center justify-center py-20">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//               </div>
//             )}

//             {/* Error State */}
//             {coursesError && (
//               <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
//                 <p className="text-destructive font-medium">
//                   Failed to load courses
//                 </p>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   {coursesError}
//                 </p>
//               </div>
//             )}

//             {/* Empty State */}
//             {!coursesLoading && !coursesError && courses.length === 0 && (
//               <div className="bg-muted/50 rounded-lg p-12 text-center">
//                 <p className="text-lg font-medium text-foreground mb-2">
//                   No courses found
//                 </p>
//                 <p className="text-muted-foreground mb-4">
//                   Try adjusting your filters or search query
//                 </p>
//                 {hasActiveFilters && (
//                   <Button variant="outline" onClick={handleClearFilters}>
//                     Clear all filters
//                   </Button>
//                 )}
//               </div>
//             )}

//             {/* Courses List */}
//             {!coursesLoading && !coursesError && courses.length > 0 && (
//               <div className="bg-card">
//                 <div className="divide-y divide-gray-200 dark:divide-gray-700/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {courses.map((course) => (
//                     <CourseListItem
//                       key={course._id}
//                       course={course}
//                       categoryName={categoryMap.get(course.category._id)}
//                     />
//                   ))}
//                 </div>

//                 {/* Pagination */}
//                 {pagination && pagination.totalPages > 1 && (
//                   <div className="mt-6">
//                     <Pagination
//                       currentPage={pagination.currentPage}
//                       totalPages={pagination.totalPages}
//                       onPageChange={handlePageChange}
//                       itemsPerPage={ITEMS_PER_PAGE}
//                       totalItems={courses.length} // Use filtered count
//                     />
//                     {courses.length !== pagination.totalCourses && (
//                       <p className="text-xs text-yellow-600 mt-2 text-center">
//                         ⚠️ Showing {courses.length} of {pagination.totalCourses}{" "}
//                         courses (API filtering not working correctly)
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
