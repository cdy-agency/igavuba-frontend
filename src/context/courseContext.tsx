// import { useState, useEffect, useCallback } from "react";
// import type {
//   Course,
//   CoursesApiResponse,
//   CoursesQueryParams,
//   Category,
//   Institution,
//   Instructor,
// } from "@/types/course";
// import { API_URL } from "@/lib/axios";

// // COURSES HOOK 
// interface UseCoursesResult {
//   courses: Course[];
//   loading: boolean;
//   error: string | null;
//   pagination: CoursesApiResponse["pagination"] | null;
//   refetch: () => void;
// }

// export function useCourses(params: CoursesQueryParams): UseCoursesResult {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pagination, setPagination] = useState<
//     CoursesApiResponse["pagination"] | null
//   >(null);

//   const fetchCourses = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);


//       const response = await fetch(
//         `${API_URL}/api/public/courses`,
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch courses");
//       }

//       const data: CoursesApiResponse = await response.json();

//       if (data.success) {
//         setCourses(data.data);
//         setPagination(data.pagination);
//       } else {
//         throw new Error("API returned unsuccessful response");
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//       setCourses([]);
//       setPagination(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [params]);

//   useEffect(() => {
//     fetchCourses();
//   }, [fetchCourses]);

//   return {
//     courses,
//     loading,
//     error,
//     pagination,
//     refetch: fetchCourses,
//   };
// }

// // CATEGORIES HOOK
// interface UseCategoriesResult {
//   categories: Category[];
//   loading: boolean;
//   error: string | null;
// }

// export function useCategories(): UseCategoriesResult {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(`${API_URL}/api/public/categories`);

//       if (!response.ok) {
//         throw new Error("Failed to fetch categories");
//       }

//       const data = await response.json();

//       if (data.success && Array.isArray(data.data)) {
//         setCategories(data.data);
//       } else {
//         setCategories([]);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An error occurred");
//       setCategories([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchCategories();
// }, []);


//   return { categories, loading, error };
// }

// // INSTITUTIONS HOOK 

// interface UseInstitutionsResult {
//   institutions: Institution[];
//   loading: boolean;
//   error: string | null;
// }

// export function useInstitutions(): UseInstitutionsResult {
//   const [institutions, setInstitutions] = useState<Institution[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchInstitutions = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await fetch(`${API_URL}/api/institutions`);

//         if (!response.ok) {
//           throw new Error("Failed to fetch institutions");
//         }

//         const data = await response.json();
//         setInstitutions(data.data || data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "An error occurred");
//         setInstitutions([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInstitutions();
//   }, []);

//   return { institutions, loading, error };
// }

// // INSTRUCTORS HOOK

// interface UseInstructorsResult {
//   instructors: Instructor[];
//   loading: boolean;
//   error: string | null;
// }

// export function useInstructors(): UseInstructorsResult {
//   const [instructors, setInstructors] = useState<Instructor[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchInstructors = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await fetch(`${API_URL}/api/public/instructors`);

//         if (!response.ok) {
//           throw new Error("Failed to fetch instructors");
//         }

//         const data = await response.json();
//         setInstructors(data.data || data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "An error occurred");
//         setInstructors([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInstructors();
//   }, []);

//   return { instructors, loading, error };
// }
