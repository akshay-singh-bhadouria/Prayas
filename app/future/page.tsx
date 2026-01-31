import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';

export default function FuturePage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Future Scope"
          subtitle="Planned integrations for the next iteration of PRAYAS."
        />
        <Card>
          <CardHeader>
            <CardTitle>Future Scope (Planned Integrations)</CardTitle>
            <p className="text-sm text-ink-600">
              The following capabilities are intentionally out of scope for this
              build and planned for future releases.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-ink-700">
            <p>• Authentication & user profiles</p>
            <p>• Peer-to-peer learning circles</p>
            <p>• Mentor marketplace & booking</p>
            <p>• Long-term analytics across devices</p>
            <p>• Native mobile app</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why this page exists</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-ink-700">
            This build is fully functional offline-first without authentication
            or a server-side database. Advanced ecosystem features are
            intentionally deferred to keep the core experience fast, private,
            and reliable.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
