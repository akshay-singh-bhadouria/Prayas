'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { idbGet, idbSet } from '@/lib/db';
import { useOnlineStatus } from '@/lib/use-online-status';
import { PageHeader } from '@/components/page-header';

const categories = [
  { key: 'polity', label: 'Polity' },
  { key: 'economy', label: 'Economy' },
  { key: 'environment', label: 'Environment' },
  { key: 'ir', label: 'International Relations' },
  { key: 'ethics', label: 'Ethics' }
];

type Article = {
  title: string;
  description?: string;
  url?: string;
  publishedAt?: string;
  source?: { name?: string };
  summary?: string;
  why?: string;
};

export function PulseClient() {
  const [category, setCategory] = useState('polity');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const loadCached = async () => {
      const cached = await idbGet<Article[]>('pulse', category);
      if (cached) setArticles(cached);
    };
    loadCached();
  }, [category]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!isOnline) return;
      setLoading(true);
      setNotice('');
      try {
        const res = await fetch(`/api/news?category=${category}`);
        if (res.status === 428) {
          const data = await res.json();
          setNotice(data.error || 'Configure NEWS_API_KEY to fetch news.');
          return;
        }
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        const items = data.articles || [];
        setArticles(items);
        await idbSet('pulse', category, items);
      } catch {
        // keep cached
        if (!isOnline) {
          setNotice('Offline: showing cached summaries if available.');
        } else {
          setNotice('News service unavailable. Try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [category, isOnline]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="UPSC Pulse"
        subtitle="Curated current affairs with AI summaries and UPSC relevance."
      />
      <Card>
        <CardHeader>
          <CardTitle>Choose a focus area</CardTitle>
          <p className="text-sm text-ink-600">
            Stay exam-relevant without information overload.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button
              key={item.key}
              variant={category === item.key ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setCategory(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {loading && (
        <p className="text-sm text-ink-600">Fetching UPSC-relevant stories...</p>
      )}
      {notice && <p className="text-sm text-saffron-700">{notice}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {articles.map((article, index) => (
          <motion.div
            key={`${article.title}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="subtle">
                    {article.source?.name || 'UPSC Pulse'}
                  </Badge>
                  <span className="text-xs text-ink-500">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : 'Today'}
                  </span>
                </div>
                <CardTitle className="text-base">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-ink-700">
                <p>{article.description}</p>
                {article.summary && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-ink-500">
                      AI Summary
                    </p>
                    <p className="whitespace-pre-wrap">{article.summary}</p>
                  </div>
                )}
                {article.why && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-ink-500">
                      Why this matters for UPSC
                    </p>
                    <p>{article.why}</p>
                  </div>
                )}
                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-saffron-700"
                  >
                    Read full article
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {!articles.length && !loading && (
        <p className="text-sm text-ink-600">
          No cached stories yet. Connect to the internet once to seed offline
          summaries.
        </p>
      )}
    </div>
  );
}
