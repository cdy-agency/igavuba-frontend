import { CourseAccessType } from '@/types/course';
import type { CatalogCategorySummary, CatalogCourseCard } from '@/types/catalog';

export function getPrimaryCategoryName(
  course: Pick<CatalogCourseCard, 'categories'> | { categories?: CatalogCategorySummary[] },
): string {
  return course.categories?.[0]?.name ?? 'General';
}

export function formatCatalogLevel(level: CatalogCourseCard['level']): string {
  if (!level) return 'All Levels';
  return level.charAt(0) + level.slice(1).toLowerCase();
}

export function formatCatalogPrice(course: Pick<CatalogCourseCard, 'accessType' | 'publicPrice'>) {
  if (
    course.accessType === CourseAccessType.PUBLIC_FREE ||
    !course.publicPrice ||
    course.publicPrice <= 0
  ) {
    return 'Free';
  }

  return `${course.publicPrice.toLocaleString()} RWF`;
}

export function formatCatalogDuration(hours: number | null | undefined): string {
  if (!hours || hours <= 0) {
    return '—';
  }

  if (hours >= 168 && hours % 168 === 0) {
    const weeks = hours / 168;
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export function getDifficultyColor(level?: string | null) {
  switch (level?.toLowerCase()) {
    case 'beginner':
      return 'text-success';
    case 'intermediate':
      return 'text-accent';
    case 'advanced':
      return 'text-destructive';
    default:
      return 'text-foreground-muted';
  }
}

export function formatPublishedDate(date: string | null | undefined): string {
  if (!date) return 'Recently updated';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Recently updated';

  return parsed.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function formatCatalogLanguage(language: string | null | undefined): string {
  if (!language) return 'English';
  return language.charAt(0) + language.slice(1).toLowerCase();
}
