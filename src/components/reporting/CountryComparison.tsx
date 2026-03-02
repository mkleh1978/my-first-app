"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { CountryStat, DistributionItem } from "@/types/reporting";
import { countryToIso } from "@/lib/country-flags";
import { useChartColors, tooltipStyle, tooltipLabelStyle, tooltipItemStyle } from "@/lib/chart-theme";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X } from "lucide-react";

const CHART_COLORS = ["#006B6B", "#EA5A3C", "#170245", "#10B981", "#F59E0B"];

function formatFunding(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

type SortKey = "company_count" | "total_funding_sum" | "total_funding_avg" | "avg_founded_year";

export default function CountryComparison() {
  const chartColors = useChartColors();
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("company_count");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [detailData, setDetailData] = useState<Record<string, DistributionItem[]>>({});
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc("get_country_stats");
      setCountries((data as CountryStat[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const loadDetail = useCallback(async (country: string) => {
    if (detailData[country]) return;
    setDetailLoading((prev) => ({ ...prev, [country]: true }));
    const { data } = await supabase.rpc("get_country_detail", { p_country: country });
    setDetailData((prev) => ({ ...prev, [country]: (data as DistributionItem[]) ?? [] }));
    setDetailLoading((prev) => ({ ...prev, [country]: false }));
  }, [detailData]);

  function toggleCountry(country: string) {
    setSelectedCountries((prev) => {
      if (prev.includes(country)) return prev.filter((c) => c !== country);
      if (prev.length >= 3) return prev;
      return [...prev, country];
    });
    loadDetail(country);
  }

  function removeCountry(country: string) {
    setSelectedCountries((prev) => prev.filter((c) => c !== country));
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = [...countries]
    .filter((c) => !search || c.country.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortAsc ? diff : -diff;
    });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-border" />
        <div className="h-[400px] animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search countries..."
        className="w-full max-w-xs rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
      />

      {/* Overview Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="w-10 px-3 py-3" />
              <th className="px-4 py-3 font-semibold text-foreground">Country</th>
              <th
                className="cursor-pointer px-4 py-3 text-right font-semibold text-foreground hover:text-teal"
                onClick={() => handleSort("company_count")}
              >
                Companies<SortIcon col="company_count" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right font-semibold text-foreground hover:text-teal"
                onClick={() => handleSort("total_funding_sum")}
              >
                Total Funding<SortIcon col="total_funding_sum" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-right font-semibold text-foreground hover:text-teal"
                onClick={() => handleSort("total_funding_avg")}
              >
                Avg Funding<SortIcon col="total_funding_avg" />
              </th>
              <th className="px-4 py-3 font-semibold text-foreground">Top Category</th>
              <th
                className="cursor-pointer px-4 py-3 text-right font-semibold text-foreground hover:text-teal"
                onClick={() => handleSort("avg_founded_year")}
              >
                Avg Founded<SortIcon col="avg_founded_year" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const iso = countryToIso(c.country);
              const isSelected = selectedCountries.includes(c.country);
              return (
                <tr
                  key={c.country}
                  onClick={() => toggleCountry(c.country)}
                  className={`cursor-pointer border-b border-border transition-colors last:border-b-0 ${
                    isSelected
                      ? "bg-teal/10"
                      : "hover:bg-teal/5"
                  } ${selectedCountries.length >= 3 && !isSelected ? "opacity-50" : ""}`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="h-4 w-4 rounded border-border accent-teal"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      {iso && <span className={`fi fi-${iso}`} />}
                      {c.country}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {c.company_count.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {c.total_funding_sum > 0 ? formatFunding(c.total_funding_sum) : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {c.total_funding_avg > 0 ? formatFunding(c.total_funding_avg) : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.top_category}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {c.avg_founded_year > 0 ? Math.round(c.avg_founded_year) : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Comparison */}
      {selectedCountries.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          Select up to 3 countries from the table to compare side by side.
        </p>
      ) : (
        <div className={`grid gap-6 ${selectedCountries.length === 1 ? "grid-cols-1" : selectedCountries.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
          {selectedCountries.map((country) => {
            const stat = countries.find((c) => c.country === country);
            const details = detailData[country] ?? [];
            const isLoading = detailLoading[country];
            const iso = countryToIso(country);

            const categories = details.filter((d) => d.distribution_type === "category");
            const statuses = details.filter((d) => d.distribution_type === "status");
            const decades = details
              .filter((d) => d.distribution_type === "founded_decade")
              .sort((a, b) => a.label.localeCompare(b.label));

            return (
              <div key={country} className="rounded-lg border border-border bg-surface p-4">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    {iso && <span className={`fi fi-${iso} text-xl`} />}
                    {country}
                  </h3>
                  <button
                    onClick={() => removeCountry(country)}
                    className="rounded p-1 text-muted transition-colors hover:bg-border hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* KPIs */}
                {stat && (
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs text-muted">Companies</p>
                      <p className="text-lg font-bold text-foreground">{stat.company_count.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs text-muted">Total Funding</p>
                      <p className="text-lg font-bold text-foreground">
                        {stat.total_funding_sum > 0 ? formatFunding(stat.total_funding_sum) : "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs text-muted">Avg Funding</p>
                      <p className="text-lg font-bold text-foreground">
                        {stat.total_funding_avg > 0 ? formatFunding(stat.total_funding_avg) : "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Categories Bar Chart */}
                    {categories.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          Categories
                        </p>
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={categories} layout="vertical" margin={{ left: 0, right: 8 }}>
                            <XAxis type="number" hide />
                            <YAxis
                              type="category"
                              dataKey="label"
                              width={100}
                              tick={{ fontSize: 11, fill: chartColors.muted }}
                              tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 14) + "…" : v}
                            />
                            <Tooltip
                              contentStyle={tooltipStyle(chartColors)}
                              labelStyle={tooltipLabelStyle(chartColors)}
                              itemStyle={tooltipItemStyle(chartColors)}
                            />
                            <Bar dataKey="count" fill="#006B6B" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Status Pie Chart */}
                    {statuses.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          Status
                        </p>
                        <div className="flex items-center gap-2">
                          <ResponsiveContainer width="50%" height={120}>
                            <PieChart>
                              <Pie
                                data={statuses}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                outerRadius={50}
                                innerRadius={25}
                              >
                                {statuses.map((_, i) => (
                                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={tooltipStyle(chartColors)}
                                labelStyle={tooltipLabelStyle(chartColors)}
                                itemStyle={tooltipItemStyle(chartColors)}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex-1 space-y-1">
                            {statuses.map((s, i) => (
                              <div key={s.label} className="flex items-center gap-1.5 text-xs">
                                <span
                                  className="inline-block h-2 w-2 rounded-full"
                                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                />
                                <span className="text-muted">{s.label}</span>
                                <span className="ml-auto font-mono text-foreground">{s.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Founded Decades Bar Chart */}
                    {decades.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                          Founded
                        </p>
                        <ResponsiveContainer width="100%" height={100}>
                          <BarChart data={decades} margin={{ left: 0, right: 8 }}>
                            <XAxis
                              dataKey="label"
                              tick={{ fontSize: 11, fill: chartColors.muted }}
                            />
                            <YAxis hide />
                            <Tooltip
                              contentStyle={tooltipStyle(chartColors)}
                              labelStyle={tooltipLabelStyle(chartColors)}
                              itemStyle={tooltipItemStyle(chartColors)}
                            />
                            <Bar dataKey="count" fill="#EA5A3C" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
