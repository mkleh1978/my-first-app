"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CategoryStat } from "@/types/reporting";
import { getSegmentColor, formatFundingValue } from "@/lib/category-colors";
import { useChartColors, tooltipStyle } from "@/lib/chart-theme";

interface FundingByCategoryChartProps {
  stats: CategoryStat[];
}

export default function FundingByCategoryChart({
  stats,
}: FundingByCategoryChartProps) {
  const colors = useChartColors();

  if (stats.length === 0 || stats.every((s) => s.total_funding_sum === 0)) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-background py-12">
        <p className="text-sm text-muted">No funding data available</p>
      </div>
    );
  }

  const data = stats
    .filter((s) => s.total_funding_sum > 0)
    .map((s, i) => ({
      name: s.segment.length > 40 ? s.segment.slice(0, 38) + "..." : s.segment,
      fullName: s.segment,
      value: s.total_funding_sum,
      color: getSegmentColor(s.segment, i),
    }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Total Funding by Segment
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, bottom: 30, left: 150 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v) => formatFundingValue(v)}
            tick={{ fontSize: 11, fill: colors.muted }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: colors.foreground }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            formatter={(value) => [
              formatFundingValue(value as number),
              "Total Funding",
            ]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName ?? ""
            }
            contentStyle={tooltipStyle(colors)}
            cursor={{ fill: "rgba(0,107,107,0.05)" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
