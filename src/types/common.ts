import { EmbedSource, EmbedType } from './enum';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export type QueryValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;
export type QueryOptions = Record<string, QueryValue>;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: PaginationMeta;
}

// Raw API response shapes used by web app when normalizing server data.
export type RawContent = {
  id?: string | number;
  title?: string;
  type?: string;
  completed?: boolean;
  embedContent?: {
    source: EmbedSource;
    type?: EmbedType;
  };
  [key: string]: unknown;
};

export type LearnModuleContent = {
  id?: string | number;
  title?: string;
  description?: string;
  visibility?: string;
  estimatedTimeMinutes?: number;
  slug?: string;
  tags?: string[];
  contents?: RawContent[];
  [key: string]: unknown;
};

export type ProgressItem = {
  contentId?: string | number;
  status?: string;
  [key: string]: unknown;
};
