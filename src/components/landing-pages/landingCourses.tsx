'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { PublicCatalogCourseCard } from '@/components/public/catalog-course-card';
import { useCatalogCourses, useCatalogInstitutions, useFeaturedCatalogCourses } from '@/hooks/use-catalog';
import type { CatalogCourseCard, CatalogInstitution } from '@/types/catalog';

type FilterType = 'trending' | 'new' | 'oldest';

export default function LandingCourses() {
  const { data: featuredCourses = [], isPending: featuredLoading } = useFeaturedCatalogCourses();
  const { data: catalogPage, isPending: catalogLoading } = useCatalogCourses({
    page: 1,
    limit: 24,
    sort: 'latest',
  });
  const { data: institutions = [], isPending: institutionsLoading } = useCatalogInstitutions();

  const [activeFilter, setActiveFilter] = useState<FilterType>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  const allCourses = catalogPage?.data ?? [];

  const displayedCourses = useMemo(() => {
    switch (activeFilter) {
      case 'trending':
        return featuredCourses.length > 0 ? featuredCourses : allCourses.slice(0, 6);
      case 'new':
        return allCourses;
      case 'oldest':
        return [...allCourses].reverse();
      default:
        return featuredCourses.length > 0 ? featuredCourses : allCourses.slice(0, 6);
    }
  }, [activeFilter, allCourses, featuredCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return displayedCourses;

    const query = searchQuery.toLowerCase();
    return displayedCourses.filter((course: CatalogCourseCard) => {
      const categoryName = course.categories[0]?.name?.toLowerCase() ?? '';
      return (
        course.title.toLowerCase().includes(query) ||
        course.subtitle?.toLowerCase().includes(query) ||
        categoryName.includes(query)
      );
    });
  }, [displayedCourses, searchQuery]);

  const loading = featuredLoading || catalogLoading;

  const loadingInstitutions: CatalogInstitution[] = institutionsLoading
    ? Array.from({ length: 10 }).map((_, index) => ({
        id: `loading-${index}`,
        name: 'Institution',
        logo: null,
      }))
    : institutions;

  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-2 bg-background p-1.5 border border-border shadow-sm">
                <button
                  onClick={() => setActiveFilter('trending')}
                  className={`px-6 py-2.5 font-medium text-sm transition-all ${
                    activeFilter === 'trending'
                      ? 'bg-background text-foreground shadow-sm border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Overall Rating
                </button>
                <button
                  onClick={() => setActiveFilter('new')}
                  className={`px-6 py-2.5 font-medium text-sm transition-all ${
                    activeFilter === 'new'
                      ? 'bg-primary-light text-panel-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setActiveFilter('oldest')}
                  className={`px-6 py-2.5 font-medium text-sm transition-all ${
                    activeFilter === 'oldest'
                      ? 'bg-primary-light text-panel-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Oldest
                </button>
              </div>

              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="overflow-hidden border-0 shadow-sm rounded-lg">
                      <div className="h-48 bg-muted animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-muted animate-pulse w-3/4" />
                        <div className="h-3 bg-muted animate-pulse w-full" />
                        <div className="h-3 bg-muted animate-pulse w-2/3" />
                      </div>
                    </div>
                  ))
                : filteredCourses.length === 0
                  ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                      No courses found
                    </div>
                  )
                  : filteredCourses.map((course: CatalogCourseCard) => (
                      <PublicCatalogCourseCard key={course.id} course={course} />
                    ))}
            </div>

            {!loading && filteredCourses.length > 0 ? (
              <div className="text-center mt-12">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-medium"
                >
                  View all courses
                  <span>→</span>
                </Link>
              </div>
            ) : null}
          </div>

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
                  {loadingInstitutions.map((institution) => (
                    <div key={institution.id} className="flex-shrink-0">
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
