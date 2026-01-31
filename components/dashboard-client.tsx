'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { loadLocal, saveLocal } from '@/lib/storage';
import { idbGet } from '@/lib/db';
import { PageHeader } from '@/components/page-header';

const phaseOptions = ['Beginner', 'Intermediate', 'Advanced'] as const;

type Phase = (typeof phaseOptions)[number];

export function DashboardClient() {
  const [studyHours, setStudyHours] = useState(3);
  const [phase, setPhase] = useState<Phase>('Beginner');
  const [attempts, setAttempts] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const cachedHours = loadLocal('prayas:study-hours', 3);
    const cachedPhase = loadLocal<Phase>('prayas:phase', 'Beginner');
    setStudyHours(cachedHours);
    setPhase(cachedPhase);
  }, []);

  useEffect(() => {
    saveLocal('prayas:study-hours', studyHours);
    saveLocal('prayas:phase', phase);
  }, [studyHours, phase]);

  useEffect(() => {
    idbGet<{ attempts: number; accuracy: number }>('analytics', 'latest').then(
      (data) => {
        if (data) {
          setAttempts(data.attempts);
          setAccuracy(data.accuracy);
        }
      }
    );
  }, []);

  const readinessScore = useMemo(() => {
    const phaseBoost = phase === 'Beginner' ? 10 : phase === 'Intermediate' ? 22 : 35;
    const hoursScore = Math.min(40, Math.round(studyHours * 6));
    const accuracyScore = Math.min(25, Math.round(accuracy * 25));
    return Math.min(100, phaseBoost + hoursScore + accuracyScore);
  }, [phase, studyHours, accuracy]);

  const dailyFocus = useMemo(() => {
    if (phase === 'Beginner') {
      return 'Build strong foundations: NCERT + basic polity and economy.';
    }
    if (phase === 'Intermediate') {
      return 'Rotate GS topics with 1 hour of answer writing.';
    }
    return 'High-intensity revision + mock test analysis.';
  }, [phase]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Your calm daily cockpit for UPSC preparation."
      />
      <div className="gradient-border">
        <div className="gradient-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Today’s intent
              </p>
              <p className="mt-2 font-headline text-2xl text-ink-900">
                Focus on progress, not perfection.
              </p>
              <p className="mt-2 text-sm text-ink-600">
                Small wins compound. Keep the day’s plan realistic and steady.
              </p>
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white/80 px-5 py-4 text-sm text-ink-700">
              <p className="text-xs uppercase tracking-wide text-ink-500">
                Readiness
              </p>
              <p className="mt-1 font-headline text-3xl">{readinessScore}</p>
              <p className="text-xs text-ink-500">/ 100</p>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid gap-6 lg:grid-cols-[2fr_1fr]"
      >
        <Card>
          <CardHeader>
            <CardTitle>Daily Focus Summary</CardTitle>
            <p className="text-sm text-ink-600">
              A calm, realistic snapshot to begin your day.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4 text-sm text-ink-700">
              {dailyFocus}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Study hours today
                </label>
                <Input
                  type="number"
                  min={0}
                  max={16}
                  value={studyHours}
                  onChange={(event) =>
                    setStudyHours(Math.max(0, Number(event.target.value)))
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Current preparation phase
                </label>
                <Select
                  value={phase}
                  onChange={(event) => setPhase(event.target.value as Phase)}
                >
                  {phaseOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle>UPSC Readiness Score</CardTitle>
            <p className="text-xs text-ink-500">Updates on this device.</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3">
              <p className="font-headline text-5xl font-semibold text-ink-900">
                {readinessScore}
              </p>
              <Badge variant="accent">/ 100</Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm text-ink-600">
              <p>Attempts logged: {attempts}</p>
              <p>Accuracy rate: {(accuracy * 100).toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: 'Strategy cue',
            text: 'Spend your highest-energy window on high-weightage subjects.'
          },
          {
            title: 'Wellness cue',
            text: 'If focus dips, switch to revision rather than forcing new topics.'
          },
          {
            title: 'Current affairs cue',
            text: 'Prioritize policy + economy stories that can feed GS2 and GS3.'
          }
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-ink-600">
              {item.text}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
