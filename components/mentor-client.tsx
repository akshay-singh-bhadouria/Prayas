'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { idbGet, idbSet } from '@/lib/db';
import { PageHeader } from '@/components/page-header';

const modes = [
  { value: 'strategy', label: 'Strategy Mentor' },
  { value: 'motivation', label: 'Motivation Coach' },
  { value: 'counselling', label: 'Stress & Burnout Counsellor' }
];

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function MentorClient() {
  const [mode, setMode] = useState('strategy');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    idbGet<ChatMessage[]>('sessions', `mentor-${mode}`).then((data) => {
      if (data) setMessages(data);
    });
  }, [mode]);

  useEffect(() => {
    if (messages.length) {
      idbSet('sessions', `mentor-${mode}`, messages);
    }
  }, [messages, mode]);

  const sendMessage = async () => {
    if (!input) return;
    const newMessage = { role: 'user' as const, content: input };
    const nextMessages = [...messages, newMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, mode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Mentor unavailable right now.';
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: message.includes('Configure')
            ? message
            : 'I am offline right now. When you reconnect, I can continue supporting you.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Mentor & Counselling Assistant"
        subtitle="Choose a mode for strategy, motivation, or stress support."
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Conversation space</CardTitle>
          <p className="text-sm text-ink-600">
            Choose a mode and chat for UPSC-specific guidance.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={mode} onChange={(event) => setMode(event.target.value)}>
            {modes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <div className="h-72 space-y-3 overflow-y-auto rounded-2xl border border-ink-100 bg-white/70 p-4 text-sm">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-ink-900 text-white'
                    : 'bg-ink-100 text-ink-800'
                }`}
              >
                {message.content}
              </div>
            ))}
            {!messages.length && (
              <p className="text-ink-500">Start a conversation.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for guidance..."
            />
            <Button onClick={sendMessage} disabled={loading}>
              {loading ? 'Sending' : 'Send'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
          <p className="text-xs text-ink-500">
            Stored locally for offline reflection.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-ink-700">
          <p>
            Ask for a weekly plan, accountability, or mindset check-ins. The AI
            keeps responses supportive and non-medical.
          </p>
          <p>
            If you are feeling overwhelmed, consider speaking with a trusted
            mentor or professional counselor.
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
