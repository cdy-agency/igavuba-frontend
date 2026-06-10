'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import {
  Check,
  Download,
  ExternalLink,
  Eye,
  Loader2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { allowedTypes } from '@/types/enum';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

const DOCUMENT_MAX_SIZE_MB = 10;

export function LessonSettingsGroup({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-border/60 rounded-lg border border-border/60 bg-slate-50/40">
      {children}
    </div>
  );
}

export function LessonSettingRow({
  icon: Icon,
  label,
  status,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  icon: typeof Eye;
  label: string;
  status: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm ring-1 ring-border/60">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-foreground">{label}</p>
          <p className="text-[12px] text-muted-foreground">{status}</p>
        </div>
      </div>
      <Switch
        size="xs"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export function ContentVisibilityToggle({
  visible,
  onChange,
  disabled = false,
}: {
  visible: boolean;
  onChange: (visible: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <LessonSettingRow
      icon={Eye}
      label="Visibility"
      status={visible ? 'Visible' : 'Hidden'}
      checked={visible}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
}

export function AllowDownloadToggle({
  enabled,
  onChange,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <LessonSettingRow
      icon={Download}
      label="Allow Download"
      status={enabled ? 'Enabled' : 'Disabled'}
      checked={enabled}
      onCheckedChange={onChange}
      disabled={disabled}
    />
  );
}

export function LessonFormFooter({
  onCancel,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  disabled = false,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-border/50 px-8 py-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-9 gap-1.5 text-[13px] text-muted-foreground"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        className="h-9 gap-1.5 px-4 text-[13px]"
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {submitLabel}
      </Button>
    </div>
  );
}

export function DocumentUploadZone({
  onFileSelect,
  isUploading,
  fileName,
  disabled = false,
}: {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  fileName?: string | null;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = allowedTypes.join(',');

  const handleFile = (file: File) => {
    if (file.size > DOCUMENT_MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be ${DOCUMENT_MAX_SIZE_MB}MB or smaller.`);
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type.');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleFile(file);
          event.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors',
          'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/60',
          (disabled || isUploading) && 'cursor-not-allowed opacity-60',
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-[13px] font-medium text-emerald-800">Uploading document...</p>
          </>
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-emerald-600" strokeWidth={1.75} />
            <p className="text-[13px] font-semibold text-emerald-800">
              Click to upload document <span className="text-destructive">*</span>
            </p>
            <p className="mt-1 text-center text-[11px] text-emerald-700/80">
              PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (Max {DOCUMENT_MAX_SIZE_MB}MB)
            </p>
            {fileName ? (
              <p className="mt-3 max-w-full truncate text-[12px] font-medium text-emerald-900">
                {fileName}
              </p>
            ) : null}
          </>
        )}
      </button>
    </div>
  );
}

export type VideoPlatform = 'youtube' | 'vimeo' | 'direct';

export function VideoLessonFields({
  platform,
  onPlatformChange,
  videoUrl,
  onVideoUrlChange,
  onVideoUrlBlur,
  durationMinutes,
  onDurationMinutesChange,
  onDurationMinutesBlur,
  disabled = false,
}: {
  platform: VideoPlatform;
  onPlatformChange: (platform: VideoPlatform) => void;
  videoUrl: string;
  onVideoUrlChange: (value: string) => void;
  onVideoUrlBlur?: () => void;
  durationMinutes: string;
  onDurationMinutesChange: (value: string) => void;
  onDurationMinutesBlur?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Duration (minutes)</label>
        <Input
          type="number"
          min={1}
          value={durationMinutes}
          onChange={(event) => onDurationMinutesChange(event.target.value)}
          onBlur={onDurationMinutesBlur}
          placeholder="Click to add duration..."
          disabled={disabled}
          className="h-10 text-[13px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">Video Platform</label>
        <Select
          value={platform}
          onValueChange={(value) => onPlatformChange(value as VideoPlatform)}
          disabled={disabled}
        >
          <SelectTrigger className="h-10 text-[13px]">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="vimeo">Vimeo</SelectItem>
            <SelectItem value="direct">Direct URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">
          Video URL <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Input
            value={videoUrl}
            onChange={(event) => onVideoUrlChange(event.target.value)}
            onBlur={onVideoUrlBlur}
            placeholder="https://youtube.com/watch?v=..."
            disabled={disabled}
            className="h-10 pr-10 text-[13px]"
          />
          {videoUrl ? (
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              aria-label="Open video URL"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function secondsToMinutes(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '';
  const minutes = Math.round(seconds / 60);
  return minutes > 0 ? String(minutes) : '';
}

export function minutesToSeconds(minutes: string): number | undefined {
  const parsed = Number(minutes);
  if (!minutes.trim() || Number.isNaN(parsed) || parsed <= 0) return undefined;
  return Math.round(parsed * 60);
}

export function defaultUntitledTitle(type: 'text' | 'video' | 'document'): string {
  switch (type) {
    case 'video':
      return 'Untitled Video';
    case 'document':
      return 'Untitled Document';
    default:
      return 'Untitled Lesson';
  }
}

export function resolveLessonTitle(title: string, type: 'text' | 'video' | 'document'): string {
  const trimmed = title.trim();
  return trimmed || defaultUntitledTitle(type);
}
