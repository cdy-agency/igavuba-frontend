import fs from 'fs';
import path from 'path';

const replacements = [
  ['primary-subtle0', 'primary-light'],
  ['border-blue-200', 'border-primary-muted'],
  ['border-blue-100', 'border-primary-muted'],
  ['border-blue-800', 'border-primary-active'],
  ['bg-slate-700', 'bg-panel'],
  ['bg-slate-100', 'bg-muted'],
  ['hover:file:bg-slate-200', 'hover:file:bg-surface'],
  ['file:bg-slate-100', 'file:bg-muted'],
  ['border-gray-300', 'border-border'],
  ['border-gray-100', 'border-border'],
  ['bg-gray-100', 'bg-muted'],
  ['hover:bg-gray-100', 'hover:bg-muted'],
  ['bg-gray-200', 'bg-muted'],
  ['hover:bg-gray-200', 'hover:bg-surface'],
  ['text-gray-800', 'text-foreground'],
  ['border-red-300', 'border-destructive'],
  ['text-red-700', 'text-destructive'],
  ['text-red-500', 'text-destructive'],
  ['hover:text-red-700', 'hover:text-destructive'],
  ['bg-red-50', 'bg-destructive/10'],
  ['bg-red-100', 'bg-destructive/20'],
  ['border-red-200', 'border-destructive/30'],
  ['bg-green-600', 'bg-success'],
  ['hover:bg-green-700', 'hover:bg-success'],
  ['bg-green-100', 'bg-success/20'],
  ['border-green-200', 'border-success/30'],
  ['text-green-700', 'text-success'],
  ['text-green-800', 'text-success'],
  ['from-green-50', 'from-success/10'],
  ['to-emerald-50', 'to-success/10'],
  ['to-blue-600', 'to-primary'],
  ['from-blue-100', 'from-primary-muted'],
  ['to-purple-100', 'to-primary-subtle'],
  ['to-purple-500', 'to-secondary'],
  ['from-indigo-600', 'from-primary'],
  ['to-purple-600', 'to-secondary'],
  ['hover:from-indigo-700', 'hover:from-primary-hover'],
  ['hover:to-purple-700', 'hover:to-secondary-hover'],
  ['text-indigo-600', 'text-primary'],
  ['group-hover:text-indigo-600', 'group-hover:text-primary'],
  ['from-indigo-50', 'from-primary-subtle'],
  ['to-cyan-50', 'to-primary-muted'],
  ['via-white', 'via-background'],
  ['border-indigo-200', 'border-primary-muted'],
  ['border-t-indigo-600', 'border-t-primary'],
  ['text-indigo-400', 'text-primary-light'],
  ['from-indigo-500', 'from-primary'],
  ['via-purple-500', 'via-secondary'],
  ['to-pink-500', 'to-accent'],
  ['from-orange-500', 'from-accent'],
  ['to-red-500', 'to-destructive'],
  ['from-orange-100', 'from-accent/20'],
  ['text-orange-700', 'text-accent'],
  ['border-orange-200', 'border-accent/30'],
  ['bg-orange-100', 'bg-accent/20'],
  ['from-green-500', 'from-success'],
  ['to-teal-500', 'to-primary-light'],
  ['to-emerald-500', 'to-success'],
  ['bg-purple-600', 'bg-secondary'],
  ['hover:bg-purple-700', 'hover:bg-secondary-hover'],
  ['bg-yellow-100', 'bg-accent/20'],
  ['text-yellow-700', 'text-accent'],
  ['focus-visible:ring-blue-300', 'focus-visible:ring-primary-light'],
  ['primary-muted0', 'primary-muted'],
  ['border-yellow-200', 'border-accent/30'],
  ['bg-green-50', 'bg-success/10'],
  ['border-green-100', 'border-success/30'],
  ['bg-purple-100', 'bg-secondary/20'],
  ['text-purple-600', 'text-secondary'],
  ['from-purple-500', 'from-secondary'],
  ['from-red-500', 'from-destructive'],
  ['to-orange-500', 'to-accent'],
  ['bg-orange-50', 'bg-accent/10'],
  ['text-orange-600', 'text-accent'],
  ['border-orange-100', 'border-accent/30'],
  ['bg-yellow-50', 'bg-accent/10'],
  ['text-yellow-600', 'text-accent'],
  ['text-yellow-800', 'text-accent'],
  ['bg-yellow-500', 'bg-accent'],
  ['bg-green-500', 'bg-success'],
  ['text-red-800', 'text-destructive'],
  ['text-blue-900', 'text-primary-active'],
  ['hover:bg-blue-900', 'hover:bg-primary-active'],
  ['ring-blue-400', 'ring-primary-light'],
  ['text-blue-900', 'text-primary-active'],
  ['from-blue-400', 'from-primary-light'],
  ['to-orange-600', 'to-accent'],
  ['from-orange-400', 'from-accent'],
  ['bg-indigo-50', 'bg-primary-subtle'],
  ['bg-indigo-100', 'bg-primary-muted'],
  ['text-indigo-700', 'text-primary-hover'],
  ['from-indigo-400', 'from-primary-light'],
  ['bg-indigo-600', 'bg-primary'],
  ['bg-gray-300', 'bg-border'],
  ['divide-gray-200', 'divide-border'],
  ['divide-gray-100', 'divide-border'],
  ['bg-slate-800', 'bg-panel'],
  ['border-slate-700', 'border-panel-border'],
  ['bg-cyan-500', 'bg-primary-light'],
  ['hover:bg-cyan-600', 'hover:bg-primary'],
  ['text-purple-600', 'text-secondary'],
  ['hover:text-purple-600', 'hover:text-secondary'],
  ['from-purple-600', 'from-secondary'],
  ['to-pink-600', 'to-accent'],
  ['border-red-500', 'border-destructive'],
  ['bg-green-300', 'bg-success/40'],
  ['bg-yellow-300', 'bg-accent/40'],
  ['bg-green-400', 'bg-success'],
  ['bg-red-400', 'bg-destructive'],
  ['text-yellow-600', 'text-accent'],
  ['border-yellow-200', 'border-accent/30'],
  ['bg-purple-50', 'bg-secondary/10'],
  ['bg-pink-50', 'bg-accent/10'],
  ['bg-orange-50', 'bg-accent/10'],
];

const skipFiles = new Set([
  'src/components/ui/editor/constants.ts',
  'src/components/ui/editor/ColorPicker.tsx',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'scripts'].includes(entry.name)) continue;
      walk(full, files);
    } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

let changed = 0;
for (const file of walk('src')) {
  const normalized = file.replace(/\\/g, '/');
  if (skipFiles.has(normalized)) continue;

  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }

  // text-white only where not already semantic (skip panel-foreground contexts)
  content = content.replace(/\btext-white\b/g, 'text-primary-foreground');

  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log('updated:', normalized);
  }
}

console.log(`Total updated: ${changed}`);
