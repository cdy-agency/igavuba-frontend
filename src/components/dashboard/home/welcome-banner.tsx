'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getGreeting } from './dashboard-helpers';

interface WelcomeBannerProps {
  name?: string | null;
  roleLabel: string;
  subtitle: string;
  illustrationSrc?: string;
  illustrationAlt?: string;
  primaryAction?: { label: string; href: string };
  illustrationVariant?: 'default' | 'hero';
  className?: string;
}

export function WelcomeBanner({
  name,
  roleLabel,
  subtitle,
  illustrationSrc,
  illustrationAlt = 'Dashboard illustration',
  primaryAction,
  illustrationVariant = 'default',
  className,
}: WelcomeBannerProps) {
  const displayName = name?.trim() || 'there';
  const isHeroIllustration = illustrationVariant === 'hero' && Boolean(illustrationSrc);

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-sm',
        isHeroIllustration && 'min-h-[11.5rem] sm:min-h-[13rem] lg:min-h-[15rem]',
        className,
      )}
    >
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 right-[20%] h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

      {isHeroIllustration ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[min(62%,22rem)] sm:w-[min(58%,26rem)] lg:w-[min(55%,28rem)]">
            <div className="absolute inset-0 bg-gradient-to-l from-primary/[0.07] via-primary/[0.03] to-transparent" />
            <div className="absolute bottom-0 right-0 h-[88%] w-full">
              <Image
                src={illustrationSrc!}
                alt={illustrationAlt}
                fill
                priority
                sizes="(max-width: 768px) 62vw, 28rem"
                className="object-contain object-bottom-right drop-shadow-sm lg:translate-x-2 lg:scale-[1.08]"
              />
            </div>
          </div>

          <div className="relative z-10 flex h-full flex-col justify-center p-4 sm:p-5 lg:max-w-[58%] lg:p-6 xl:max-w-[52%]">
            <span className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {roleLabel}
            </span>
            <div className="mt-3 space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-[1.75rem]">
                {getGreeting()}, {displayName}!
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>
            {primaryAction ? (
              <Button asChild size="sm" className="mt-4 w-fit shadow-sm">
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <div className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-6">
          <div className="min-w-0 flex-1 space-y-3">
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {roleLabel}
            </span>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-[1.75rem]">
                {getGreeting()}, {displayName}!
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>
            {primaryAction ? (
              <Button asChild size="sm" className="shadow-sm">
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>

          {illustrationSrc ? (
            <div className="relative mx-auto flex h-36 w-full max-w-[280px] shrink-0 items-end justify-center sm:h-40 lg:mx-0 lg:h-44 lg:max-w-[320px]">
              <Image
                src={illustrationSrc}
                alt={illustrationAlt}
                width={320}
                height={240}
                priority
                className="h-full w-auto max-w-full object-contain object-bottom"
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
