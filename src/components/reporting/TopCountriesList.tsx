"use client";

import { DistributionItem } from "@/types/reporting";

interface TopCountriesListProps {
  items: DistributionItem[];
}

export default function TopCountriesList({ items }: TopCountriesListProps) {
  const countryItems = items
    .filter((i) => i.distribution_type === "country")
    .sort((a, b) => b.count - a.count);

  if (countryItems.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-surface py-12">
        <p className="text-sm text-muted">Keine Länderdaten verfügbar</p>
      </div>
    );
  }

  const maxCount = countryItems[0]?.count ?? 1;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Top-Länder
      </h3>
      <div className="space-y-2.5">
        {countryItems.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-5 text-right text-xs font-medium text-muted">
              {index + 1}.
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className="text-xs font-medium text-muted">
                  {item.count.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-border">
                <div
                  className="h-1.5 rounded-full bg-teal"
                  style={{
                    width: `${(item.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
