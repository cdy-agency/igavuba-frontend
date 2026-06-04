export function formatDuration(durationWeeks?: number) {
  if (!durationWeeks) {
    return "-";
  }

  return `${durationWeeks} ${durationWeeks === 1 ? "week" : "weeks"}`;
}

export function formatDifficulty(difficulty?: string) {
  if (!difficulty) {
    return "General";
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

export function getAccessStatus(price?: number) {
  return !price || price <= 0 ? "Free" : "Paid";
}

export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => callback(...args), delay);
  };
}
