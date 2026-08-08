export function formatRelativeTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (Number.isNaN(diffMinutes) || diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function getNotificationHref(actionUrl: string | null | undefined) {
  if (!actionUrl) return null;
  try {
    return new URL(actionUrl).pathname + new URL(actionUrl).search;
  } catch {
    return actionUrl.startsWith('/') ? actionUrl : `/${actionUrl}`;
  }
}
