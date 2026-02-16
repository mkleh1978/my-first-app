"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FinTechCompany } from "@/types/fintech";
import { useFavorites } from "@/lib/favorites-context";
import { countryToIso } from "@/lib/country-flags";
import Header from "@/components/Header";
import StarButton from "@/components/StarButton";
import CompanyDetailModal from "@/components/CompanyDetailModal";
import { useAuth } from "@/lib/auth-context";
import { Download, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

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

export default function WatchlistPage() {
  const { isAdmin } = useAuth();
  const { favoriteIds, count, loading: favLoading } = useFavorites();
  const [companies, setCompanies] = useState<FinTechCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] =
    useState<FinTechCompany | null>(null);

  // Load companies matching favorite IDs
  useEffect(() => {
    if (favLoading) return;

    if (favoriteIds.size === 0) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    async function loadWatchlist() {
      setLoading(true);
      const ids = [...favoriteIds];
      const { data } = await supabase
        .from("company_data_view")
        .select("*")
        .in("id", ids)
        .order("company_name");

      setCompanies(data ?? []);
      setLoading(false);
    }

    loadWatchlist();
  }, [favoriteIds, favLoading]);

  function handleExport() {
    if (companies.length === 0) return;

    const rows = companies.map((c) => ({
      "Company Name": c.company_name ?? "",
      Category: c.category_1 ?? "",
      Subcategory: c.subcategory_1 ?? "",
      Country: c.country ?? "",
      Founded: c.founded_year ?? "",
      "Total Funding": c.total_funding ?? "",
      Employees: c.number_of_employees ?? "",
      Status: c.company_status ?? "",
      "Target Model": c.target_model ?? "",
      Domain: c.domain ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Watchlist");

    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `HoFT_Watchlist_${today}.xlsx`);
  }

  const linkedInCount = companies.filter((c) => c.linkedin_profile_url).length;

  function handleDripifyExport() {
    const urls = companies
      .filter((c) => c.linkedin_profile_url)
      .map((c) => {
        const url = c.linkedin_profile_url!.trim();
        return url.startsWith("http") ? url : `https://${url}`;
      });

    if (urls.length === 0) return;

    const csv = "profileUrl\n" + urls.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const today = new Date().toISOString().split("T")[0];
    link.download = `HoFT_Dripify_Export_${today}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Header row */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Watchlist</h2>
            <p className="mt-1 text-sm text-muted">
              {count} {count === 1 ? "Unternehmen" : "Unternehmen"} in deiner
              Watchlist
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={handleDripifyExport}
                  disabled={linkedInCount === 0}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    linkedInCount === 0
                      ? "Keine LinkedIn URLs in der Watchlist vorhanden"
                      : undefined
                  }
                >
                  <Download className="h-4 w-4" />
                  Dripify Export
                </button>
                {companies.length > 0 && (
                  <span className="text-xs text-muted">
                    {linkedInCount} von {companies.length} mit LinkedIn URL
                  </span>
                )}
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={companies.length === 0}
              className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Als Excel exportieren
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {(loading || favLoading) && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="w-10 px-3 py-3" />
                  <th className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-border" /></th>
                  <th className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-border" /></th>
                  <th className="px-4 py-3"><div className="h-4 w-14 animate-pulse rounded bg-border" /></th>
                  <th className="px-4 py-3"><div className="h-4 w-12 animate-pulse rounded bg-border" /></th>
                  <th className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-border" /></th>
                  <th className="px-4 py-3"><div className="h-4 w-14 animate-pulse rounded bg-border" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-3"><div className="h-5 w-5 animate-pulse rounded bg-border" /></td>
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 animate-pulse rounded bg-border" />
                        <div className="h-3 w-24 animate-pulse rounded bg-border" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-border" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-border" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-10 animate-pulse rounded bg-border" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-border" /></td>
                    <td className="px-4 py-3"><div className="h-5 w-20 animate-pulse rounded-full bg-border" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && !favLoading && companies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <Star className="mb-4 h-12 w-12 opacity-30" />
            <p className="text-lg font-medium text-foreground">
              Deine Watchlist ist noch leer
            </p>
            <p className="mt-1 text-sm">
              Klicke auf den Stern bei einem Unternehmen, um es hier zu
              speichern.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              Zur Datenbank
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && !favLoading && companies.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="w-10 px-3 py-3" />
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Unternehmen
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Kategorie
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Land
                  </th>
                  {isAdmin && (
                    <>
                      <th className="px-4 py-3 font-semibold text-foreground">Kontakt</th>
                      <th className="px-4 py-3 font-semibold text-foreground">Titel</th>
                      <th className="px-4 py-3 font-semibold text-foreground">LinkedIn</th>
                    </>
                  )}
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Gegr.
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">
                    Finanzierung
                  </th>
                  <th className="px-4 py-3 font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-teal/5 last:border-b-0"
                  >
                    <td className="px-3 py-3">
                      <StarButton companyId={company.id} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {company.company_name ?? "-"}
                      </span>
                      {company.domain && (
                        <span className="ml-2 text-xs text-muted">
                          {company.domain}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {company.category_1 ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {company.country ? (
                        <span className="inline-flex items-center gap-1.5">
                          {countryToIso(company.country) && (
                            <span
                              className={`fi fi-${countryToIso(company.country)}`}
                            />
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
                    <td className="px-4 py-3">
                      <StatusBadge status={company.company_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
