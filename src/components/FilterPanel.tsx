"use client";

import { Filters, CATEGORIES } from "@/types/fintech";

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  countries: string[];
  subcategories: string[];
  totalCount: number;
  filteredCount: number;
}

export default function FilterPanel({
  filters,
  onChange,
  countries,
  subcategories,
  totalCount,
  filteredCount,
}: FilterPanelProps) {
  const update = (partial: Partial<Filters>) =>
    onChange({ ...filters, ...partial });

  const hasActiveFilters =
    filters.category ||
    filters.subcategory ||
    filters.country ||
    filters.status ||
    filters.targetModel ||
    filters.memberOnly;

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search companies, domains, descriptions..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
          />
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value, subcategory: "" })
          }
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Subcategory — only shown when a category is selected */}
        {filters.category && subcategories.length > 0 && (
          <select
            value={filters.subcategory}
            onChange={(e) => update({ subcategory: e.target.value })}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
          >
            <option value="">All Subcategories</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        )}

        {/* Country */}
        <select
          value={filters.country}
          onChange={(e) => update({ country: e.target.value })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        >
          <option value="">All Statuses</option>
          <option value="Operational">Operational</option>
          <option value="Closed">Closed</option>
          <option value="Acquired">Acquired</option>
        </select>

        {/* Target Model */}
        <select
          value={filters.targetModel}
          onChange={(e) => update({ targetModel: e.target.value })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        >
          <option value="">All Models</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
          <option value="B2B, B2C">B2B & B2C</option>
        </select>

        {/* HoFT Member toggle */}
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={filters.memberOnly}
            onChange={(e) => update({ memberOnly: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary accent-primary"
          />
          <span>HoFT Members</span>
        </label>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() =>
              onChange({
                search: filters.search,
                category: "",
                subcategory: "",
                country: "",
                status: "",
                targetModel: "",
                memberOnly: false,
              })
            }
            className="rounded-lg px-3 py-2 text-sm text-primary-light hover:bg-primary-light/10"
          >
            Reset filters
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-sm text-muted">
          {filteredCount.toLocaleString()} von {totalCount.toLocaleString()}{" "}
          Companies
        </span>
      </div>
    </div>
  );
}
