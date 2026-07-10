'use client';

import { use } from 'react';
import { PaymentDetailPage } from '@/components/dashboard/payments/payment-detail-page';

export default function PaymentDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PaymentDetailPage paymentId={id} />;
}
