'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import questions from '@/data/questions.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { idbGet, idbSet } from '@/lib/db';
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { PageHeader } from '@/components/page-header';

const initialTimer = 600;
const normalizeMarkdown = (value: string) =>
  value.replace(/^(#{1,6})(\S)/gm, '$1 $2');

type Question = (typeof questions)[number];

export function TestsClient() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(initialTimer);
  const [accuracy, setAccuracy] = useState(0);
  const [topicStats, setTopicStats] = useState<Record<string, number>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePayload, setImagePayload] = useState<{
    data: string;
    mimeType: string;
  } | null>(null);
  const [imageFeedback, setImageFeedback] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const question = questions[index];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    idbGet<{ attempts: number; accuracy: number; topicStats: Record<string, number> }>(
      'analytics',
      'latest'
    ).then((data) => {
      if (data) {
        setAttempts(data.attempts);
        setAccuracy(data.accuracy);
        setTopicStats(data.topicStats || {});
      }
    });
  }, []);

  useEffect(() => {
    if (attempts > 0) {
      idbSet('analytics', 'latest', {
        attempts,
        accuracy,
        topicStats
      });
    }
  }, [attempts, accuracy, topicStats]);

  const handleSubmit = () => {
    if (selected === null) return;
    const correct = selected === question.answer;
    setScore((prev) => prev + (correct ? 1 : 0));
    setAttempts((prev) => prev + 1);
    const nextIndex = (index + 1) % questions.length;
    setIndex(nextIndex);
    setSelected(null);

    const total = attempts + 1;
    const newScore = score + (correct ? 1 : 0);
    setAccuracy(newScore / total);
    setTopicStats((prev) => ({
      ...prev,
      [question.topic]: (prev[question.topic] || 0) + (correct ? 1 : 0)
    }));
  };

  const chartData = useMemo(() => {
    const topics = Array.from(new Set(questions.map((q) => q.topic)));
    return topics.map((topic) => ({
      topic,
      score: topicStats[topic] || 0
    }));
  }, [topicStats]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      setImagePayload(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.split(',')[1] || '';
      setImagePreview(result);
      setImagePayload({ data: base64, mimeType: file.type || 'image/jpeg' });
    };
    reader.readAsDataURL(file);
  };

  const handleImageEvaluate = async () => {
    if (!imagePayload) return;
    setImageLoading(true);
    setImageError('');
    try {
      const res = await fetch('/api/ai/evaluator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePayload.data,
          mimeType: imagePayload.mimeType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');
      setImageFeedback(data.feedback || '');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to evaluate right now.';
      setImageError(message);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Testing & Analytics"
        subtitle="Practice with timed questions and track your local progress."
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Topic-wise Test</CardTitle>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Badge variant="subtle">{question.topic}</Badge>
            <span>Difficulty: {question.difficulty}</span>
            <span>Timer: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-ink-700">{question.question}</p>
          <div className="grid gap-2">
            {question.options.map((option, optionIndex) => (
              <button
                key={option}
                onClick={() => setSelected(optionIndex)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  selected === optionIndex
                    ? 'border-ink-900 bg-ink-900 text-white'
                    : 'border-ink-200 bg-white/80 hover:bg-ink-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <Button onClick={handleSubmit}>Submit Answer</Button>
          <div className="text-xs text-ink-500">
            Explanation: {question.explanation}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Snapshot</CardTitle>
          <p className="text-xs text-ink-500">
            Stored locally. No account required.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Attempts</span>
            <span className="font-semibold">{attempts}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Accuracy</span>
            <span className="font-semibold">{(accuracy * 100).toFixed(0)}%</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar
                  dataKey="score"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      </div>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>Upload Answer Image</CardTitle>
          <p className="text-xs text-ink-500">
            Send a handwritten answer photo to Gemini for feedback.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-ink-600 file:mr-4 file:rounded-full file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-wide file:text-white"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Answer preview"
              className="max-h-56 rounded-2xl border border-ink-200 object-contain"
            />
          )}
          <Button
            onClick={handleImageEvaluate}
            disabled={imageLoading || !imagePayload}
          >
            {imageLoading ? 'Checking...' : 'Check with AI'}
          </Button>
          {imageError && <p className="text-sm text-saffron-700">{imageError}</p>}
          <div className="markdown text-sm text-ink-700">
            {imageFeedback ? (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {normalizeMarkdown(imageFeedback)}
              </ReactMarkdown>
            ) : (
              'AI feedback will appear here.'
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
