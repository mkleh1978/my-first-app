"use client";

import { KeywordItem } from "@/types/reporting";

interface TopKeywordsCloudProps {
  keywords: KeywordItem[];
}

export default function TopKeywordsCloud({
  keywords,
}: TopKeywordsCloudProps) {
  if (keywords.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-surface py-12">
        <p className="text-sm text-muted">Keine Feature-Daten verfügbar</p>
      </div>
    );
  }

  const maxCount = keywords[0]?.count ?? 1;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
        Top-Produktmerkmale
      </h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => {
          // Scale opacity based on relative frequency
          const intensity = 0.4 + (kw.count / maxCount) * 0.6;
          return (
            <span
              key={kw.keyword}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-teal/5"
              style={{ opacity: intensity }}
            >
              <span className="font-medium text-foreground">{kw.keyword}</span>
              <span className="text-xs text-muted">
                ({kw.count.toLocaleString()})
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
