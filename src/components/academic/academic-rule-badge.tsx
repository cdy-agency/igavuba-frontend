import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AcademicRuleBadgeProps {
  required?: boolean;
  countsTowardCertificate?: boolean;
  blockProgressUntilPassed?: boolean;
  className?: string;
}

export function AcademicRuleBadges({
  required,
  countsTowardCertificate,
  blockProgressUntilPassed,
  className,
}: AcademicRuleBadgeProps) {
  const badges = [
    required
      ? { key: 'required', label: 'Required', className: 'border-blue-200 bg-blue-50 text-blue-700' }
      : null,
    countsTowardCertificate
      ? {
          key: 'certificate',
          label: 'Certificate',
          className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        }
      : null,
    blockProgressUntilPassed
      ? {
          key: 'blocking',
          label: 'Blocking',
          className: 'border-amber-200 bg-amber-50 text-amber-800',
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; className: string }>;

  if (badges.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {badges.map((badge) => (
        <Badge
          key={badge.key}
          variant="outline"
          className={cn('h-5 px-1.5 text-[10px] font-semibold uppercase', badge.className)}
        >
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
