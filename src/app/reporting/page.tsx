"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  CategoryStat,
  FundingTimelinePoint,
  DistributionItem,
  KeywordItem,
} from "@/types/reporting";
import Header from "@/components/Header";
import CategoryKpiCards from "@/components/reporting/CategoryKpiCards";
import FundingByCategoryChart from "@/components/reporting/FundingByCategoryChart";
import FundingTimelineChart from "@/components/reporting/FundingTimelineChart";
import StatusDistributionChart from "@/components/reporting/StatusDistributionChart";
import TargetModelChart from "@/components/reporting/TargetModelChart";
import TopCountriesList from "@/components/reporting/TopCountriesList";
import TopKeywordsCloud from "@/components/reporting/TopKeywordsCloud";

export default function ReportingPage() {
  // 3-level drill-down state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );

  // Data states
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [timeline, setTimeline] = useState<FundingTimelinePoint[]>([]);
  const [distributions, setDistributions] = useState<DistributionItem[]>([]);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (category: string | null, subcategory: string | null) => {
      setLoading(true);
      setError(null);

      const categoryParam = category ?? undefined;
      const subcategoryParam = subcategory ?? undefined;

      // Level 2: stats stay at Level 1 (all subcategories for KPI cards)
      // Charts filter to the specific subcategory
      const [statsRes, timelineRes, distRes, kwRes] = await Promise.all([
        supabase.rpc("get_category_stats", { p_category: categoryParam }),
        supabase.rpc("get_category_funding_timeline", {
          p_category: categoryParam,
          p_subcategory: subcategoryParam,
        }),
        supabase.rpc("get_category_distributions", {
          p_category: categoryParam,
          p_subcategory: subcategoryParam,
        }),
        supabase.rpc("get_top_keywords", {
          p_category: categoryParam,
          p_subcategory: subcategoryParam,
          p_limit: 15,
        }),
      ]);

      if (statsRes.error || timelineRes.error || distRes.error || kwRes.error) {
        setError("Failed to load reporting data. Please try again.");
        setLoading(false);
        return;
      }

      setStats((statsRes.data as CategoryStat[]) ?? []);
      setTimeline((timelineRes.data as FundingTimelinePoint[]) ?? []);
      setDistributions((distRes.data as DistributionItem[]) ?? []);
      setKeywords((kwRes.data as KeywordItem[]) ?? []);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchData(selectedCategory, selectedSubcategory);
  }, [selectedCategory, selectedSubcategory, fetchData]);

  // Level 0: card click → drill into category (Level 1)
  // Level 1: card click → focus subcategory (Level 2)
  // Level 2: card click → toggle subcategory focus
  function handleCardSelect(segment: string | null) {
    if (selectedCategory === null) {
      // Level 0 → Level 1
      setSelectedCategory(segment);
    } else {
      // Level 1/2 → toggle subcategory
      setSelectedSubcategory(segment);
    }
  }

  function handleBack() {
    if (selectedSubcategory) {
      // Level 2 → Level 1
      setSelectedSubcategory(null);
    } else {
      // Level 1 → Level 0
      setSelectedCategory(null);
    }
  }

  function handleRetry() {
    fetchData(selectedCategory, selectedSubcategory);
  }

  // Determine current level for UI
  const level = selectedCategory === null ? 0 : selectedSubcategory === null ? 1 : 2;

  // Page title and subtitle
  const title =
    level === 0
      ? "Aggregated Category Analysis"
      : level === 1
        ? `${selectedCategory} — Subcategory Analysis`
        : `${selectedCategory} → ${selectedSubcategory}`;

  const subtitle =
    level === 0
      ? "Overview across all 5 main categories"
      : level === 1
        ? "Drill-down into subcategories"
        : "Subcategory focus";

  // Back button label
  const backLabel =
    level === 2
      ? `Back to ${selectedCategory}`
      : "Back to Overview";

  // Active segment for KPI card highlighting
  const activeSegment =
    level === 0
      ? null // Level 0: no card highlighted
      : level === 2
        ? selectedSubcategory // Level 2: focused subcategory highlighted
        : null; // Level 1: no card highlighted

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Page title + breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
          {level > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {backLabel}
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-muted">
              <svg
                className="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading reporting data...
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              className="mb-3 h-12 w-12 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <p className="text-lg font-medium text-foreground">
              Failed to load reporting data.
            </p>
            <p className="mb-4 text-sm text-muted">Please try again.</p>
            <button
              onClick={handleRetry}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              Retry
            </button>
          </div>
        )}

        {/* Data loaded */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <CategoryKpiCards
              stats={stats}
              activeSegment={activeSegment}
              onSelect={handleCardSelect}
            />

            {/* Charts row: Funding bar + Timeline */}
            <div className="grid gap-6 lg:grid-cols-2">
              <FundingByCategoryChart stats={stats} />
              <FundingTimelineChart timeline={timeline} />
            </div>

            {/* Insights row: Status + Target Model + Countries */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatusDistributionChart items={distributions} />
              <TargetModelChart items={distributions} />
              <TopCountriesList items={distributions} />
            </div>

            {/* Keywords */}
            <TopKeywordsCloud keywords={keywords} />
          </div>
        )}
      </main>
    </div>
  );
}
