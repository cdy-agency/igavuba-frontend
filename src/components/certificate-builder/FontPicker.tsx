'use client';

import { useState } from 'react';
import { GOOGLE_FONT_OPTIONS } from '@/utils/google-fonts';
import { loadGoogleFont } from '@/lib/loadGoogleFont';

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = GOOGLE_FONT_OPTIONS.filter((family) =>
    family.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-56 rounded-lg border bg-white shadow-lg">
      <input
        placeholder="Search fonts"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full border-b px-3 py-2 text-sm outline-none"
      />

      <div className="max-h-60 overflow-y-auto">
        {filtered.map((family) => (
          <button
            key={family}
            type="button"
            onClick={() => {
              void loadGoogleFont(family);
              onChange(family);
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
              value === family ? 'bg-blue-50' : ''
            }`}
            style={{ fontFamily: family }}
          >
            {family}
          </button>
        ))}
      </div>
    </div>
  );
}
