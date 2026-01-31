import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';

export async function POST(request: Request) {
  const { answer, image, mimeType } = await request.json();
  if (!answer && !image) {
    return NextResponse.json(
      { error: 'Answer text or image required' },
      { status: 400 }
    );
  }

  try {
    const basePrompt = 'Evaluate this UPSC answer and provide bullet-point feedback.';
    const prompt =
      answer && image
        ? `${basePrompt}\n\nAnswer text:\n${answer}\n\nUse the attached image as reference.`
        : answer
          ? `${basePrompt}\n\n${answer}`
          : `${basePrompt}\n\nUse the attached image.`;

    const feedback = await callAI({
      system:
        'You are a UPSC answer evaluator. Provide rubric-based feedback with structure, keywords, flow, tone, and improvement tips. Keep it concise but actionable.',
      prompt,
      temperature: 0.4,
      image: image
        ? { data: image, mimeType: mimeType || 'image/jpeg' }
        : undefined
    });
    return NextResponse.json({ feedback });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI error';
    if (message.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'AI key missing. Configure .env.local.' },
        { status: 428 }
      );
    }
    return NextResponse.json(
      { error: 'AI evaluator unavailable offline.' },
      { status: 503 }
    );
  }
}
