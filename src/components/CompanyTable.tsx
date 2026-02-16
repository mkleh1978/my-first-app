"use client";

import { FinTechCompany, SortColumn, SortConfig } from "@/types/fintech";
import { countryToIso } from "@/lib/country-flags";
import { useAuth } from "@/lib/auth-context";
import StarButton from "@/components/StarButton";
import { ExternalLink } from "lucide-react";

interface CompanyTableProps {
  companies: FinTechCompany[];
  onSelect: (company: FinTechCompany) => void;
  loading: boolean;
  sort: SortConfig;
  onSortChange: (column: SortColumn) => void;
  error: string | null;
  onRetry: () => void;
}

function formatFunding(value: number | null): string {
  if (value == null || value === 0) return "-";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatYear(value: number | null): string {
  if (value == null) return "-";
  return value.toString();
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted">-</span>;
  const colors: Record<string, string> = {
    Operational: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    Closed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    Acquired: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
    >
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string | null }) {
  if (!category) return null;
  const colors: Record<string, string> = {
    "Financial Foundation": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "Financial Education": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    "Infrastructure & Technology": "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    "Investment & Wealth Building": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    "Risk Protection": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[category] ?? "bg-gray-100 text-gray-800"}`}
    >
      {category}
    </span>
  );
}

function SortIcon({ column, sort }: { column: SortColumn; sort: SortConfig }) {
  const isActive = sort.column === column;
  if (!isActive) {
    return (
      <svg className="ml-1 inline h-3.5 w-3.5 text-muted/40" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3l4 5H4l4-5zM8 13l-4-5h8l-4 5z" />
      </svg>
    );
  }
  if (sort.direction === "asc") {
    return (
      <svg className="ml-1 inline h-3.5 w-3.5 text-teal" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3l4 5H4l4-5z" />
      </svg>
    );
  }
  return (
    <svg className="ml-1 inline h-3.5 w-3.5 text-teal" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 13l-4-5h8l-4 5z" />
    </svg>
  );
}

function SortableHeader({
  label,
  column,
  sort,
  onSortChange,
  className = "",
}: {
  label: string;
  column: SortColumn;
  sort: SortConfig;
  onSortChange: (column: SortColumn) => void;
  className?: string;
}) {
  return (
    <th
      className={`cursor-pointer select-none px-4 py-3 font-semibold text-foreground transition-colors hover:bg-teal/5 ${className}`}
      onClick={() => onSortChange(column)}
    >
      {label}
      <SortIcon column={column} sort={sort} />
    </th>
  );
}

export default function CompanyTable({
  companies,
  onSelect,
  loading,
  sort,
  onSortChange,
  error,
  onRetry,
}: CompanyTableProps) {
  const { isAdmin } = useAuth();
  if (loading) {
    return (
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
          Loading companies...
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
        <p className="text-lg font-medium text-foreground">Failed to load companies.</p>
        <p className="mb-4 text-sm text-muted">Please try again.</p>
        <button
          onClick={onRetry}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Retry
        </button>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <svg
          className="mb-3 h-12 w-12 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-medium">No companies found</p>
        <p className="text-sm">Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="w-10 px-3 py-3" />
            <SortableHeader label="Company" column="company_name" sort={sort} onSortChange={onSortChange} />
            <th className="px-4 py-3 font-semibold text-foreground">Category</th>
            <th className="px-4 py-3 font-semibold text-foreground">Subcategory</th>
            <SortableHeader label="Country" column="country" sort={sort} onSortChange={onSortChange} />
            {isAdmin && (
              <>
                <th className="px-4 py-3 font-semibold text-foreground">Contact</th>
                <th className="px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="px-4 py-3 font-semibold text-foreground">LinkedIn</th>
              </>
            )}
            <SortableHeader label="Founded" column="founded_year" sort={sort} onSortChange={onSortChange} />
            <SortableHeader label="Total Funding" column="total_funding" sort={sort} onSortChange={onSortChange} className="text-right" />
            <SortableHeader label="Employees" column="number_of_employees" sort={sort} onSortChange={onSortChange} />
            <th className="px-4 py-3 font-semibold text-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company.id}
              onClick={() => onSelect(company)}
              className="cursor-pointer border-b border-border transition-colors hover:bg-teal/5 last:border-b-0"
            >
              <td className="px-3 py-3">
                <StarButton companyId={company.id} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {company.company_name ?? "-"}
                      </span>
                      {company.member && (
                        <span className="inline-flex rounded bg-teal/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal">
                          HoFT
                        </span>
                      )}
                    </div>
                    {company.domain && (
                      <span className="text-xs text-muted">
                        {company.domain}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={company.category_1} />
              </td>
              <td className="px-4 py-3 text-muted">
                {company.subcategory_1 ?? "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {company.country ? (
                  <span className="inline-flex items-center gap-1.5">
                    {countryToIso(company.country) && (
                      <span className={`fi fi-${countryToIso(company.country)}`} />
                    )}
                    {company.country}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              {isAdmin && (
                <>
                  <td className="px-4 py-3 text-muted">
                    {company.contact_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {company.job_title ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    {company.linkedin_profile_url ? (
                      <a
                        href={
                          company.linkedin_profile_url.startsWith("http")
                            ? company.linkedin_profile_url
                            : `https://${company.linkedin_profile_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-primary-light hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-muted">
                {formatYear(company.founded_year)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                {formatFunding(company.total_funding)}
              </td>
              <td className="px-4 py-3 text-muted">
                {company.number_of_employees
                  ? Math.round(company.number_of_employees).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={company.company_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
