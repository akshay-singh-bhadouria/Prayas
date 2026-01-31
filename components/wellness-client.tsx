'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { loadLocal, saveLocal } from '@/lib/storage';
import { PageHeader } from '@/components/page-header';

const moods = ['Calm', 'Focused', 'Anxious', 'Tired', 'Motivated'];

export function WellnessClient() {
  const [affirmation, setAffirmation] = useState('');
  const [mood, setMood] = useState('Calm');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMood(loadLocal('prayas:mood', 'Calm'));
  }, []);

  useEffect(() => {
    saveLocal('prayas:mood', mood);
  }, [mood]);

  const fetchAffirmation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/affirmation');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'fail');
      setAffirmation(data.affirmation || 'Keep moving forward with clarity.');
      saveLocal('prayas:affirmation', data.affirmation);
    } catch {
      setAffirmation(
        loadLocal(
          'prayas:affirmation',
          'Your efforts are building momentum.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffirmation();
  }, []);

  const burnoutSignals = useMemo(() => {
    const lastActive = loadLocal('prayas:last-active', Date.now());
    const lastPlan = loadLocal('prayas:planner-last', 0);
    const daysInactive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
    const daysSincePlan = lastPlan
      ? (Date.now() - lastPlan) / (1000 * 60 * 60 * 24)
      : 0;

    return {
      inactive: daysInactive > 3,
      missedPlans: daysSincePlan > 5
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Motivation & Mental Wellness"
        subtitle="Gentle prompts to stay steady during preparation."
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Daily affirmation</CardTitle>
          <p className="text-sm text-ink-600">
            Gentle prompts to stay steady during preparation.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-ink-100 bg-white/80 p-4 text-sm text-ink-700">
            {affirmation || 'Loading affirmation...'}
          </div>
          <Button variant="secondary" onClick={fetchAffirmation} disabled={loading}>
            {loading ? 'Refreshing...' : 'Generate New Affirmation'}
          </Button>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Current mood
            </label>
            <Select value={mood} onChange={(event) => setMood(event.target.value)}>
              {moods.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Burnout Check</CardTitle>
          <p className="text-xs text-ink-500">
            Based on inactivity and missed plans.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-ink-700">
          {burnoutSignals.inactive && (
            <p>
              You have been inactive for a few days. Ease back in with a light
              revision block.
            </p>
          )}
          {burnoutSignals.missedPlans && (
            <p>
              It has been a while since your last plan. Try generating a short
              2-hour reset schedule.
            </p>
          )}
          {!burnoutSignals.inactive && !burnoutSignals.missedPlans && (
            <p>Consistency looks good. Keep your rhythm steady.</p>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
