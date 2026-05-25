'use client';

import { ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Type definitions matching API responses
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type PricingOption = 'free' | 'paid';

export interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  courseCount: number;
}

export interface InstitutionUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
}

export interface InstitutionResponse {
  _id: string;
  name: string;
  bio: string;
  logo?: string;
  user_id: InstitutionUser;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface InstructorUser {
  _id: string;
  email: string;
  name: string;
}

export interface InstructorResponse {
  _id: string;
  user_id: InstructorUser | null;
  expertise: string[];
  rating: number;
  total_students: number;
  bio?: string;
  profession_name?: string;
  profile_image?: string;
}

interface CourseFiltersProps {
  // Categories
  categories: CategoryResponse[];
  categoriesLoading: boolean;
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;

  // Difficulty
  selectedDifficulties: DifficultyLevel[];
  onToggleDifficulty: (difficulty: DifficultyLevel) => void;

  // Pricing
  selectedPricing?: PricingOption;
  onPricingChange: (pricing: PricingOption | undefined) => void;

  // Institutions
  institutions: InstitutionResponse[];
  institutionsLoading: boolean;
  selectedInstitutionIds: string[];
  onToggleInstitution: (institutionId: string) => void;

  // Instructors
  instructors: InstructorResponse[];
  instructorsLoading: boolean;
  selectedInstructorIds: string[];
  onToggleInstructor: (instructorId: string) => void;

  // Panel states
  isCategoryOpen: boolean;
  isDifficultyOpen: boolean;
  isPricingOpen: boolean;
  isInstitutionsOpen: boolean;
  isInstructorsOpen: boolean;
  onCategoryToggle: () => void;
  onDifficultyToggle: () => void;
  onPricingToggle: () => void;
  onInstitutionsToggle: () => void;
  onInstructorsToggle: () => void;
}

// ==================== FILTER SECTION COMPONENT ====================

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isLoading?: boolean;
}

function FilterSection({ title, isOpen, onToggle, children, isLoading }: FilterSectionProps) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700/50 first:border-t-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground uppercase">{title}</h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen ? 'rotate-180 text-muted-foreground' : 'text-primary',
          )}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-2">Loading...</div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

// ==================== CATEGORY TREE COMPONENT ====================

interface CategoryTreeProps {
  categories: CategoryResponse[];
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
        const isSelected = selectedCategoryIds.includes(category._id);

        return (
          <div key={category._id} className="flex items-center gap-3">
            <Checkbox
              id={`category-${category._id}`}
              checked={isSelected}
              onCheckedChange={() => onToggleCategory(category._id)}
            />
            <Label
              htmlFor={`category-${category._id}`}
              className="flex items-center justify-between flex-1 text-sm font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors"
            >
              <span className="truncate">{category.name}</span>
              {category.courseCount > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({category.courseCount})
                </span>
              )}
            </Label>
          </div>
        );
      })}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

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
  instructors,
  instructorsLoading,
  selectedInstructorIds,
  onToggleInstructor,
  isCategoryOpen,
  isDifficultyOpen,
  isPricingOpen,
  isInstitutionsOpen,
  isInstructorsOpen,
  onCategoryToggle,
  onDifficultyToggle,
  onPricingToggle,
  onInstitutionsToggle,
  onInstructorsToggle,
}: CourseFiltersProps) {
  const difficultyOptions: Array<{ value: DifficultyLevel; label: string }> = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  // Filter categories that have courses
  const categoriesWithCourses = categories.filter((cat) => cat.courseCount > 0);

  return (
    <aside className="md:col-span-1 border border-gray-200 dark:border-gray-700/50 dark:border-t-primary border-t-3 shadow-sm dark:shadow-lg dark:shadow-black/20 bg-card border-t-primary overflow-hidden">
      {/* Categories */}
      <FilterSection
        title="Category"
        isOpen={isCategoryOpen}
        onToggle={onCategoryToggle}
        isLoading={categoriesLoading}
      >
        {categoriesWithCourses.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">No categories available</div>
        ) : (
          <CategoryTree
            categories={categoriesWithCourses}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={onToggleCategory}
          />
        )}
      </FilterSection>

      {/* Difficulty Level */}
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
                  className="text-sm font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors"
                >
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      </FilterSection>

      {/* Pricing */}
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
              className="text-sm font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors"
            >
              Free
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="paid" id="pricing-paid" />
            <Label
              htmlFor="pricing-paid"
              className="text-sm font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors"
            >
              Paid
            </Label>
          </div>
        </RadioGroup>
      </FilterSection>

      {/* Institutions */}
      <FilterSection
        title="Institutions"
        isOpen={isInstitutionsOpen}
        onToggle={onInstitutionsToggle}
        isLoading={institutionsLoading}
      >
        {institutions.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">No institutions available</div>
        ) : (
          <div className="space-y-3">
            {institutions.map((institution) => {
              const checked = selectedInstitutionIds.includes(institution._id);
              return (
                <div key={institution._id} className="flex items-center gap-3">
                  <Checkbox
                    id={`institution-${institution._id}`}
                    checked={checked}
                    onCheckedChange={() => onToggleInstitution(institution._id)}
                  />
                  <Label
                    htmlFor={`institution-${institution._id}`}
                    className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors flex-1"
                  >
                    {institution.logo ? (
                      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={institution.logo}
                          alt={institution.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-semibold flex-shrink-0">
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

      {/* Instructors */}
      <FilterSection
        title="Instructors"
        isOpen={isInstructorsOpen}
        onToggle={onInstructorsToggle}
        isLoading={instructorsLoading}
      >
        {instructors.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">No instructors available</div>
        ) : (
          <div className="space-y-3">
            {instructors.map((instructor) => {
              const checked = selectedInstructorIds.includes(instructor._id);
              const instructorName = instructor.user_id?.name || 'Unknown';
              
              return (
                <div key={instructor._id} className="flex items-center gap-3">
                  <Checkbox
                    id={`instructor-${instructor._id}`}
                    checked={checked}
                    onCheckedChange={() => onToggleInstructor(instructor._id)}
                  />
                  <Label
                    htmlFor={`instructor-${instructor._id}`}
                    className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer hover:text-foreground/80 transition-colors flex-1"
                  >
                    {instructor.profile_image ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={instructor.profile_image}
                          alt={instructorName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {instructorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate">{instructorName}</span>
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