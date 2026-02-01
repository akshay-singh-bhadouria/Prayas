import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md rounded-3xl border border-ink-100 bg-white/80 p-8 shadow-soft">
        <h1 className="font-headline text-3xl">You are offline</h1>
        <p className="mt-3 text-sm text-ink-600">
          PRAYAS is still available. Your saved plans and summaries are ready
          offline.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
