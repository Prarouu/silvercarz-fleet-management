'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MotionSection } from '@/features/dashboard/components/motion';
import type { FleetAvailabilityChartData } from '@/features/dashboard/types';
import { formatNumber } from '@/lib/format';

type FleetAvailabilityChartProps = {
  readonly data: FleetAvailabilityChartData;
};

type TooltipPayload = {
  readonly name?: string;
  readonly value?: number;
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

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="mt-0.5 text-muted-foreground">{formatNumber(item.value ?? 0)} vehicles</p>
    </div>
  );
}

/** Horizontal bar chart of fleet availability — colors from Admin Theme tokens. */
export function FleetAvailabilityChart({ data }: FleetAvailabilityChartProps) {
  const chartData = data.bars.map((bar) => ({
    name: bar.label,
    value: bar.count,
    color: bar.colorVar,
  }));

  const hasData = data.total > 0;

  return (
    <MotionSection delay={0.16} aria-label="Fleet availability distribution">
      <Card className="h-full shadow-none">
        <CardHeader>
          <CardTitle>Fleet Availability</CardTitle>
          <CardDescription>
            {hasData
              ? `${formatNumber(data.total)} vehicles across availability states`
              : 'No vehicles to chart yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="h-56 w-full" role="img" aria-label="Fleet availability bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground text-xs"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground text-xs"
                  />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Vehicles" radius={[0, 6, 6, 0]} barSize={18}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed bg-muted/15 px-4 text-center text-sm text-muted-foreground">
              Fleet availability will appear once vehicles are added.
            </div>
          )}
        </CardContent>
      </Card>
    </MotionSection>
  );
}
