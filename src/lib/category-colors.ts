/** Shared category color mapping — used in CompanyTable badges and Reporting charts */
export const CATEGORY_COLORS: Record<string, string> = {
  "Financial Foundation": "#2563EB",
  "Financial Education": "#9333EA",
  "Infrastructure & Technology": "#475569",
  "Investment & Wealth Building": "#16A34A",
  "Risk Protection": "#EA580C",
};

/** Tailwind badge classes per category (for use in CompanyTable CategoryBadge) */
export const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  "Financial Foundation":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Financial Education":
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Infrastructure & Technology":
    "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
  "Investment & Wealth Building":
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Risk Protection":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

/** Status colors for Donut chart */
export const STATUS_COLORS: Record<string, string> = {
  Operational: "#16A34A",
  Closed: "#DC2626",
  Acquired: "#D97706",
  IPO: "#2563EB",
  "Website Inactive": "#9CA3AF",
  "Low Activity": "#6B7280",
};

/** Target model colors for Donut chart */
export const TARGET_MODEL_COLORS: Record<string, string> = {
  B2B: "#006B6B",
  B2C: "#EA5A3C",
  "B2B, B2C": "#170245",
};

export function formatFundingValue(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  if (value === 0) return "-";
  return `$${value.toFixed(0)}`;
}

/** Get color for a segment — tries CATEGORY_COLORS first, then generates a deterministic color */
export function getSegmentColor(segment: string, index: number): string {
  if (CATEGORY_COLORS[segment]) return CATEGORY_COLORS[segment];
  const hues = [210, 280, 340, 160, 30, 190, 50, 310, 120, 0];
  return `hsl(${hues[index % hues.length]}, 55%, 50%)`;
}
