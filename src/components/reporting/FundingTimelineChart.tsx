"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FundingTimelinePoint } from "@/types/reporting";
import { getSegmentColor, formatFundingValue } from "@/lib/category-colors";
import { useChartColors, tooltipStyle } from "@/lib/chart-theme";

interface FundingTimelineChartProps {
  timeline: FundingTimelinePoint[];
}

export default function FundingTimelineChart({
  timeline,
}: FundingTimelineChartProps) {
  const colors = useChartColors();

  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-background py-12">
        <p className="text-sm text-muted">No timeline data available</p>
      </div>
    );
  }

  // Pivot: { year: "2010", "Financial Foundation": 123, "Risk Protection": 456, ... }
  const segments = [...new Set(timeline.map((t) => t.segment))];
  const years = [...new Set(timeline.map((t) => t.year_label))].sort();

  const pivoted = years.map((year) => {
    const row: Record<string, string | number> = { year };
    for (const seg of segments) {
      const point = timeline.find(
        (t) => t.year_label === year && t.segment === seg
      );
      row[seg] = point ? point.total : 0;
    }
    return row;
  });

  const segmentColors = segments.map((seg, i) => ({
    segment: seg,
    color: getSegmentColor(seg, i),
  }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Funding Timeline (2010–2025)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={pivoted}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
        >
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: colors.muted }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            tickFormatter={(v) => formatFundingValue(v)}
            tick={{ fontSize: 11, fill: colors.muted }}
            tickLine={false}
            axisLine={false}
            width={65}
          />
          <Tooltip
            formatter={(value, name) => [
              formatFundingValue(value as number),
              name,
            ]}
            contentStyle={tooltipStyle(colors)}
            cursor={{ fill: "rgba(0,107,107,0.05)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: colors.muted }}
          />
          {segmentColors.map(({ segment, color }) => (
            <Bar
              key={segment}
              dataKey={segment}
              stackId="a"
              fill={color}
              radius={[0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
