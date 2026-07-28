'use server';

/**
 * Admin Dashboard Server Actions.
 */

import { getDashboardService } from '@/features/dashboard/service';
import type { DashboardData } from '@/features/dashboard/types';
import type { ApiResponse } from '@/types';

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  return getDashboardService().getDashboardData();
}
