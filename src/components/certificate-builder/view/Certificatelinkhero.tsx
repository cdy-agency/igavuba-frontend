'use client';

import Image from 'next/image';
import AppNavbar from '../nav-bar';

type CertificateTab = 'default' | 'courses';

interface CertificateLinkHeaderProps {
  activeTab: CertificateTab;
  onTabChange: (tab: CertificateTab) => void;
}

export function CertificateLinkHeader({ activeTab, onTabChange }: CertificateLinkHeaderProps) {
  return (
    <div className="w-full">
      <AppNavbar />

      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#061a2b] via-[#08243a] to-[#0a2e4a] text-white">
        <div className="px-12 max-w-7xl pt-16 mx-auto flex items-center justify-between gap-10">
          <div className="max-w-xl pt-10">
            <h1 className="text-4xl text-white font-bold tracking-tight mb-2">Link Certificates</h1>
            <p className="text-blue-100 text-base mb-4">
              Here you can assign your certificates to certain categories and courses
            </p>

            {/* Tabs */}
            <div className="flex gap-8">
              <button
                onClick={() => onTabChange('default')}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === 'default'
                    ? 'text-blue-200 border-b-2 border-blue-400'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                Default Certificate
              </button>

              <button
                onClick={() => onTabChange('courses')}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === 'courses'
                    ? 'text-blue-200 border-b-2 border-blue-400'
                    : 'text-white hover:text-blue-200'
                }`}
              >
                Courses
              </button>
            </div>
          </div>

          {/* RIGHT ILLUSTRATION */}
          <div className="hidden md:block relative w-[300px] h-[200px]">
            <Image
              src="/Certification-rafiki.svg"
              alt="Certificate Illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
