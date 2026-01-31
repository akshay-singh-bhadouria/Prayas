import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';

const modeInstructions: Record<string, string> = {
  strategy:
    'You are a strategic UPSC mentor. Give structured, step-by-step guidance. Keep tone calm and practical.',
  motivation:
    'You are an empathetic motivation coach for UPSC aspirants. Encourage consistency and self-compassion.',
  counselling:
    'You are a supportive, non-medical counsellor. Provide gentle coping suggestions and encourage seeking professional help for severe distress.'
};

export async function POST(request: Request) {
  const { message, mode } = await request.json();
  if (!message) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  try {
    const reply = await callAI({
      system: modeInstructions[mode] || modeInstructions.strategy,
      prompt: message,
      temperature: 0.6
    });
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI error';
    if (message.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'AI key missing. Configure .env.local.' },
        { status: 428 }
      );
    }
    return NextResponse.json(
      { error: 'Mentor unavailable offline.' },
      { status: 503 }
    );
  }
}
