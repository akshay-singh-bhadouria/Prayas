'use server';

import { callAI } from '@/lib/ai';

export async function generatePlan(
  prevState: { plan: string; error: string | null },
  formData: FormData
) {
  const hours = formData.get('hours');
  const target = formData.get('target');

  if (!hours || !target) {
    return { plan: '', error: 'Please provide hours and target stage.' };
  }

  const system =
    'You are an expert UPSC mentor. Create practical, calming, daily study plans. Use bullet points and clear time blocks.';
  const prompt = `Create a 1-day UPSC study plan for ${hours} hours. Target stage: ${target}. Include: subject rotation, revision blocks, and micro-breaks. Finish with 2 short suggestions.`;

  try {
    const plan = await callAI({ system, prompt, temperature: 0.4 });
    return { plan, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected AI error.';
    return { plan: '', error: message };
  }
}
