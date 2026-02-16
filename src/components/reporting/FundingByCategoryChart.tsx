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
        <p className="text-sm text-muted">Keine Finanzierungsdaten verfügbar</p>
      </div>
    );
  }

  const data = stats
    .filter((s) => s.total_funding_sum > 0)
    .map((s, i) => ({
      name: s.segment.length > 20 ? s.segment.slice(0, 18) + "..." : s.segment,
      fullName: s.segment,
      value: s.total_funding_sum,
      color: getSegmentColor(s.segment, i),
    }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Gesamtfinanzierung nach Segment
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 8, right: 8, left: 8, bottom: 40 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: colors.muted }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(v) => formatFundingValue(v)}
            tick={{ fontSize: 11, fill: colors.muted }}
            tickLine={false}
            axisLine={false}
            width={65}
          />
          <Tooltip
            formatter={(value) => [
              formatFundingValue(value as number),
              "Gesamtfinanzierung",
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
