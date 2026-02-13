export interface CategoryStat {
  segment: string;
  company_count: number;
  total_funding_sum: number;
  total_funding_avg: number;
}

export interface FundingTimelinePoint {
  segment: string;
  year_label: string;
  total: number;
}

export interface DistributionItem {
  distribution_type: string;
  label: string;
  count: number;
}

export interface KeywordItem {
  keyword: string;
  count: number;
}
