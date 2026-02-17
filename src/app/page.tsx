"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  FinTechCompany,
  Filters,
  SortConfig,
  SortColumn,
  DEFAULT_SORT,
  TEXT_SORT_COLUMNS,
} from "@/types/fintech";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import FilterPanel from "@/components/FilterPanel";
import CompanyTable from "@/components/CompanyTable";
import CompanyDetailModal from "@/components/CompanyDetailModal";
import Header from "@/components/Header";
import { Star } from "lucide-react";
import { sanitizeSearchInput } from "@/lib/sanitize";

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: Filters = {
  search: "",
  category: "",
  subcategory: "",
  country: "",
  status: "",
  targetModel: "",
  memberOnly: false,
};

export default function Home() {
  const [companies, setCompanies] = useState<FinTechCompany[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<FinTechCompany | null>(
    null
  );
  const [sort, setSort] = useState<SortConfig>(DEFAULT_SORT);
  const [error, setError] = useState<string | null>(null);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAdmin } = useAuth();
  const { bulkAddFavorites } = useFavorites();

  // Load country list once
  useEffect(() => {
    async function loadCountries() {
      const { data } = await supabase.rpc("get_distinct_countries");

      if (data) {
        setCountries(data.map((r: { country: string }) => r.country));
      }
    }

    async function loadTotalCount() {
      const { count } = await supabase
        .from("FinWell_data")
        .select("*", { count: "exact", head: true });
      setTotalCount(count ?? 0);
    }

    loadCountries();
    loadTotalCount();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (!filters.category) {
      setSubcategories([]);
      return;
    }
    async function loadSubcategories() {
      // Query all companies where the selected category appears in any of the 3 category columns
      const { data } = await supabase
        .from("FinWell_data")
        .select("category_1, subcategory_1, category_2, subcategory_2, category_3, subcategory_3")
        .or(`category_1.eq.${filters.category},category_2.eq.${filters.category},category_3.eq.${filters.category}`);

      if (data) {
        // Collect all subcategories where the category matches
        const subcats = new Set<string>();
        data.forEach((row: any) => {
          if (row.category_1 === filters.category && row.subcategory_1) {
            subcats.add(row.subcategory_1);
          }
          if (row.category_2 === filters.category && row.subcategory_2) {
            subcats.add(row.subcategory_2);
          }
          if (row.category_3 === filters.category && row.subcategory_3) {
            subcats.add(row.subcategory_3);
          }
        });
        const unique = [...subcats].sort();
        setSubcategories(unique);
      }
    }
    loadSubcategories();
  }, [filters.category]);

  // Build query with filters
  const fetchCompanies = useCallback(
    async (currentFilters: Filters, currentPage: number, currentSort: SortConfig) => {
      setLoading(true);

      let query = supabase.from("company_data_view").select(
        `id, company_name, domain, description_en,
         category_1, subcategory_1, category_2, subcategory_2, category_3, subcategory_3,
         headquarters, city, country, region, founded_year,
         target_model, total_funding, latest_round, latest_round_year,
         investors, founders_ceos, number_of_employees,
         formation_year_verified, company_status, product_type,
         core_value_proposition, problem_solved, key_features,
         competitive_advantage_usp, integration_capabilities, top_competitors,
         analysis_status, member,
         contact_name, job_title, linkedin_profile_url,
         funding_2010, funding_2011, funding_2012, funding_2013,
         funding_2014, funding_2015, funding_2016, funding_2017,
         funding_2018, funding_2019, funding_2020, funding_2021,
         funding_2022, funding_2023, funding_2024, funding_2025`,
        { count: "exact" }
      );

      // Apply filters
      if (currentFilters.search) {
        const safe = sanitizeSearchInput(currentFilters.search);
        query = query.or(
          `company_name.ilike.%${safe}%,domain.ilike.%${safe}%,description_en.ilike.%${safe}%`
        );
      }
      if (currentFilters.category) {
        query = query.eq("category_1", currentFilters.category);
      }
      if (currentFilters.subcategory) {
        query = query.eq("subcategory_1", currentFilters.subcategory);
      }
      if (currentFilters.country) {
        query = query.eq("country", currentFilters.country);
      }
      if (currentFilters.status) {
        query = query.eq("company_status", currentFilters.status);
      }
      if (currentFilters.targetModel) {
        query = query.eq("target_model", currentFilters.targetModel);
      }
      if (currentFilters.memberOnly) {
        query = query.eq("member", true);
      }

      // Dynamic sort order
      query = query
        .order(currentSort.column, {
          ascending: currentSort.direction === "asc",
          nullsFirst: false,
        })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      const { data, count, error: queryError } = await query;

      if (queryError) {
        setError("Failed to load companies. Please try again.");
        setCompanies([]);
        setLoading(false);
        return;
      }

      setError(null);
      setCompanies(data ?? []);
      setFilteredCount(count ?? 0);
      setLoading(false);
    },
    []
  );

  function handleRetry() {
    fetchCompanies(filters, page, sort);
  }

  // Debounce search, instant for other filters and sort changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(
      () => {
        setPage(0);
        fetchCompanies(filters, 0, sort);
      },
      filters.search ? 300 : 0
    );

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, sort, fetchCompanies]);

  // Page change
  useEffect(() => {
    if (page > 0) {
      fetchCompanies(filters, page, sort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.ceil(filteredCount / PAGE_SIZE);

  // 3-stage sort toggle: direction1 → direction2 → reset to default
  function handleSortChange(column: SortColumn) {
    setSort((prev) => {
      if (prev.column !== column) {
        // New column: text columns start asc, number columns start desc
        const firstDirection = TEXT_SORT_COLUMNS.includes(column)
          ? "asc"
          : "desc";
        return { column, direction: firstDirection };
      }
      // Same column: toggle through stages
      const isTextColumn = TEXT_SORT_COLUMNS.includes(column);
      const firstDirection = isTextColumn ? "asc" : "desc";
      const secondDirection = isTextColumn ? "desc" : "asc";

      if (prev.direction === firstDirection) {
        return { column, direction: secondDirection };
      }
      // Third click: reset to default
      return DEFAULT_SORT;
    });
  }

  // Bulk-add filtered companies to watchlist (admin only, max 500)
  const BULK_LIMIT = 500;

  async function handleBulkAdd() {
    setBulkAdding(true);
    setBulkResult(null);

    try {
      // Build same filter query but only fetch IDs, no pagination, limit 500
      let query = supabase.from("FinWell_data").select("id");

      if (filters.search) {
        const safe = sanitizeSearchInput(filters.search);
        query = query.or(
          `company_name.ilike.%${safe}%,domain.ilike.%${safe}%,description_en.ilike.%${safe}%`
        );
      }
      if (filters.category) query = query.eq("category_1", filters.category);
      if (filters.subcategory) query = query.eq("subcategory_1", filters.subcategory);
      if (filters.country) query = query.eq("country", filters.country);
      if (filters.status) query = query.eq("company_status", filters.status);
      if (filters.targetModel) query = query.eq("target_model", filters.targetModel);
      if (filters.memberOnly) query = query.eq("member", true);

      query = query.limit(BULK_LIMIT);

      const { data, error: queryError } = await query;
      if (queryError) throw new Error(queryError.message);

      const ids = (data ?? []).map((r: { id: string }) => r.id);
      const added = await bulkAddFavorites(ids);

      setBulkResult(
        added > 0
          ? `${added} companies added to watchlist`
          : "All companies are already in the watchlist"
      );
    } catch (err) {
      setBulkResult(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setBulkAdding(false);
      setTimeout(() => setBulkResult(null), 4000);
    }
  }

  // Close modal on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedCompany(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header totalCount={totalCount} />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="space-y-4">
          {/* Filters */}
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            countries={countries}
            subcategories={subcategories}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />

          {/* Bulk-add to watchlist (admin only) */}
          {isAdmin && !loading && filteredCount > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkAdd}
                disabled={bulkAdding || filteredCount > BULK_LIMIT}
                className="inline-flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/10 px-4 py-2 text-sm font-medium text-teal transition-colors hover:bg-teal/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Star className="h-4 w-4" />
                {bulkAdding
                  ? "Adding..."
                  : `Add all ${Math.min(filteredCount, BULK_LIMIT)} to Watchlist`}
              </button>
              {filteredCount > BULK_LIMIT && (
                <span className="text-xs text-muted">
                  Max. {BULK_LIMIT} companies at once (currently {filteredCount.toLocaleString()})
                </span>
              )}
              {bulkResult && (
                <span className="text-sm text-teal">{bulkResult}</span>
              )}
            </div>
          )}

          {/* Table */}
          <CompanyTable
            companies={companies}
            onSelect={setSelectedCompany}
            loading={loading}
            sort={sort}
            onSortChange={handleSortChange}
            error={error}
            onRetry={handleRetry}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
