import { getDashboardData } from '@/features/dashboard/actions';
import { DashboardPage } from '@/features/dashboard/components';

export const dynamic = 'force-dynamic';

export default async function DashboardRoute() {
  const response = await getDashboardData();

  if (!response.success) {
    return <DashboardPage data={null} errorMessage={response.error.message} />;
  }

  return <DashboardPage data={response.data} />;
}
