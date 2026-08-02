export type ReviewSort = 'newest' | 'highest' | 'lowest';

export interface CourseReview {
  id: string;
  courseId: string;
  learnerId: string;
  rating: number;
  title: string;
  comment: string;
  verifiedLearner: boolean;
  isPublished?: boolean;
  isHidden?: boolean;
  hiddenReason?: string | null;
  createdAt: string;
  updatedAt: string;
  learner: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnail: string | null;
    institutionName: string;
  };
}

export interface ReviewDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: ReviewDistribution;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  sort?: ReviewSort;
  rating?: number;
  search?: string;
}

export interface ReviewListResponse {
  data: CourseReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ReviewEligibility {
  canReview: boolean;
  isEnrolled: boolean;
  isCompleted: boolean;
  hasReview: boolean;
  myReview: CourseReview | null;
}

export interface CreateReviewPayload {
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  distribution: ReviewDistribution;
  highestRatedCourses: Array<{
    courseId: string;
    title: string;
    slug: string;
    averageRating: number;
    totalReviews: number;
  }>;
  lowestRatedCourses: Array<{
    courseId: string;
    title: string;
    slug: string;
    averageRating: number;
    totalReviews: number;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
    course: { id: string; title: string; slug: string };
    learner: { id: string; name: string | null; profileImage: string | null };
    verifiedLearner: boolean;
  }>;
}
