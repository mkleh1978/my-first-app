"use client";

import { FinTechCompany } from "@/types/fintech";
import FundingChart from "@/components/FundingChart";
import { splitTextToBullets } from "@/lib/text-utils";
import {
  MapPin,
  Globe,
  Target,
  Package,
  User,
  ExternalLink,
  Linkedin,
  X,
} from "lucide-react";
import { countryToIso } from "@/lib/country-flags";
import { useAuth } from "@/lib/auth-context";
import StarButton from "@/components/StarButton";

interface CompanyDetailModalProps {
  company: FinTechCompany;
  onClose: () => void;
}

function formatFunding(value: number | null): string {
  if (value == null || value === 0) return "-";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatYear(value: number | string | null): string {
  if (value == null) return "-";
  if (typeof value === "number") return value.toString();
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return Math.round(num).toString();
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 shrink-0 text-muted">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

function BulletOrParagraph({ text }: { text: string }) {
  const items = splitTextToBullets(text);
  if (!items) {
    return <p className="text-sm leading-relaxed text-foreground">{text}</p>;
  }
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function CompanyDetailModal({
  company,
  onClose,
}: CompanyDetailModalProps) {
  const { isAdmin } = useAuth();

  const categories = [
    { cat: company.category_1, sub: company.subcategory_1 },
    { cat: company.category_2, sub: company.subcategory_2 },
    { cat: company.category_3, sub: company.subcategory_3 },
  ].filter((c) => c.cat);

  const locationText =
    [company.city, company.country].filter(Boolean).join(", ") || null;
  const iso = countryToIso(company.country);
  const location = locationText ? (
    <span className="inline-flex items-center gap-1.5">
      {iso && <span className={`fi fi-${iso}`} />}
      {locationText}
    </span>
  ) : null;

  const companyInfoItems = [
    { icon: <MapPin className="h-4 w-4" />, label: "Location", value: location },
    { icon: <Globe className="h-4 w-4" />, label: "Region", value: company.region },
    {
      icon: <Target className="h-4 w-4" />,
      label: "Target Model",
      value: company.target_model,
    },
    {
      icon: <Package className="h-4 w-4" />,
      label: "Product Type",
      value: company.product_type,
    },
    {
      icon: <User className="h-4 w-4" />,
      label: "Founders / CEOs",
      value: company.founders_ceos,
    },
  ].filter((item) => item.value);

  const productDetails = [
    { label: "Value Proposition", text: company.core_value_proposition },
    { label: "Problem Solved", text: company.problem_solved },
    { label: "Key Features", text: company.key_features },
    { label: "Competitive Advantage", text: company.competitive_advantage_usp },
  ].filter((d) => d.text);

  const latestRoundValue = company.latest_round
    ? `${company.latest_round}${company.latest_round_year ? ` (${formatYear(company.latest_round_year)})` : ""}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[5vh]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <div className="flex items-center gap-3">
              <StarButton companyId={company.id} size={22} />
              <h2 className="text-2xl font-bold text-foreground">
                {company.company_name}
              </h2>
              {company.member && (
                <span className="rounded bg-teal/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-teal">
                  HoFT Member
                </span>
              )}
            </div>
            {company.domain && (
              <a
                href={`https://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-primary-light hover:underline"
              >
                {company.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {company.description_en && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                {company.description_en}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-border hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* 1. Quick Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs text-muted">Total Funding</div>
              <div className="mt-1 text-lg font-semibold">
                {formatFunding(company.total_funding)}
              </div>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs text-muted">Founded</div>
              <div className="mt-1 text-lg font-semibold">
                {formatYear(company.founded_year)}
              </div>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs text-muted">Employees</div>
              <div className="mt-1 text-lg font-semibold">
                {company.number_of_employees
                  ? Math.round(company.number_of_employees).toLocaleString()
                  : "-"}
              </div>
            </div>
            <div className="rounded-lg bg-background p-3">
              <div className="text-xs text-muted">Status</div>
              <div className="mt-1 text-lg font-semibold">
                {company.company_status ?? "-"}
              </div>
            </div>
          </div>

          {/* 2. Categories */}
          {categories.length > 0 && (
            <Section title="Categories">
              <div className="flex flex-wrap gap-2">
                {categories.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{c.cat}</span>
                    {c.sub && (
                      <span className="text-muted"> / {c.sub}</span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 3. Company Info — 2-column grid with icons */}
          {companyInfoItems.length > 0 && (
            <Section title="Company Info">
              <div className="grid gap-x-6 gap-y-1 rounded-lg border border-border p-4 sm:grid-cols-2">
                {companyInfoItems.map((item) => (
                  <InfoItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* 3b. Key Contact — Admin only */}
          {isAdmin &&
            (company.contact_name || company.job_title || company.linkedin_profile_url) && (
              <Section title="Key Contact">
                <div className="grid gap-x-6 gap-y-1 rounded-lg border border-border p-4 sm:grid-cols-2">
                  {company.contact_name && (
                    <InfoItem
                      icon={<User className="h-4 w-4" />}
                      label="Contact"
                      value={
                        <span>
                          {company.contact_name}
                          {company.job_title && (
                            <span className="ml-1 text-muted">
                              &middot; {company.job_title}
                            </span>
                          )}
                        </span>
                      }
                    />
                  )}
                  {!company.contact_name && company.job_title && (
                    <InfoItem
                      icon={<User className="h-4 w-4" />}
                      label="Title"
                      value={company.job_title}
                    />
                  )}
                  {company.linkedin_profile_url && (
                    <InfoItem
                      icon={<Linkedin className="h-4 w-4" />}
                      label="LinkedIn"
                      value={
                        <a
                          href={
                            company.linkedin_profile_url.startsWith("http")
                              ? company.linkedin_profile_url
                              : `https://${company.linkedin_profile_url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-light hover:underline"
                        >
                          {company.contact_name || "LinkedIn Profile"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      }
                    />
                  )}
                </div>
              </Section>
            )}

          {/* 4. Product Details — Bullet lists */}
          {productDetails.length > 0 && (
            <Section title="Product Details">
              <div className="space-y-4 rounded-lg border border-border p-4">
                {productDetails.map((d) => (
                  <div key={d.label}>
                    <div className="mb-1 text-xs font-medium text-muted">
                      {d.label}
                    </div>
                    <BulletOrParagraph text={d.text!} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 5. Funding History */}
          <Section title="Funding History">
            <FundingChart company={company} />
            {latestRoundValue && (
              <div className="mt-2 flex gap-3 text-sm">
                <span className="text-muted">Latest Round</span>
                <span className="text-foreground">{latestRoundValue}</span>
              </div>
            )}
          </Section>

          {/* 6. Investors */}
          {company.investors && (
            <Section title="Investors">
              <div className="rounded-lg border border-border p-4">
                <BulletOrParagraph text={company.investors} />
              </div>
            </Section>
          )}

          {/* 7. Competitors */}
          {company.top_competitors && (
            <Section title="Top Competitors">
              <div className="rounded-lg border border-border p-4">
                <BulletOrParagraph text={company.top_competitors} />
              </div>
            </Section>
          )}

          {/* 8. Integration Capabilities */}
          {company.integration_capabilities && (
            <Section title="Integration Capabilities">
              <div className="rounded-lg border border-border p-4">
                <BulletOrParagraph text={company.integration_capabilities} />
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
