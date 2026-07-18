'use client';

import Image from 'next/image';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function getInstitutionInitials(name: string, abbreviation?: string | null) {
  if (abbreviation?.trim()) return abbreviation.trim().slice(0, 3).toUpperCase();
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function InstitutionLogo({
  name,
  abbreviation,
  logo,
  size = 'md',
  className,
}: {
  name: string;
  abbreviation?: string | null;
  logo?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const dimension = size === 'sm' ? 36 : 44;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-md border border-border/70 bg-muted/40',
        size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
        className,
      )}
    >
      {logo ? (
        <Image
          src={logo}
          alt={`${name} logo`}
          width={dimension}
          height={dimension}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-semibold text-muted-foreground">
          {getInstitutionInitials(name, abbreviation) || (
            <Building2 className="h-4 w-4" />
          )}
        </div>
      )}
    </div>
  );
}
