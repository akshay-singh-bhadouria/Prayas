import { AppShell } from '@/components/app-shell';
import { DashboardClient } from '@/components/dashboard-client';

export default function Page() {
  return (
    <AppShell>
      <DashboardClient />
    </AppShell>
  );
}
