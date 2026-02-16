import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

export interface ImportResult {
  matched: number;
  updated: number;
  notFound: string[];
  errors: string[];
  total: number;
}

interface ContactRow {
  domain: string;
  contactName: string;
  jobTitle: string;
  linkedinUrl: string;
}

/** Normalize domain: strip protocol, www, trailing slash */
function normalizeDomain(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/** Parse XLSX file buffer and extract contact rows */
export function parseContactsXlsx(buffer: ArrayBuffer): ContactRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  // Find column names (case-insensitive)
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  const keys = Object.keys(firstRow);

  const findKey = (candidates: string[]) =>
    keys.find((k) =>
      candidates.some((c) => k.toLowerCase().includes(c.toLowerCase()))
    );

  const domainKey = findKey(["Domain"]);
  const contactKey = findKey(["Contact Name"]);
  const titleKey = findKey(["Job Title"]);
  const linkedinKey = findKey(["Linkedin Profile URL", "LinkedIn"]);

  if (!domainKey) {
    throw new Error("Spalte 'Domain' nicht gefunden in der XLSX-Datei.");
  }

  const contacts: ContactRow[] = [];
  const seenDomains = new Set<string>();

  for (const row of rows) {
    const domain = normalizeDomain(row[domainKey] as string);
    if (!domain || seenDomains.has(domain)) continue;
    seenDomains.add(domain);

    contacts.push({
      domain,
      contactName: contactKey ? String(row[contactKey] ?? "").trim() : "",
      jobTitle: titleKey ? String(row[titleKey] ?? "").trim() : "",
      linkedinUrl: linkedinKey ? String(row[linkedinKey] ?? "").trim() : "",
    });
  }

  return contacts;
}

/** Import contacts into FinWell_data by domain matching */
export async function importContacts(
  contacts: ContactRow[],
  onProgress?: (current: number, total: number) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    matched: 0,
    updated: 0,
    notFound: [],
    errors: [],
    total: contacts.length,
  };

  // Load ALL domains from FinWell_data for matching (paginated to bypass 1000-row default limit)
  const domainMap = new Map<string, string>();
  const PAGE_SIZE = 1000;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: page, error } = await supabase
      .from("FinWell_data")
      .select("id, domain")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Fehler beim Laden der Unternehmen: ${error.message}`);
    }

    for (const company of page ?? []) {
      const normalized = normalizeDomain(company.domain);
      if (normalized) {
        domainMap.set(normalized, company.id);
      }
    }

    hasMore = (page?.length ?? 0) === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  // Process in batches
  const BATCH_SIZE = 100;
  let processed = 0;

  for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
    const batch = contacts.slice(i, i + BATCH_SIZE);
    const updates: { id: string; contact_name?: string; job_title?: string; linkedin_profile_url?: string }[] = [];

    for (const contact of batch) {
      const companyId = domainMap.get(contact.domain);
      if (!companyId) {
        result.notFound.push(contact.domain);
        continue;
      }

      result.matched++;
      const fields: { contact_name?: string; job_title?: string; linkedin_profile_url?: string } = {};
      if (contact.contactName) fields.contact_name = contact.contactName;
      if (contact.jobTitle) fields.job_title = contact.jobTitle;
      if (contact.linkedinUrl) fields.linkedin_profile_url = contact.linkedinUrl;

      // Only update if there's at least one non-empty field
      if (Object.keys(fields).length > 0) {
        updates.push({ id: companyId, ...fields });
      }
    }

    // Execute batch updates
    for (const update of updates) {
      const { id, ...fields } = update;
      const { error: updateError } = await supabase
        .from("FinWell_data")
        .update(fields)
        .eq("id", id);

      if (updateError) {
        result.errors.push(`${id}: ${updateError.message}`);
      } else {
        result.updated++;
      }
    }

    processed += batch.length;
    onProgress?.(processed, contacts.length);
  }

  return result;
}
