'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLecturersList } from '@/hooks/use-lecturers';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useDashboard } from '@/contexts/dashboard-context';
import type { LecturerListItem } from '@/types/lecturer.types';
import { UserRole, UserStatus } from '@/types/enum';
import { hasAnyRole } from '@/lib/role-utils';
import { courseFormSelectTriggerClass } from '@/components/dashboard/courses/course-form-field';
import { cn } from '@/lib/utils';

interface CourseLecturerSelectProps {
  value?: string;
  onChange: (lecturerProfileId: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  allowUnassigned?: boolean;
  showSelectionStatus?: boolean;
}

function getInitials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
  return email.slice(0, 2).toUpperCase();
}

function getDisplayName(lecturer: LecturerListItem) {
  return lecturer.name?.trim() || lecturer.email;
}

export function CourseLecturerSelect({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select lecturers',
  allowUnassigned = true,
  showSelectionStatus = true,
}: CourseLecturerSelectProps) {
  const authReady = useAuthReady();
  const { role } = useDashboard();
  const canListLecturers = hasAnyRole(role, [UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN]);
  const [open, setOpen] = useState(false);
  const { data, isPending } = useLecturersList(
    { status: UserStatus.ACTIVE },
    authReady && canListLecturers,
  );
  const lecturers: LecturerListItem[] = data?.data ?? [];

  const activeLecturers = useMemo(
    () =>
      lecturers.filter(
        (lecturer: LecturerListItem) => lecturer.status === UserStatus.ACTIVE,
      ),
    [lecturers],
  );

  const selectedLecturer = useMemo(
    () => activeLecturers.find((lecturer: LecturerListItem) => lecturer.id === value),
    [activeLecturers, value],
  );

  if (isPending) {
    return (
      <div className="flex h-9 items-center justify-center rounded-md border border-border/80 bg-muted/20">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {showSelectionStatus ? (
        <p className="text-[11px] text-muted-foreground/80">
          {selectedLecturer
            ? `Selected: ${getDisplayName(selectedLecturer)}`
            : 'No lecturer selected'}
        </p>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              courseFormSelectTriggerClass,
              'w-full justify-between px-3 font-normal',
            )}
          >
            {selectedLecturer ? (
              <span className="flex min-w-0 items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-muted text-[10px] font-semibold">
                    {getInitials(selectedLecturer.name, selectedLecturer.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{getDisplayName(selectedLecturer)}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No lecturers found.</CommandEmpty>
              <CommandGroup>
                {allowUnassigned ? (
                  <CommandItem
                    value="none no lecturer"
                    onSelect={() => {
                      onChange(undefined);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        !value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    No lecturer assigned
                  </CommandItem>
                ) : null}
                {activeLecturers.map((lecturer: LecturerListItem) => {
                  const displayName = getDisplayName(lecturer);
                  return (
                    <CommandItem
                      key={lecturer.id}
                      value={`${displayName} ${lecturer.email} ${lecturer.department?.name ?? ''}`}
                      onSelect={() => {
                        onChange(lecturer.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === lecturer.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <Avatar className="mr-2 h-7 w-7">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold">
                          {getInitials(lecturer.name, lecturer.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{displayName}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
