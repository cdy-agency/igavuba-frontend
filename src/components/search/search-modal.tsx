"use client";

import React, { useEffect, useState } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getCatalogCourses } from '@/api/catalog.api';
import type { CatalogCourseCard } from '@/types/catalog';


export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogCourseCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
  }, [open]);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        if (mounted) {
          setResults([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const resp = await getCatalogCourses({ search: query, page: 1, limit: 10 });
        if (mounted) setResults(resp.data ?? []);
      } catch (err) {
        if (mounted) setResults([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[90%] max-w-3xl bg-white rounded-lg shadow-xl">
        <div className="flex items-center p-4 border-b border-border">
          <div className="flex items-center gap-3 flex-1">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">All</div>
              <div className="text-xs text-muted-foreground">{results.length}</div>
            </div>
            <div className="text-sm text-primary hover:underline">
              <Link href="/courses">View all</Link>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-auto">
            {loading ? (
              <div className="text-sm text-muted-foreground">Searching...</div>
            ) : results.length === 0 ? (
              <div className="text-sm text-muted-foreground">No results</div>
            ) : (
              results.map((c) => (
                <Link key={c.id} href={`/courses/${c.slug}`} className="flex items-center gap-4 p-2 hover:bg-surface rounded">
                  <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    {c.thumbnail ? (
                      <Image src={c.thumbnail} alt={c.title} width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary-subtle" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.subtitle}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
