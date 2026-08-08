import type { CourseAccessType, CourseLevel } from '@/types/course';
import type { CourseLifecycleStatus } from '@/types/course-status';

export interface CatalogCategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogInstitution {
  id: string;
  name: string;
  logo: string | null;
}

export interface CatalogCourseCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnail: string | null;
  level: CourseLevel | null;
  language: string | null;
  accessType: CourseAccessType;
  status: CourseLifecycleStatus;
  publishedAt: string;
  estimatedHours: number | null;
  publicPrice: number | null;
  originalPrice?: number | null;
  discountEnabled?: boolean;
  discountType?: import('@/lib/course-pricing').DiscountType | null;
  discountValue?: number | null;
  discountStartAt?: string | null;
  discountEndAt?: string | null;
  isOnSale?: boolean;
  amountSaved?: number | null;
  discountPercentOff?: number | null;
  discountLabel?: string | null;
  institution: CatalogInstitution;
  categories: CatalogCategorySummary[];
  modulesCount: number;
  contentsCount: number;
}

export interface CatalogCourseDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  previewVideo: string | null;
  level: CourseLevel | null;
  language: string | null;
  accessType: CourseAccessType;
  estimatedHours: number | null;
  publicPrice: number | null;
  originalPrice?: number | null;
  discountEnabled?: boolean;
  discountType?: import('@/lib/course-pricing').DiscountType | null;
  discountValue?: number | null;
  discountStartAt?: string | null;
  discountEndAt?: string | null;
  isOnSale?: boolean;
  amountSaved?: number | null;
  discountPercentOff?: number | null;
  discountLabel?: string | null;
  publishedAt: string;
  categories: CatalogCategorySummary[];
  enrollmentCount: number;
  skills: string[];
  tools: string[];
  institution: {
    name: string;
    logo: string | null;
  };
  instructor: {
    name: string | null;
    profileImage: string | null;
  };
  curriculum: Array<{
    id: string;
    title: string;
    description: string | null;
  }>;
}

export interface CatalogFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: CourseLevel;
  language?: string;
  accessType?: CourseAccessType | 'FREE';
  institutionId?: string;
  category?: string;
  sort?: 'latest' | 'oldest';
}
