'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { generatePlan } from '@/app/planner/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { idbGet, idbSet } from '@/lib/db';
import { loadLocal, saveLocal } from '@/lib/storage';
import { PageHeader } from '@/components/page-header';

const initialState = { plan: '', error: null as string | null };
const PLAN_LATEST_KEY = 'latest';
const normalizeMarkdown = (value: string) =>
  value.replace(/^(#{1,6})(\S)/gm, '$1 $2');

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Generating...' : 'Generate Plan'}
    </Button>
  );
}

type StoredPlan = {
  text: string;
  createdAt: string;
};

export function PlannerClient() {
  const [state, formAction] = useFormState(generatePlan, initialState);
  const [cachedPlan, setCachedPlan] = useState('');
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [hours, setHours] = useState(4);
  const [target, setTarget] = useState('Prelims');

  useEffect(() => {
    setHours(loadLocal('prayas:planner-hours', 4));
    setTarget(loadLocal('prayas:planner-target', 'Prelims'));

    idbGet<string | StoredPlan>('plans', PLAN_LATEST_KEY).then((plan) => {
      if (!plan) return;
      if (typeof plan === 'string') {
        setCachedPlan(plan);
        return;
      }
      setCachedPlan(plan.text);
      setCachedAt(plan.createdAt);
    });
  }, []);

  useEffect(() => {
    if (state.plan) {
      const createdAt = new Date().toISOString();
      const stored: StoredPlan = { text: state.plan, createdAt };
      setCachedPlan(state.plan);
      setCachedAt(createdAt);
      idbSet('plans', PLAN_LATEST_KEY, stored);
      idbSet('plans', createdAt, stored);
      saveLocal('prayas:planner-last', Date.now());
      saveLocal('prayas:planner-last-at', createdAt);
    }
  }, [state.plan]);

  useEffect(() => {
    saveLocal('prayas:planner-hours', hours);
    saveLocal('prayas:planner-target', target);
  }, [hours, target]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Smart Preparation Planner"
        subtitle="Generate a focused, UPSC-ready plan powered by AI coaching."
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid gap-6 lg:grid-cols-[1.1fr_1fr]"
      >
        <Card>
          <CardHeader>
            <CardTitle>Smart Preparation Planner</CardTitle>
            <p className="text-sm text-ink-600">
              Generate a focused, UPSC-ready plan with AI coaching.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={formAction} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Daily available hours
                </label>
                <Input
                  name="hours"
                  type="number"
                  min={1}
                  max={16}
                  value={hours}
                  onChange={(event) => setHours(Number(event.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Target exam stage
                </label>
                <Select
                  name="target"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                >
                  <option>Prelims</option>
                  <option>Mains</option>
                  <option>Both</option>
                </Select>
              </div>
              <SubmitButton />
              {state.error && (
                <p className="text-sm text-saffron-700">{state.error}</p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/80">
          <CardHeader>
            <CardTitle>Your Latest Plan</CardTitle>
            <p className="text-xs text-ink-500">
              Cached locally for offline access.
            </p>
            {cachedAt && (
              <p className="text-xs text-ink-500">
                Saved on {new Date(cachedAt).toLocaleString()}.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="markdown text-sm text-ink-700">
              {cachedPlan ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                >
                  {normalizeMarkdown(cachedPlan)}
                </ReactMarkdown>
              ) : (
                'Generate a plan to see it here.'
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
