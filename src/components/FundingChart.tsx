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
import { useState } from "react";
import { FinTechCompany } from "@/types/fintech";
import { useChartColors, tooltipStyle } from "@/lib/chart-theme";

interface FundingChartProps {
  company: FinTechCompany;
}

const TEAL = "#006B6B";
const ORANGE = "#EA5A3C";

function formatFundingAxis(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatFundingTooltip(value: number): string {
  if (value >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

interface ChartDataPoint {
  year: string;
  amount: number;
}

export default function FundingChart({ company }: FundingChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const colors = useChartColors();

  const allYears: { year: string; raw: string | null }[] = [
    { year: "2010", raw: company.funding_2010 },
    { year: "2011", raw: company.funding_2011 },
    { year: "2012", raw: company.funding_2012 },
    { year: "2013", raw: company.funding_2013 },
    { year: "2014", raw: company.funding_2014 },
    { year: "2015", raw: company.funding_2015 },
    { year: "2016", raw: company.funding_2016 },
    { year: "2017", raw: company.funding_2017 },
    { year: "2018", raw: company.funding_2018 },
    { year: "2019", raw: company.funding_2019 },
    { year: "2020", raw: company.funding_2020 },
    { year: "2021", raw: company.funding_2021 },
    { year: "2022", raw: company.funding_2022 },
    { year: "2023", raw: company.funding_2023 },
    { year: "2024", raw: company.funding_2024 },
    { year: "2025", raw: company.funding_2025 },
  ];

  const chartData: ChartDataPoint[] = allYears
    .filter((y) => {
      if (!y.raw) return false;
      const num = parseFloat(y.raw);
      return !isNaN(num) && num > 0;
    })
    .map((y) => ({
      year: y.year,
      amount: parseFloat(y.raw!),
    }));

  // No funding data at all
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-background py-12">
        <p className="text-sm text-muted">Keine Funding-Daten verfügbar</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: colors.muted }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
          />
          <YAxis
            tickFormatter={formatFundingAxis}
            tick={{ fontSize: 11, fill: colors.muted }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value) => [
              formatFundingTooltip(value as number),
              "Funding",
            ]}
            contentStyle={tooltipStyle(colors)}
            cursor={{ fill: "rgba(0,107,107,0.05)" }}
          />
          <Bar
            dataKey="amount"
            radius={[4, 4, 0, 0]}
            onMouseEnter={(_, index) => setHoveredIndex(index)}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={hoveredIndex === index ? ORANGE : TEAL}
                style={{ transition: "fill 0.15s ease" }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
