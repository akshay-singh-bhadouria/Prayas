import { NextResponse } from 'next/server';
import { fetchNews, type NewsCategory } from '@/lib/news';
import { callAI } from '@/lib/ai';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get('category') || 'polity') as NewsCategory;

  try {
    const articles = await fetchNews(category);
    const summarized = await Promise.all(
      articles.map(async (article: any) => {
        const baseText = article.description || article.content || article.title;
        if (!baseText) return { ...article, summary: '', why: '' };
        try {
          const summary = await callAI({
            system:
              'You summarize news for UPSC aspirants. Be concise and exam-relevant.',
            prompt: `Summarize in 2 bullet points: ${baseText}`,
            temperature: 0.3
          });
          const why = await callAI({
            system:
              'You explain UPSC relevance. Keep it within 2 short sentences.',
            prompt: `Why does this matter for UPSC? ${baseText}`,
            temperature: 0.3
          });
          return { ...article, summary, why };
        } catch {
          return { ...article, summary: '', why: '' };
        }
      })
    );
    return NextResponse.json({ articles: summarized });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'News unavailable.';
    if (message.includes('NEWS_API_KEY')) {
      return NextResponse.json(
        { error: 'NEWS_API_KEY missing. Configure .env.local.' },
        { status: 428 }
      );
    }
    return NextResponse.json(
      { error: 'News unavailable offline.' },
      { status: 503 }
    );
  }
}
