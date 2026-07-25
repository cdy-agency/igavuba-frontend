'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/certificate/builder') {
      return pathname.startsWith('/certificate/builder');
    }

    if (href === '/certificate/link-certificate') {
      return pathname.startsWith('/certificate/link-certificate');
    }

    return pathname === href;
  };

  return (
    <header className="fixed w-full top-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-4 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h1 className="text-xl font-semibold text-gray-900">Certificate Builder</h1>
      </div>

      {/* Center Tabs */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex gap-10 h-full">
        <Link
          href="/certificate/builder"
          className={`flex items-center font-bold h-full text-sm transition-colors ${
            isActive('/certificate/builder')
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Certificates
        </Link>

        <Link
          href="/certificate/link-certificate"
          className={`flex items-center h-full text-sm font-bold transition-colors ${
            isActive('/certificate/link-certificate')
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Link Certificates
        </Link>
      </nav>
    </header>
  );
}
