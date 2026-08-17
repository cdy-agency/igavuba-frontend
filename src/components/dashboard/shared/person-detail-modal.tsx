'use client';

import { format } from 'date-fns';
import { Mail, Phone, Shield, UserRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPersonInitials, ModernStatusBadge } from '@/components/dashboard/shared/modern-table';
import { cn } from '@/lib/utils';

function DetailRow({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const content = href ? (
    <a href={href} className="font-medium text-primary hover:underline">
      {value}
    </a>
  ) : (
    <span className="font-medium text-foreground">{value}</span>
  );

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
      {Icon ? (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 break-all text-sm">{content}</div>
      </div>
    </div>
  );
}

export function PersonDetailModal({
  open,
  onOpenChange,
  title = 'User details',
  name,
  email,
  phoneNumber,
  profileImage,
  subtitle,
  statusBadge,
  sections,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  name: string | null;
  email: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  subtitle?: string | null;
  statusBadge?: React.ReactNode;
  sections: Array<{
    title: string;
    rows: Array<{
      label: string;
      value: React.ReactNode;
    }>;
  }>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Contact and account information</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-start gap-4 rounded-xl border border-border/70 bg-muted/15 p-4">
            <Avatar className="h-14 w-14 border border-border/60">
              {profileImage ? <AvatarImage src={profileImage} alt={name ?? email} /> : null}
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {getPersonInitials(name, email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-lg font-semibold text-foreground">{name?.trim() || 'Unnamed user'}</p>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
              {statusBadge}
            </div>
          </div>

          <div className="grid gap-2">
            <DetailRow
              label="Email"
              value={email}
              icon={Mail}
              href={`mailto:${email}`}
            />
            <DetailRow
              label="Phone"
              value={phoneNumber?.trim() || 'Not provided'}
              icon={Phone}
              href={phoneNumber?.trim() ? `tel:${phoneNumber.replace(/\s/g, '')}` : undefined}
            />
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              </div>
              <div className="grid gap-2">
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className={cn('text-right font-medium text-foreground')}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function formatDetailDate(value?: string | null) {
  if (!value) return '—';
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return value;
  }
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <ModernStatusBadge
      label={verified ? 'Verified' : 'Not verified'}
      tone={verified ? 'success' : 'neutral'}
      icon={Shield}
    />
  );
}
