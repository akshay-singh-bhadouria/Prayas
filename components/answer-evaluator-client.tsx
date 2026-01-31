'use client';

import { useState, type ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';

const normalizeMarkdown = (value: string) =>
  value.replace(/^(#{1,6})(\S)/gm, '$1 $2');

export function AnswerEvaluatorClient() {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePayload, setImagePayload] = useState<{
    data: string;
    mimeType: string;
  } | null>(null);

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

  const handleEvaluate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/evaluator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer,
          image: imagePayload?.data,
          mimeType: imagePayload?.mimeType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');
      setFeedback(data.feedback || '');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to evaluate right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([feedback], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prayas-answer-feedback.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Answer Writing & Essay Evaluator"
        subtitle="Get structured, rubric-based feedback in UPSC tone."
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Paste your response</CardTitle>
          <p className="text-sm text-ink-600">
            Paste your answer and get structured UPSC feedback.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Write your answer here..."
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Upload answer image (optional)
            </label>
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
                className="max-h-48 rounded-2xl border border-ink-200 object-contain"
              />
            )}
          </div>
          <Button
            onClick={handleEvaluate}
            disabled={loading || (!answer && !imagePayload)}
          >
            {loading ? 'Evaluating...' : 'Evaluate Answer'}
          </Button>
          {error && <p className="text-sm text-saffron-700">{error}</p>}
        </CardContent>
      </Card>

      <Card className="bg-white/80">
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
          <p className="text-xs text-ink-500">Export for revision logs.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="markdown text-sm text-ink-700">
            {feedback ? (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {normalizeMarkdown(feedback)}
              </ReactMarkdown>
            ) : (
              'AI feedback will appear here.'
            )}
          </div>
          {feedback && (
            <Button variant="secondary" onClick={handleExport}>
              Export Feedback
            </Button>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
