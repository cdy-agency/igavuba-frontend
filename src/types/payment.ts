export type PaymentMethod = 'MANUAL' | 'MTN_MOMO' | 'CARD' | 'BANK_TRANSFER';

export type PaymentRecordStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PaymentRecord {
  id: string;
  learnerId: string;
  courseId: string;
  enrollmentId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  proofFile: string;
  referenceNumber: string | null;
  status: PaymentRecordStatus;
  reviewedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
  enrollment: {
    id: string;
    status: string;
  };
}

export interface SubmitPaymentPayload {
  courseId: string;
  proofFile: string;
  referenceNumber?: string;
}

export interface RejectPaymentPayload {
  rejectionReason: string;
}

export interface PaymentsListResponse {
  data: PaymentRecord[];
}

export interface PaymentDetailResponse {
  data: PaymentRecord;
}

export interface PaymentMutationResponse {
  success: boolean;
  message: string;
  data: PaymentRecord;
}
