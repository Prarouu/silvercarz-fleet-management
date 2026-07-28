'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MotionSection } from '@/features/dashboard/components/motion';
import type { BookingStatusChartData } from '@/features/dashboard/types';
import { formatNumber } from '@/lib/format';

type BookingStatusChartProps = {
  readonly data: BookingStatusChartData;
};

type TooltipPayload = {
  readonly name?: string;
  readonly value?: number;
  readonly payload?: { readonly percentage?: number };
};

function ChartTooltip({
  active,
  payload,
}: {
  readonly active?: boolean;
  readonly payload?: readonly TooltipPayload[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const percentage = item.payload?.percentage ?? 0;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="mt-0.5 text-muted-foreground">
        {formatNumber(item.value ?? 0)} · {percentage}%
      </p>
    </div>
  );
}

/** Pie chart of booking display statuses — colors from Admin Theme tokens. */
export function BookingStatusChart({ data }: BookingStatusChartProps) {
  const chartData = data.slices.map((slice) => ({
    name: slice.label,
    value: slice.count,
    percentage: slice.percentage,
    color: slice.colorVar,
  }));

  const hasData = data.total > 0;

  return (
    <MotionSection delay={0.12} aria-label="Booking status distribution">
      <Card className="h-full shadow-none">
        <CardHeader>
          <CardTitle>Booking Status</CardTitle>
          <CardDescription>
            {hasData
              ? `${formatNumber(data.total)} total bookings across lifecycle states`
              : 'No bookings to chart yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center">
              <div
                className="mx-auto h-56 w-full max-w-xs"
                role="img"
                aria-label="Booking status pie chart"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2.5" aria-label="Status breakdown">
                {data.slices.map((slice) => (
                  <li
                    key={slice.status}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: slice.colorVar }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{slice.label}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {formatNumber(slice.count)} · {slice.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed bg-muted/15 px-4 text-center text-sm text-muted-foreground">
              Booking status will appear once you create your first hire.
            </div>
          )}
        </CardContent>
      </Card>
    </MotionSection>
  );
}
