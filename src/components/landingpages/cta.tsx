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
      {/* Blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#083580]/80 via-[#0a3f96]/85 to-[#0b2e6f]/95"></div>

      <div className="container px-6 md:px-8 lg:px-32 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">
          
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
            &quot;WHEN YOU STOP LEARNING,
            <br />
            YOU START DYING&quot;
          </blockquote>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6">
            <p className="text-base md:text-lg text-white/80">
              — Albert Einstein
            </p>

            <span className="hidden sm:inline text-white/40">•</span>

            <Button
              asChild
              className="bg-white text-[#083580] hover:bg-gray-100 rounded-sm px-6 py-2.5 text-sm font-medium"
            >
              <Link href="/register">Get started</Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
