export interface WishlistCourse {
  id: string;
  slug: string;
  title: string;
  thumbnail: string | null;
  shortDescription: string | null;
  status: string;
  accessType: string;
  publicPrice: number | null;
  publicCurrency: string | null;
  level: string | null;
  estimatedHours: number | null;
  institution: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  categories: Array<{
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export interface WishlistItem {
  id: string;
  learnerId: string;
  courseId: string;
  createdAt: string;
  course: WishlistCourse | null;
}

export interface WishlistListResponse {
  data: WishlistItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface WishlistCheckResponse {
  wishlisted: boolean;
  courseId: string;
}
