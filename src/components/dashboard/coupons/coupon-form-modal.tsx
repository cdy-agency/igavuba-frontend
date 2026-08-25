'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useCoursesList } from '@/hooks/use-courses';
import { useCreateCoupon, useGenerateCouponCode } from '@/hooks/use-coupons';
import { DiscountType } from '@/lib/course-pricing';
import type { Course } from '@/types/course';

interface CouponFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toIsoDateTime(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function CouponFormModal({ open, onOpenChange }: CouponFormModalProps) {
  const createCoupon = useCreateCoupon();
  const generateCode = useGenerateCouponCode();
  const { data: coursesData } = useCoursesList({ page: 1, limit: 100 }, open);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [discountValue, setDiscountValue] = useState('20');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxTotalUses, setMaxTotalUses] = useState('');
  const [maxUsesPerLearner, setMaxUsesPerLearner] = useState('1');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const courses = useMemo(() => coursesData?.data ?? [], [coursesData?.data]);

  useEffect(() => {
    if (!open) {
      setCode('');
      setDescription('');
      setDiscountType(DiscountType.PERCENTAGE);
      setDiscountValue('20');
      setStartsAt('');
      setExpiresAt('');
      setMaxTotalUses('');
      setMaxUsesPerLearner('1');
      setSelectedCourseIds([]);
    }
  }, [open]);

  const toggleCourse = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((current) =>
      checked ? [...current, courseId] : current.filter((id) => id !== courseId),
    );
  };

  const handleGenerateCode = async () => {
    const response = await generateCode.mutateAsync('IGV');
    setCode(response.data.code);
  };

  const handleSubmit = async () => {
    await createCoupon.mutateAsync({
      code,
      description: description.trim() || undefined,
      discountType,
      discountValue: Number(discountValue),
      startsAt: toIsoDateTime(startsAt),
      expiresAt: toIsoDateTime(expiresAt),
      maxTotalUses: maxTotalUses ? Number(maxTotalUses) : undefined,
      maxUsesPerLearner: maxUsesPerLearner ? Number(maxUsesPerLearner) : undefined,
      courseIds: selectedCourseIds,
      isActive: true,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create coupon</DialogTitle>
          <DialogDescription>
            Assign a discount code to specific courses in your institution.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Coupon code</Label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="WELCOME50"
              />
              <Button
                type="button"
                variant="outline"
                disabled={generateCode.isPending}
                onClick={handleGenerateCode}
              >
                {generateCode.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coupon-description">Description</Label>
            <Textarea
              id="coupon-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description for admins"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Discount type</Label>
              <Select
                value={discountType}
                onValueChange={(value) => setDiscountType(value as DiscountType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DiscountType.PERCENTAGE}>Percentage</SelectItem>
                  <SelectItem value={DiscountType.FIXED_AMOUNT}>Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-value">Discount value</Label>
              <Input
                id="discount-value"
                type="number"
                min="0.01"
                step="0.01"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts-at">Valid from</Label>
              <DateTimePicker
                id="starts-at"
                value={startsAt}
                onChange={setStartsAt}
                placeholder="Start date & time"
                disabled={createCoupon.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires-at">Expires</Label>
              <DateTimePicker
                id="expires-at"
                value={expiresAt}
                onChange={setExpiresAt}
                placeholder="End date & time"
                disabled={createCoupon.isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-total">Maximum total uses</Label>
              <Input
                id="max-total"
                type="number"
                min="1"
                value={maxTotalUses}
                onChange={(event) => setMaxTotalUses(event.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-learner">Maximum per learner</Label>
              <Input
                id="max-learner"
                type="number"
                min="1"
                value={maxUsesPerLearner}
                onChange={(event) => setMaxUsesPerLearner(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Courses</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses available.</p>
              ) : (
                courses.map((course: Course) => (
                  <label key={course.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={selectedCourseIds.includes(course.id)}
                      onCheckedChange={(checked) => toggleCourse(course.id, checked === true)}
                    />
                    <span>{course.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              !code.trim() ||
              !discountValue ||
              selectedCourseIds.length === 0 ||
              createCoupon.isPending
            }
            onClick={handleSubmit}
          >
            {createCoupon.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create coupon'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
