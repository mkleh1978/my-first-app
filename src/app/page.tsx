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
import FilterPanel from "@/components/FilterPanel";
import CompanyTable from "@/components/CompanyTable";
import CompanyDetailModal from "@/components/CompanyDetailModal";
import Header from "@/components/Header";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const { data } = await supabase
        .from("FinWell_data")
        .select("subcategory_1")
        .eq("category_1", filters.category)
        .not("subcategory_1", "is", null)
        .order("subcategory_1");
      if (data) {
        const unique = [...new Set(data.map((r: { subcategory_1: string }) => r.subcategory_1))];
        setSubcategories(unique);
      }
    }
    loadSubcategories();
  }, [filters.category]);

  // Build query with filters
  const fetchCompanies = useCallback(
    async (currentFilters: Filters, currentPage: number, currentSort: SortConfig) => {
      setLoading(true);

      let query = supabase.from("FinWell_data").select(
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
        query = query.or(
          `company_name.ilike.%${currentFilters.search}%,domain.ilike.%${currentFilters.search}%,description_en.ilike.%${currentFilters.search}%`
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
