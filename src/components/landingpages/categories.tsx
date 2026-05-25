"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/lib/hooks/landing/use-landing-data";
import { Category } from "@/lib/api";

export default function LandingCategories() {
  const { categories, loading } = useCategories();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });

    setTimeout(checkScrollButtons, 300);
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-12 lg:mb-16 flex flex-col text-center items-center">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Discover Our Courses By Categories.
          </h2>
        </div>

        {/* Cards Container with Navigation */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* Scrollable Cards */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[340px] h-[420px] bg-white animate-pulse"
                />
              ))
            ) : categories.length === 0 ? (
              <div className="w-full text-center py-12 text-gray-500">
                No categories available
              </div>
            ) : (
              categories.map((category, index) => (
                <Link
                  key={category._id || `category-${index}`}
                  href={`/course?category=${category._id}`}
                  className="flex-shrink-0 w-[340px] group"
                >
                  <div className="bg-secondary p-6 h-full flex flex-col transition-transform hover:-translate-y-2">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-foreground rounded-full text-sm font-medium inline-block">
                        All Levels
                      </span>

                      {/* Course Count Badge */}
                      {category.courseCount > 0 && (
                        <span className="bg-primary text-white px-2 py-1 rounded text-sm font-semibold inline-block">
                          {category.courseCount} {category.courseCount === 1 ? "course" : "courses"}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {category.name}
                    </h3>

                    {/* Description/Info */}
                    <p className="text-gray-700 text-sm mb-6">
                      {category.description ||
                        `${category.courseCount} ${category.courseCount === 1 ? "course" : "courses"} available.`}
                    </p>

                    {/* Image Placeholder */}
                    <div className="mt-auto bg-white overflow-hidden shadow-md">
                      {category.thumbnail ? (
                        <div className="relative w-full aspect-[4/3]">
                          <Image
                            src={category.thumbnail}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-6xl font-bold text-gray-300">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes scroll-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        .animate-scroll-vertical {
          animation: scroll-vertical 20s linear infinite;
        }

        .animate-scroll-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}