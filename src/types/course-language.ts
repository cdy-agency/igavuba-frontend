export const COURSE_LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'rw', label: 'Kinyarwanda' },
  { value: 'sw', label: 'Swahili' },
] as const;

export type CourseLanguageCode = (typeof COURSE_LANGUAGE_OPTIONS)[number]['value'];

export const COURSE_LANGUAGE_CODES = COURSE_LANGUAGE_OPTIONS.map(
  (option) => option.value,
) as [CourseLanguageCode, ...CourseLanguageCode[]];

export function getCourseLanguageLabel(code: string | null | undefined): string {
  if (!code) return '—';
  const match = COURSE_LANGUAGE_OPTIONS.find((option) => option.value === code);
  return match?.label ?? code;
}

export function isCourseLanguageCode(
  value: string | null | undefined,
): value is CourseLanguageCode {
  if (!value) return false;
  return COURSE_LANGUAGE_CODES.includes(value as CourseLanguageCode);
}
