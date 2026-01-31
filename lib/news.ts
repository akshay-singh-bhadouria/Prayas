export type NewsCategory = 'polity' | 'economy' | 'environment' | 'ir' | 'ethics';

const categoryMap: Record<NewsCategory, string> = {
  polity: 'government OR constitution OR election',
  economy: 'economy OR inflation OR RBI OR budget',
  environment: 'climate OR biodiversity OR conservation',
  ir: 'geopolitics OR diplomacy OR UN OR bilateral',
  ethics: 'ethics OR governance OR transparency'
};

export async function fetchNews(category: NewsCategory) {
  const provider = process.env.NEWS_PROVIDER || 'gnews';
  const key = process.env.NEWS_API_KEY;
  if (!key) throw new Error('NEWS_API_KEY missing');

  if (provider === 'newsapi') {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', categoryMap[category]);
    url.searchParams.set('language', 'en');
    url.searchParams.set('pageSize', '6');
    url.searchParams.set('sortBy', 'publishedAt');

    const res = await fetch(url, {
      headers: { 'X-Api-Key': key }
    });
    if (!res.ok) throw new Error('NewsAPI error');
    const data = await res.json();
    return data.articles || [];
  }

  const url = new URL('https://gnews.io/api/v4/search');
  url.searchParams.set('q', categoryMap[category]);
  url.searchParams.set('lang', 'en');
  url.searchParams.set('max', '6');
  url.searchParams.set('sortby', 'publishedAt');
  url.searchParams.set('token', key);

  const res = await fetch(url);
  if (!res.ok) throw new Error('GNews error');
  const data = await res.json();
  return data.articles || [];
}
