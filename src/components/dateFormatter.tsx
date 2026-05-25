interface DateFormatterProps {
  value?: string;   // can be undefined from API
  fallback?: string; // default text if value is missing/invalid
  options?: Intl.DateTimeFormatOptions;
}

export default function DateFormatter({
  value,
  fallback = "N/A",
  options = { year: "numeric", month: "long", day: "numeric" },
}: DateFormatterProps) {
  if (!value) return <span>{fallback}</span>;

  const date = new Date(value);
  if (isNaN(date.getTime())) return <span>{fallback}</span>;

  return <span>{date.toLocaleDateString("en-US", options)}</span>;
}