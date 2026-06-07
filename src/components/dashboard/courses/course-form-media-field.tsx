'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { ImageIcon, Loader2, Upload, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CourseFormField,
  courseFormInputClass,
} from '@/components/dashboard/courses/course-form-field';
import { uploadFile } from '@/api/upload';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

interface CourseFormMediaFieldProps {
  label: string;
  accept: string;
  kind: 'image' | 'video';
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  hint?: string;
}

export function CourseFormMediaField({
  label,
  accept,
  kind,
  value,
  onChange,
  disabled,
  required,
  optional,
  hint,
}: CourseFormMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const Icon = kind === 'image' ? ImageIcon : Video;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast.success(`${label} uploaded successfully.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Unable to upload ${label.toLowerCase()}.`));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <CourseFormField
      icon={Icon}
      label={label}
      required={required}
      optional={optional}
      hint={hint}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 border-border/80 text-[12px] font-medium"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload from device
            </>
          )}
        </Button>
        <Input
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value || undefined)}
          placeholder={`Paste ${kind === 'image' ? 'image' : 'video'} URL`}
          disabled={disabled || isUploading}
          className={courseFormInputClass}
        />
      </div>

      {value ? (
        <div className="flex items-start gap-3 rounded-md border border-border/80 bg-muted/15 p-2.5">
          {kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={`${label} preview`}
              className="h-14 w-20 shrink-0 rounded object-cover"
            />
          ) : (
            <video
              src={value}
              className="h-14 w-20 shrink-0 rounded object-cover"
              muted
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[11px] text-muted-foreground">{value}</p>
            <button
              type="button"
              className="mt-1 text-[11px] font-semibold text-primary hover:underline"
              disabled={disabled || isUploading}
              onClick={() => onChange(undefined)}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </CourseFormField>
  );
}
