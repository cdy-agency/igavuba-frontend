export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  publishedCourseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface CategoryMutationResponse {
  success: boolean;
  message: string;
  data: Category;
}
