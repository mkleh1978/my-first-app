export interface FinTechCompany {
  id: string;
  company_name: string | null;
  domain: string | null;
  description_en: string | null;
  category_1: string | null;
  subcategory_1: string | null;
  category_2: string | null;
  subcategory_2: string | null;
  category_3: string | null;
  subcategory_3: string | null;
  headquarters: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
  founded_year: number | null;
  target_model: string | null;
  total_funding: number | null;
  latest_round: string | null;
  latest_round_year: string | null;
  investors: string | null;
  founders_ceos: string | null;
  number_of_employees: number | null;
  formation_year_verified: string | null;
  company_status: string | null;
  product_type: string | null;
  core_value_proposition: string | null;
  problem_solved: string | null;
  key_features: string | null;
  competitive_advantage_usp: string | null;
  integration_capabilities: string | null;
  top_competitors: string | null;
  analysis_status: string | null;
  member: boolean;
  funding_2010: string | null;
  funding_2011: string | null;
  funding_2012: string | null;
  funding_2013: string | null;
  funding_2014: string | null;
  funding_2015: string | null;
  funding_2016: string | null;
  funding_2017: string | null;
  funding_2018: string | null;
  funding_2019: string | null;
  funding_2020: string | null;
  funding_2021: string | null;
  funding_2022: string | null;
  funding_2023: string | null;
  funding_2024: string | null;
  funding_2025: string | null;
}

export interface Filters {
  search: string;
  category: string;
  subcategory: string;
  country: string;
  status: string;
  targetModel: string;
  memberOnly: boolean;
}

export type SortColumn =
  | "company_name"
  | "country"
  | "founded_year"
  | "total_funding"
  | "number_of_employees";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  column: SortColumn;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortConfig = {
  column: "total_funding",
  direction: "desc",
};

/** Columns where first click = ascending (text columns) */
export const TEXT_SORT_COLUMNS: SortColumn[] = ["company_name", "country"];

export const CATEGORIES = [
  "Financial Education",
  "Financial Foundation",
  "Infrastructure & Technology",
  "Investment & Wealth Building",
  "Risk Protection",
] as const;
