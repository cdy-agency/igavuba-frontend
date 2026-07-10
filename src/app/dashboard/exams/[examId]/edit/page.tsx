'use client';

import { useParams } from 'next/navigation';
import { ExamBuilderPage } from '@/components/exam/exam-builder-page';

export default function EditExamPage() {
  const params = useParams<{ examId: string }>();

  return <ExamBuilderPage examId={params.examId} />;
}
