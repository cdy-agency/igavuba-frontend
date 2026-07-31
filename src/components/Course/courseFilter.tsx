'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import type { CatalogInstitution } from '@/types/catalog';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type PricingOption = 'free' | 'paid';

interface CourseFiltersProps {
  categories: Category[];
  categoriesLoading: boolean;
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  selectedDifficulties: DifficultyLevel[];
  onToggleDifficulty: (difficulty: DifficultyLevel) => void;
  selectedPricing?: PricingOption;
  onPricingChange: (pricing: PricingOption | undefined) => void;
  institutions: CatalogInstitution[];
  institutionsLoading: boolean;
  selectedInstitutionIds: string[];
  onToggleInstitution: (institutionId: string) => void;
  isCategoryOpen: boolean;
  isDifficultyOpen: boolean;
  isPricingOpen: boolean;
  isInstitutionsOpen: boolean;
  onCategoryToggle: () => void;
  onDifficultyToggle: () => void;
  onPricingToggle: () => void;
  onInstitutionsToggle: () => void;
}

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
}

function FilterSection({ title, isOpen, onToggle, children, isLoading }: FilterSectionProps) {
  return (
    <div className="border-t border-gray-200 first:border-t-0 dark:border-gray-700/50">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-accent/50"
      >
        <h3 className="text-sm font-semibold uppercase text-foreground">{title}</h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen ? 'rotate-180 text-muted-foreground' : 'text-primary',
          )}
        />
      </button>
      {isOpen ? (
        <div className="px-4 pb-4 pt-2">
          {isLoading ? (
            <div className="py-2 text-sm text-muted-foreground">Loading...</div>
          ) : (
            children
          )}
        </div>
      ) : null}
    </div>
  );
}

interface CategoryTreeProps {
  categories: Category[];
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
}

function CategoryTree({
  categories,
  selectedCategoryIds,
  onToggleCategory,
}: CategoryTreeProps) {
  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const isSelected = selectedCategoryIds.includes(category.id);

        return (
          <div key={category.id} className="flex items-center gap-3">
            <Checkbox
              id={`category-${category.id}`}
              checked={isSelected}
              onCheckedChange={() => onToggleCategory(category.id)}
            />
            <Label
              htmlFor={`category-${category.id}`}
              className="flex flex-1 cursor-pointer items-center justify-between text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
            >
              <span className="truncate">{category.name}</span>
              {category.publishedCourseCount > 0 ? (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({category.publishedCourseCount})
                </span>
              ) : null}
            </Label>
          </div>
        );
      })}
    </div>
  );
}

export function CourseFilters({
  categories,
  categoriesLoading,
  selectedCategoryIds,
  onToggleCategory,
  selectedDifficulties,
  onToggleDifficulty,
  selectedPricing,
  onPricingChange,
  institutions,
  institutionsLoading,
  selectedInstitutionIds,
  onToggleInstitution,
  isCategoryOpen,
  isDifficultyOpen,
  isPricingOpen,
  isInstitutionsOpen,
  onCategoryToggle,
  onDifficultyToggle,
  onPricingToggle,
  onInstitutionsToggle,
}: CourseFiltersProps) {
  const difficultyOptions: Array<{ value: DifficultyLevel; label: string }> = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const categoriesWithCourses = categories.filter(
    (category) => category.publishedCourseCount > 0,
  );

  return (
    <aside className="overflow-hidden border border-gray-200 border-t-[3px] border-t-primary bg-card shadow-sm dark:border-gray-700/50 dark:shadow-lg dark:shadow-black/20 md:col-span-1">
      <FilterSection
        title="Category"
        isOpen={isCategoryOpen}
        onToggle={onCategoryToggle}
        isLoading={categoriesLoading}
      >
        {categoriesWithCourses.length === 0 ? (
          <div className="py-2 text-sm text-muted-foreground">No categories available</div>
        ) : (
          <CategoryTree
            categories={categoriesWithCourses}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={onToggleCategory}
          />
        )}
      </FilterSection>

      <FilterSection title="Level" isOpen={isDifficultyOpen} onToggle={onDifficultyToggle}>
        <div className="space-y-3">
          {difficultyOptions.map((option) => {
            const checked = selectedDifficulties.includes(option.value);
            return (
              <div key={option.value} className="flex items-center gap-3">
                <Checkbox
                  id={`difficulty-${option.value}`}
                  checked={checked}
                  onCheckedChange={() => onToggleDifficulty(option.value)}
                />
                <Label
                  htmlFor={`difficulty-${option.value}`}
                  className="cursor-pointer text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
                >
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Pricing" isOpen={isPricingOpen} onToggle={onPricingToggle}>
        <RadioGroup
          value={selectedPricing}
          onValueChange={(value) => onPricingChange(value as PricingOption | undefined)}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem value="free" id="pricing-free" />
            <Label
              htmlFor="pricing-free"
              className="cursor-pointer text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
            >
              Free
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="paid" id="pricing-paid" />
            <Label
              htmlFor="pricing-paid"
              className="cursor-pointer text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
            >
              Paid
            </Label>
          </div>
        </RadioGroup>
      </FilterSection>

      <FilterSection
        title="Institutions"
        isOpen={isInstitutionsOpen}
        onToggle={onInstitutionsToggle}
        isLoading={institutionsLoading}
      >
        {institutions.length === 0 ? (
          <div className="py-2 text-sm text-muted-foreground">No institutions available</div>
        ) : (
          <div className="space-y-3">
            {institutions.map((institution) => {
              const checked = selectedInstitutionIds.includes(institution.id);
              return (
                <div key={institution.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`institution-${institution.id}`}
                    checked={checked}
                    onCheckedChange={() => onToggleInstitution(institution.id)}
                  />
                  <Label
                    htmlFor={`institution-${institution.id}`}
                    className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
                  >
                    {institution.logo ? (
                      <div className="h-8 w-8 shrink-0 overflow-hidden">
                        <Image
                          src={institution.logo}
                          alt={institution.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-muted text-sm font-semibold">
                        {institution.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate">{institution.name}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </FilterSection>
    </aside>
  );
}
