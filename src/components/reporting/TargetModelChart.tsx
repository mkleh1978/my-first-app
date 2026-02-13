"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DistributionItem } from "@/types/reporting";
import { TARGET_MODEL_COLORS } from "@/lib/category-colors";
import { useChartColors, tooltipStyle } from "@/lib/chart-theme";

interface TargetModelChartProps {
  items: DistributionItem[];
}

export default function TargetModelChart({ items }: TargetModelChartProps) {
  const colors = useChartColors();
  const modelItems = items.filter(
    (i) => i.distribution_type === "target_model"
  );

  if (modelItems.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-surface py-12">
        <p className="text-sm text-muted">No target model data</p>
      </div>
    );
  }

  const total = modelItems.reduce((sum, i) => sum + i.count, 0);
  const data = modelItems
    .sort((a, b) => b.count - a.count)
    .map((i) => ({
      name: i.label,
      value: i.count,
      color: TARGET_MODEL_COLORS[i.label] ?? "#9CA3AF",
    }));

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Target Model
      </h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${(value as number).toLocaleString()} (${(((value as number) / total) * 100).toFixed(1)}%)`,
                name,
              ]}
              contentStyle={tooltipStyle(colors)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted">{item.name}</span>
              <span className="font-medium text-foreground">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
