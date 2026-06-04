"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingCta() {
  return (
    <section
      className="relative py-24 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="absolute inset-0 cta-banner-overlay" />

      <div className="container px-6 md:px-8 lg:px-32 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-primary-foreground">
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            &quot;WHEN YOU STOP LEARNING,
            <br />
            YOU START DYING&quot;
          </blockquote>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6">
            <p className="text-base md:text-lg text-primary-foreground/80">
              — Albert Einstein
            </p>

            <span className="hidden sm:inline text-primary-foreground/40">•</span>

            <Button
              asChild
              className="bg-background text-primary-deep hover:bg-muted rounded-sm px-6 py-2.5 text-sm font-medium"
            >
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
