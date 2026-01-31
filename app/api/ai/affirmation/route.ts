import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';

export async function GET() {
  try {
    const affirmation = await callAI({
      system:
        'You are a gentle motivation coach for UPSC aspirants. Write 1 short daily affirmation (1-2 sentences).',
      prompt: 'Generate today\'s affirmation.',
      temperature: 0.7
    });
    return NextResponse.json({ affirmation });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI error';
    if (message.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'AI key missing. Configure .env.local.' },
        { status: 428 }
      );
    }
    return NextResponse.json(
      { error: 'Affirmation unavailable offline.' },
      { status: 503 }
    );
  }
}
