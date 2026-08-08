'use client';

import { WishlistPage } from '@/components/wishlist/WishlistPage';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';

export default function DashboardWishlistPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.LEARNER]}>
      <WishlistPage variant="dashboard" />
    </RoleGuard>
  );
}
