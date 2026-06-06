export function normalizeTagName(name: string): string {
  return name.trim();
}

export function hasDuplicateTagName(
  items: { name: string }[],
  candidate: string,
  excludeIndex?: number,
): boolean {
  const normalized = normalizeTagName(candidate).toLowerCase();
  if (!normalized) return false;

  return items.some((item, index) => {
    if (excludeIndex !== undefined && index === excludeIndex) {
      return false;
    }
    return normalizeTagName(item.name).toLowerCase() === normalized;
  });
}
