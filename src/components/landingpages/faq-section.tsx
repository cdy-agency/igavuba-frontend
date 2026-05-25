'use client';

import { FAQContent } from './faq-content';

export function FAQSection() {
  return (
    <section
      id="faq"
      className="py-20 pt-8 lg:py-24 lg:pt-8 bg-gradient-to-br from-background via-background to-[var(--section-alt)]/20 dark:from-background dark:via-background dark:to-primary/10 relative scroll-mt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="container-inner">
          <FAQContent />
        </div>
      </div>
    </section>
  );
}
