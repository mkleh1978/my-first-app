"use client";

import { CategoryStat } from "@/types/reporting";
import { CATEGORY_COLORS, formatFundingValue } from "@/lib/category-colors";

interface CategoryKpiCardsProps {
  stats: CategoryStat[];
  activeSegment: string | null;
  onSelect: (segment: string | null) => void;
}

export default function CategoryKpiCards({
  stats,
  activeSegment,
  onSelect,
}: CategoryKpiCardsProps) {
  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border py-12">
        <p className="text-sm text-muted">No data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const color = CATEGORY_COLORS[stat.segment] ?? "#6B7280";
        const isActive = activeSegment === stat.segment;

        return (
          <button
            key={stat.segment}
            onClick={() => onSelect(isActive ? null : stat.segment)}
            className={`rounded-lg border p-4 text-left transition-all cursor-pointer hover:shadow-md ${
              isActive
                ? "border-2 shadow-md"
                : "border-border hover:border-gray-300"
            }`}
            style={isActive ? { borderColor: color } : undefined}
          >
            <div
              className="mb-2 h-1 w-8 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div className="text-xs font-medium text-muted line-clamp-2">
              {stat.segment}
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {stat.company_count.toLocaleString()}
            </div>
            <div className="text-xs text-muted">companies</div>
            <div className="mt-2 text-sm font-semibold text-foreground">
              {formatFundingValue(stat.total_funding_sum)}
            </div>
            <div className="text-[11px] text-muted">
              avg {formatFundingValue(stat.total_funding_avg)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
