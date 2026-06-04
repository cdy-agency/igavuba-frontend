export interface Category {
  _id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  courseCount: number;
}

export interface Institution {
  _id: string;
  name: string;
  logo?: string;
}

export interface Instructor {
  _id: string;
  name?: string;
  profession_name?: string;
  user_id?: {
    name?: string;
  };
}

export interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videoThumbnail?: string;
  video?: string;
  externalUrl?: string;
  price: number;
  duration_weeks?: number;
  difficulty_level?: string;
  is_certified?: boolean;
  totalStudent: number;
  prerequisites?: unknown[];
  category: Category;
  institution?: Institution;
  instructor_id?: Instructor;
}
