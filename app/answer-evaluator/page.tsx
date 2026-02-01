import { AppShell } from '@/components/app-shell';
import { AnswerEvaluatorClient } from '@/components/answer-evaluator-client';

export default function AnswerEvaluatorPage() {
  return (
    <AppShell>
      <AnswerEvaluatorClient />
    </AppShell>
  );
}
