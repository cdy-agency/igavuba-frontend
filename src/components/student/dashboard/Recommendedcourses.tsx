// "use client";

// import { useState } from "react";
// import { ChevronLeft, ChevronRight, Lock, BookOpen, Clock } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useNewCourses } from "@/lib/hooks/landing/use-landing-data";

// // Soft background colours cycled per card (no backend field needed)
// const CARD_COLORS = [
//   "bg-success/10",
//   "bg-primary-subtle",
//   "bg-accent/10",
//   "bg-secondary/10",
//   "bg-accent/10",
//   "bg-accent/10",
// ];

// const DIFFICULTY_COLORS: Record<string, string> = {
//   beginner:     "text-success bg-success/20",
//   intermediate: "text-accent bg-accent/20",
//   advanced:     "text-destructive bg-destructive/20",
// };

// const CARDS_PER_PAGE = 3;

// export default function RecommendedCourses() {
//   const { newCourses, loading } = useNewCourses();
//   const [page, setPage] = useState(0);

//   const totalPages = Math.ceil(newCourses.length / CARDS_PER_PAGE);
//   const visible    = newCourses.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

//   const prev = () => setPage((p) => Math.max(0, p - 1));
//   const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

//   return (
//     <div className="bg-background rounded p-6 shadow-sm border border-border">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h2 className="text-xl font-bold text-foreground">Recommended for you</h2>
//           {!loading && newCourses.length > 0 && (
//             <p className="text-xs text-muted-foreground mt-0.5">{newCourses.length} new courses available</p>
//           )}
//         </div>

//         {totalPages > 1 && (
//           <div className="flex gap-2">
//             <button
//               onClick={prev}
//               disabled={page === 0}
//               className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               <ChevronLeft className="w-4 h-4 text-muted-foreground" />
//             </button>
//             <button
//               onClick={next}
//               disabled={page === totalPages - 1}
//               className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               <ChevronRight className="w-4 h-4 text-muted-foreground" />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Skeleton */}
//       {loading && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {Array.from({ length: CARDS_PER_PAGE }).map((_, i) => (
//             <div key={i} className="rounded-2xl bg-muted animate-pulse min-h-[260px]" />
//           ))}
//         </div>
//       )}

//       {/* Empty state */}
//       {!loading && newCourses.length === 0 && (
//         <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
//           <BookOpen className="w-8 h-8 opacity-40" />
//           <p className="text-sm font-medium">No new courses available right now</p>
//         </div>
//       )}

//       {/* Cards */}
//       {!loading && newCourses.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {visible.map((course, idx) => {
//             const bg         = CARD_COLORS[(page * CARDS_PER_PAGE + idx) % CARD_COLORS.length];
//             const difficulty = DIFFICULTY_COLORS[course.difficulty_level] ?? "text-foreground-muted bg-muted";

//             return (
//               <div
//                 key={course._id}
//                 className={`${bg} rounded p-5 flex flex-col justify-between min-h-[260px] transition-all hover:shadow-md`}
//               >
//                 {/* Top section */}
//                 <div className="flex-1">
//                   {/* Thumbnail or gradient placeholder */}
//                   <div className="relative w-full h-28 rounded overflow-hidden mb-4">
//                     {course.thumbnail ? (
//                       <Image
//                         src={course.thumbnail}
//                         alt={course.title}
//                         fill
//                         className="object-cover"
//                       />
//                     ) : (
//                       <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-secondary" />
//                     )}
//                   </div>

//                   {/* Category + difficulty */}
//                   <div className="flex items-center gap-2 mb-2 flex-wrap">
//                     <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide truncate">
//                       {course.category?.name ?? "—"}
//                     </span>
//                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${difficulty}`}>
//                       {course.difficulty_level}
//                     </span>
//                   </div>

//                   {/* Title */}
//                   <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2">
//                     {course.title}
//                   </h3>

//                   {/* Meta */}
//                   <div className="flex items-center gap-3 text-xs text-muted-foreground">
//                     {course.duration_weeks && (
//                       <span className="flex items-center gap-1">
//                         <Clock className="w-3 h-3" />
//                         {course.duration_weeks}w
//                       </span>
//                     )}
//                     <span className="font-semibold text-foreground-muted ml-auto">
//                       {course.price === 0 ? "Free" : `${course.price.toLocaleString()} RWF`}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Enroll button */}
//                 <Link href={`/course/${course._id}`} className="mt-4 block">
//                   <button className="w-full text-primary  underline hover:text-primary/80 text-sm font-medium flex items-center justify-center gap-2">
//                     View Course
//                   </button>
//                 </Link>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Page dots */}
//       {totalPages > 1 && (
//         <div className="flex justify-center gap-1.5 mt-5">
//           {Array.from({ length: totalPages }).map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setPage(i)}
//               className={`w-1.5 h-1.5 rounded-full transition-all ${
//                 i === page ? "bg-primary w-4" : "bg-border"
//               }`}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }