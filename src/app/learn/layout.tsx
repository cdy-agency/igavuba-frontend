import { LearnAuthGate } from '@/components/learn/learn-auth-gate';
import CheckEnrollMent from './[slug]/CheckEnrollMent';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LearnAuthGate>
      <CheckEnrollMent>{children}</CheckEnrollMent>
    </LearnAuthGate>
  );
}
