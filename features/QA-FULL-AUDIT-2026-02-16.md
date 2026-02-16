# QA Full Audit Report -- European FinTech Database

**Tested:** 2026-02-16
**Tester:** QA Engineer (Code Review + Database Inspection)
**Method:** Static code analysis, database schema inspection, RLS policy review, Supabase advisor checks
**Scope:** All modules (Auth, Database, Watchlist, Admin, Reporting, RLS/Security)

---

## Executive Summary

The application is a well-structured Next.js 16 + Supabase application with a clear separation of concerns. The core functionality (filtering, sorting, pagination, watchlist, reporting) is solidly implemented. However, there are **critical security vulnerabilities** that must be addressed before production deployment, along with several high-priority bugs and performance issues.

**Verdict: NOT production-ready** -- 3 Critical and 5 High severity issues must be fixed first.

---

## 1. CRITICAL BUGS (Must Fix Before Deployment)

### BUG-001: SQL Injection via Search Filter (PostgREST Filter Injection)
- **Severity:** CRITICAL
- **Module:** Database Main Page (`src/app/page.tsx`, line 121)
- **Description:** The search input is interpolated directly into a PostgREST `.or()` filter string without sanitization. A user can craft a search string containing special PostgREST filter characters (e.g., `)`, `,`, `.`) to break out of the intended filter and inject arbitrary filter conditions.
- **Affected Code:**
  ```typescript
  query = query.or(
    `company_name.ilike.%${currentFilters.search}%,domain.ilike.%${currentFilters.search}%,description_en.ilike.%${currentFilters.search}%`
  );
  ```
  The same pattern is duplicated in `handleBulkAdd()` (line 234).
- **Attack Vector:** A search term like `%,id.neq.` could manipulate the filter logic. While PostgREST has some built-in escaping, the pattern is dangerous and violates defense-in-depth.
- **Fix:** Sanitize the search string by escaping PostgREST special characters (`,`, `.`, `(`, `)`, `%`, `*`) or use parameterized `.ilike()` calls chained with `.or`:
  ```typescript
  const safe = currentFilters.search.replace(/[%_]/g, '\\$&');
  query = query.or(`company_name.ilike.%${safe}%,domain.ilike.%${safe}%,description_en.ilike.%${safe}%`);
  ```

### BUG-002: FinWell_data Readable by Anonymous (Unauthenticated) Users
- **Severity:** CRITICAL
- **Module:** Database / RLS Policy
- **Description:** The RLS policy `Allow anon read access` on `FinWell_data` grants `SELECT` to the `anon` role with `qual = true`. This means anyone with the Supabase project URL and anon key (both are public in the frontend bundle) can read ALL 10,156 company records including contact names, job titles, and LinkedIn URLs -- without logging in.
- **Impact:** Complete data exposure. The entire database can be scraped by unauthenticated API calls using the anon key visible in the client-side JavaScript bundle.
- **Fix:** Remove the `Allow anon read access` policy. The `Allow authenticated read access` policy already covers logged-in users. If the anon policy was added for SSR/middleware purposes, switch to using the service_role key server-side instead.

### BUG-003: Admin Role Check is Client-Side Only (No Server Enforcement for Admin Pages)
- **Severity:** CRITICAL
- **Module:** Admin Page (`src/app/admin/page.tsx`), Middleware (`src/middleware.ts`)
- **Description:** The `/admin` route has NO server-side protection. The middleware only checks if a user is authenticated, not whether they are an admin. The admin page renders a "Zugriff verweigert" message client-side via `useAuth().isAdmin`, but:
  1. The page component is fully downloaded to all authenticated users (code exposure)
  2. The actual import functionality runs client-side using the browser Supabase client
  3. The only real protection is the RLS `Allow admin update` policy on `FinWell_data`
- **Impact:** While the RLS UPDATE policy does protect against non-admin writes, any authenticated user can see the admin UI code, attempt uploads, and discover the import mechanism. The UI-level guard is trivially bypassable with browser DevTools.
- **Fix:** Add server-side admin check in middleware for `/admin` routes:
  ```typescript
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Check user_roles table server-side
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
    if (data?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  ```

---

## 2. HIGH SEVERITY BUGS

### BUG-004: Leaked Password Protection Disabled
- **Severity:** HIGH
- **Module:** Supabase Auth Configuration
- **Description:** Supabase advisor reports that "Leaked Password Protection" is disabled. This feature checks passwords against the HaveIBeenPwned database to prevent users from choosing compromised passwords.
- **Source:** Supabase Security Advisor
- **Fix:** Enable leaked password protection in the Supabase Dashboard under Auth > Settings > Security.
- **Remediation:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### BUG-005: All RPC Functions Have Mutable search_path (6 Functions Affected)
- **Severity:** HIGH
- **Module:** Database Functions
- **Description:** All 6 public RPC functions (`handle_new_user_role`, `get_distinct_countries`, `get_category_distributions`, `get_category_funding_timeline`, `get_category_stats`, `get_top_keywords`) have mutable `search_path`. This is a known security risk where an attacker could potentially inject a malicious schema into the search path.
- **Source:** Supabase Security Advisor
- **Fix:** Set `search_path` explicitly on all functions:
  ```sql
  ALTER FUNCTION public.get_distinct_countries() SET search_path = public;
  -- Repeat for all 6 functions
  ```
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

### BUG-006: No Foreign Key from watchlist.company_id to FinWell_data.id
- **Severity:** HIGH
- **Module:** Database Schema
- **Description:** The `watchlist` table has a FK on `user_id` to `auth.users(id)` with `ON DELETE CASCADE`, but `company_id` has no foreign key constraint to `FinWell_data.id`. This means:
  1. Users can insert arbitrary company_id values into the watchlist (orphan references)
  2. If a company is deleted from `FinWell_data`, the watchlist entry persists as a dangling reference
  3. The watchlist page query `.in("id", ids)` would silently return fewer results than expected
- **Fix:** Add a foreign key constraint:
  ```sql
  ALTER TABLE public.watchlist
  ADD CONSTRAINT watchlist_company_id_fkey
  FOREIGN KEY (company_id) REFERENCES public."FinWell_data"(id) ON DELETE CASCADE;
  ```

### BUG-007: No Index on FinWell_data.domain for LinkedIn Import Matching
- **Severity:** HIGH
- **Module:** Admin LinkedIn Import (`src/lib/import-contacts.ts`)
- **Description:** The LinkedIn import loads ALL companies from `FinWell_data` (10,156 rows, paginated in batches of 1000) to build a domain-to-id map in memory. There is no index on the `domain` column. While the current approach loads everything client-side (bypassing the need for a DB index on domain), this is problematic:
  1. Transfers ~10K rows of id+domain data to the browser
  2. Each UPDATE in `importContacts()` is done one-by-one (N+1 pattern, line 144-155)
  3. With 500+ contacts, this means 500+ sequential UPDATE queries
- **Fix:** Create an index on domain, and ideally move the import logic to a Supabase Edge Function that can use the service_role key and batch updates more efficiently.

### BUG-008: Email Domain Restriction Only on Client-Side (Registration)
- **Severity:** HIGH
- **Module:** Registration (`src/app/(auth)/register/page.tsx`, line 19)
- **Description:** The `@hoft.berlin` email restriction is enforced only in the React component. A user can bypass this by calling the Supabase Auth API directly (using the public anon key) with any email address:
  ```javascript
  supabase.auth.signUp({ email: "attacker@gmail.com", password: "12345678" })
  ```
- **Impact:** Unauthorized users from outside the organization can create accounts and access the entire FinWell database.
- **Fix:** Enforce the domain restriction server-side using a Supabase Auth Hook (before sign-up) or a database trigger. Example with Auth Hook:
  ```sql
  CREATE OR REPLACE FUNCTION check_email_domain()
  RETURNS trigger AS $$
  BEGIN
    IF NEW.email NOT LIKE '%@hoft.berlin' THEN
      RAISE EXCEPTION 'Registration restricted to @hoft.berlin emails';
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

---

## 3. MEDIUM SEVERITY BUGS

### BUG-009: RLS Policies Use auth.uid() Without Subselect (Performance)
- **Severity:** MEDIUM
- **Module:** Database RLS (all 3 tables)
- **Description:** All RLS policies on `watchlist`, `user_roles`, and `FinWell_data` use `auth.uid()` directly instead of `(select auth.uid())`. This causes the function to be re-evaluated for every row, creating a significant performance penalty at scale.
- **Source:** Supabase Performance Advisor (5 warnings)
- **Affected Policies:** All 5 non-anon RLS policies
- **Fix:** Update all policies to use subselect pattern:
  ```sql
  -- Example: watchlist view policy
  ALTER POLICY "Users can view own watchlist" ON public.watchlist
  USING ((select auth.uid()) = user_id);
  ```
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

### BUG-010: Duplicate formatFunding() Function in 3 Files
- **Severity:** MEDIUM (Code Quality)
- **Module:** `src/app/page.tsx` (not used there actually), `src/components/CompanyTable.tsx`, `src/components/CompanyDetailModal.tsx`, `src/app/watchlist/page.tsx`
- **Description:** The `formatFunding()` helper function is copy-pasted in 3 different files. Same for `formatYear()`. This violates DRY and creates maintenance risk -- a fix in one place can be missed in others.
- **Fix:** Extract to a shared utility file (e.g., `src/lib/format-utils.ts`) and import everywhere.

### BUG-011: Bulk-Add Button Visible but Misleading When filteredCount > 500
- **Severity:** MEDIUM (UX)
- **Module:** Database Main Page (`src/app/page.tsx`, line 293-313)
- **Description:** When `filteredCount > BULK_LIMIT (500)`, the button is disabled but still shows the text "Alle {filteredCount} zur Watchlist". The button label is misleading because the text says "Alle 2000" but the operation is limited to 500. The ternary on line 303 `filteredCount > BULK_LIMIT ? filteredCount : filteredCount` always evaluates to `filteredCount` -- both branches are identical.
- **Fix:** Change the button text to clarify the limit:
  ```typescript
  `Alle ${Math.min(filteredCount, BULK_LIMIT)} zur Watchlist`
  ```

### BUG-012: Watchlist Page Loads All Columns with SELECT *
- **Severity:** MEDIUM (Performance)
- **Module:** Watchlist (`src/app/watchlist/page.tsx`, line 51)
- **Description:** The watchlist query uses `.select("*")` which fetches all 52 columns of `FinWell_data` for every favorited company, including large text fields like `description_en`, `core_value_proposition`, `problem_solved`, `key_features`, etc. Most of these are only needed when opening the detail modal.
- **Fix:** Select only the columns needed for the table display, and lazy-load full details when modal opens.

### BUG-013: No Rate Limiting on Password Reset
- **Severity:** MEDIUM
- **Module:** Reset Password (`src/app/(auth)/reset-password/page.tsx`)
- **Description:** The reset password form has no client-side rate limiting and relies entirely on Supabase's built-in rate limiting. An attacker could potentially abuse this to send mass reset emails (email bombing).
- **Fix:** Add a client-side cooldown (e.g., disable button for 60 seconds after submission) and consider adding CAPTCHA for repeated attempts.

### BUG-014: auth/callback Route Vulnerable to Open Redirect
- **Severity:** MEDIUM
- **Module:** Auth Callback (`src/app/auth/callback/route.ts`, line 7)
- **Description:** The `next` query parameter is used for redirect after auth callback:
  ```typescript
  const next = searchParams.get("next") ?? "/";
  return NextResponse.redirect(`${origin}${next}`);
  ```
  While it uses `origin` as the base, a crafted `next` value like `//evil.com` could potentially result in a redirect to `https://your-app.com//evil.com`, which some browsers may interpret as `https://evil.com`.
- **Fix:** Validate that `next` starts with `/` and does not contain `//`:
  ```typescript
  const next = searchParams.get("next") ?? "/";
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  ```

---

## 4. LOW SEVERITY BUGS

### BUG-015: Escape Key Handler Not Cleaned Up on Modal Unmount
- **Severity:** LOW
- **Module:** Main Page (`src/app/page.tsx`, line 267-273)
- **Description:** The Escape key listener is added in the Home component and persists even when no modal is open. While it does clean up on unmount, the handler runs on every keypress regardless of modal state, causing unnecessary re-renders via `setSelectedCompany(null)` even when it's already null.
- **Fix:** Only add the listener when `selectedCompany` is not null, or guard the handler:
  ```typescript
  if (e.key === "Escape" && selectedCompany) setSelectedCompany(null);
  ```

### BUG-016: CompanyDetailModal Missing aria-* Attributes
- **Severity:** LOW (Accessibility)
- **Module:** CompanyDetailModal (`src/components/CompanyDetailModal.tsx`)
- **Description:** The modal overlay lacks proper ARIA attributes:
  - No `role="dialog"` or `aria-modal="true"`
  - No `aria-labelledby` pointing to the company name heading
  - No focus trap (user can Tab out of modal into background content)
  - Close button has no `aria-label`
- **Fix:** Add ARIA attributes and implement focus trapping.

### BUG-017: Watchlist Page Uses `<a href="/">` Instead of Next.js `<Link>`
- **Severity:** LOW
- **Module:** Watchlist (`src/app/watchlist/page.tsx`, line 195-200)
- **Description:** The "Zur Datenbank" link in the empty state uses a plain `<a>` tag instead of Next.js `<Link>`, causing a full page reload instead of client-side navigation.
- **Fix:** Replace `<a href="/">` with `<Link href="/">`.

### BUG-018: Excel Export Does Not Include Admin Columns
- **Severity:** LOW
- **Module:** Watchlist Excel Export (`src/app/watchlist/page.tsx`, line 62-76)
- **Description:** The Excel export function does not include `contact_name`, `job_title`, or `linkedin_profile_url` even for admin users. Admins see these columns in the table but they are missing from the export.
- **Fix:** Conditionally add admin columns to the export:
  ```typescript
  if (isAdmin) {
    row["Contact Name"] = c.contact_name ?? "";
    row["Job Title"] = c.job_title ?? "";
    row["LinkedIn URL"] = c.linkedin_profile_url ?? "";
  }
  ```

### BUG-019: Pagination Bug -- Page 0 Filter Change Can Cause Double Fetch
- **Severity:** LOW
- **Module:** Main Page (`src/app/page.tsx`, lines 173-195)
- **Description:** When filters change, the debounce effect (line 173) sets page to 0 and fetches. But the page change effect (line 190) has the condition `if (page > 0)`, which means page changes FROM a higher page TO page 0 don't trigger a fetch there. However, when the user is already on page 0 and changes a filter, the debounce effect handles it correctly. The real issue is that when a user is on page 3, changes a filter, the debounce sets page to 0 and fetches with page 0. But then the page state change from 3 to 0 also triggers the page effect. The `if (page > 0)` guard prevents the double fetch in this case, which is correct. No actual bug, but the logic is fragile and confusing.
- **Fix:** Consider using a single effect for both filter/sort/page changes to avoid this complexity.

### BUG-020: Admin File Upload Has No Size Validation
- **Severity:** LOW
- **Module:** Admin Page (`src/app/admin/page.tsx`)
- **Description:** The upload area states "max. 5 MB" (line 127) but there is no actual file size validation in the code. A user could upload a very large XLSX file that would be parsed entirely in the browser, potentially causing memory issues.
- **Fix:** Add size validation:
  ```typescript
  if (f.size > 5 * 1024 * 1024) {
    setErrorMsg("Datei ist zu gross (max. 5 MB).");
    setState("error");
    return;
  }
  ```

---

## 5. DESIGN INCONSISTENCIES (UX)

### UI-001: Mixed Language (German + English)
- **Description:** The UI inconsistently mixes German and English:
  - German: Login form, Register form, Watchlist empty state, Admin page, tooltips ("Aus Watchlist entfernen")
  - English: Table headers ("Company", "Category", "Founded"), Reporting page ("Aggregated Category Analysis"), Pagination ("Previous", "Next", "Page X of Y"), Error messages ("Failed to load companies"), Export button ("Export as Excel")
- **Recommendation:** Choose one language consistently. Since the target audience is HoFT Berlin (German organization), consider localizing everything to German, or standardize on English throughout.

### UI-002: Watchlist StatusBadge Missing in Watchlist Table
- **Description:** The watchlist table shows `company.company_status` as plain text (line 310), while the main database table uses the `StatusBadge` component with colored pills. This creates a visual inconsistency.
- **Fix:** Import and use `StatusBadge` in the watchlist table.

### UI-003: Header Navigation Not Responsive
- **Description:** The Header component (`src/components/Header.tsx`) uses a horizontal flex layout with no mobile-responsive behavior. On narrow screens, the navigation items, user email, and logout button will overflow or wrap awkwardly. There is no hamburger menu or mobile navigation pattern.
- **Fix:** Add a mobile-responsive hamburger menu or collapse navigation items on small screens.

### UI-004: No Loading Skeleton for Tables
- **Description:** Loading states show a centered spinner with text. For better perceived performance, use skeleton rows (placeholder rows that mimic the table structure) instead of a single spinner.

---

## 6. PERFORMANCE ISSUES

### PERF-001: Subcategory Filter Loads Without Distinct/Limit
- **Module:** Main Page (`src/app/page.tsx`, line 80-92)
- **Description:** When loading subcategories for a selected category, the query fetches ALL rows matching that category and extracts unique subcategories in JavaScript. For a category with 3000 companies, this fetches 3000 rows just to get ~15 unique subcategory values.
- **Fix:** Use an RPC function similar to `get_distinct_countries` or add `DISTINCT` query:
  ```typescript
  const { data } = await supabase.rpc('get_distinct_subcategories', { p_category: filters.category });
  ```

### PERF-002: No Index on Commonly Filtered Columns
- **Description:** The `FinWell_data` table has 10,156 rows and only one index (primary key on `id`). There are no indexes on frequently filtered columns: `category_1`, `country`, `company_status`, `target_model`, `member`, `domain`.
- **Fix:** Add composite indexes for common filter patterns:
  ```sql
  CREATE INDEX idx_finwell_category ON public."FinWell_data" (category_1);
  CREATE INDEX idx_finwell_country ON public."FinWell_data" (country);
  CREATE INDEX idx_finwell_domain ON public."FinWell_data" (domain);
  CREATE INDEX idx_finwell_status ON public."FinWell_data" (company_status);
  ```

### PERF-003: LinkedIn Import Uses N+1 Update Pattern
- **Module:** `src/lib/import-contacts.ts` (line 144-155)
- **Description:** Each contact update is an individual `supabase.from("FinWell_data").update()` call. For 500 contacts, this means 500 sequential HTTP requests to Supabase, each with RLS evaluation overhead.
- **Fix:** Batch updates using a single RPC function or Edge Function with service_role access.

---

## 7. SECURITY DEEP DIVE (Red Team Perspective)

### SEC-001: Anon Key Exposed in Client Bundle
- **Risk:** The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is embedded in the client-side JavaScript bundle. Combined with `NEXT_PUBLIC_SUPABASE_URL`, anyone can construct Supabase client requests.
- **Current Mitigation:** RLS policies. However, the `Allow anon read access` policy (BUG-002) completely defeats this.
- **Recommendation:** Remove the anon SELECT policy on FinWell_data. Keep only `authenticated` access.

### SEC-002: Admin Role Bypass via Direct API
- **Risk:** The `isAdmin` check in UI components (CompanyTable, CompanyDetailModal, Watchlist, Header) is purely cosmetic. Any authenticated user who opens browser DevTools can:
  1. See the admin-only columns (contact_name, job_title, linkedin_profile_url) in network responses because the SELECT query fetches them for all users
  2. The RLS policy grants SELECT to all authenticated users with `qual = true`
- **Impact:** Contact names, job titles, and LinkedIn URLs of company contacts are visible to ALL authenticated users, not just admins.
- **Fix:** Either:
  a) Create a database view that excludes sensitive columns for non-admins, or
  b) Use a Postgres function (RPC) that checks the user's role before returning sensitive columns, or
  c) Create separate RLS policies that restrict column-level access (not natively supported in Postgres -- use views instead)

### SEC-003: handle_new_user_role Trigger Hardcodes Admin Email
- **Risk:** The trigger function `handle_new_user_role` hardcodes `markus.lehleiter@hoft.berlin` as the only admin. If this email needs to change or additional admins are needed, it requires a database migration.
- **Recommendation:** Use a configuration table or environment variable for admin emails instead of hardcoding.

### SEC-004: No CSRF Protection Beyond Supabase Defaults
- **Observation:** The application relies on Supabase's built-in cookie-based auth. The middleware refreshes tokens correctly. However, there are no explicit CSRF tokens on form submissions. Supabase's `SameSite=Lax` cookie policy provides basic protection, but explicit CSRF tokens would add defense-in-depth.

### SEC-005: LinkedIn Import Runs Client-Side with User's Token
- **Risk:** The LinkedIn import (`src/lib/import-contacts.ts`) runs entirely in the browser, using the logged-in admin's Supabase token. This means:
  1. The admin's browser must stay open during the entire import
  2. Token refresh may fail during long imports
  3. Error handling is fragile (single failed batch reverts, but prior batches already committed)
- **Recommendation:** Move import logic to a Supabase Edge Function.

---

## 8. MODULE-BY-MODULE STATUS

### 8.1 Authentication & Roles
| Check | Status | Notes |
|-------|--------|-------|
| Login flow | PASS | Works correctly with error handling |
| Register flow | PASS (UI) | Domain check is client-side only (BUG-008) |
| Password reset | PASS | Correctly hides email existence |
| Admin role loading | PASS | Via user_roles table with trigger |
| Middleware redirects | PASS | Auth pages redirect, protected pages require login |
| Admin middleware protection | FAIL | No server-side admin check (BUG-003) |
| Session persistence | PASS | Middleware refreshes tokens correctly |

### 8.2 Database Main Page
| Check | Status | Notes |
|-------|--------|-------|
| Search filter | PARTIAL | Works but has injection risk (BUG-001) |
| Category filter | PASS | |
| Subcategory filter | PASS | Performance issue (PERF-001) |
| Country filter | PASS | |
| Status filter | PASS | |
| Target Model filter | PASS | |
| Member Only filter | PASS | |
| Clear filters | PASS | Preserves search term correctly |
| Sort (3-stage toggle) | PASS | Text asc-first, number desc-first, reset to default |
| Pagination | PASS | |
| Bulk add to watchlist | PARTIAL | Button text bug (BUG-011) |
| Company detail modal | PASS | Rich content, funding chart, sections |
| Error state + retry | PASS | |
| Empty state | PASS | |

### 8.3 Watchlist
| Check | Status | Notes |
|-------|--------|-------|
| Add/remove favorites | PASS | Optimistic updates with rollback |
| Watchlist page loading | PASS | |
| Excel export | PARTIAL | Missing admin columns (BUG-018) |
| Dripify export (admin) | PASS | Correctly filters LinkedIn URLs |
| Empty state | PASS | German text, link to database |
| Admin columns visibility | PASS (UI) | But data exposed to all users (SEC-002) |

### 8.4 Admin
| Check | Status | Notes |
|-------|--------|-------|
| Access control (UI) | PASS | Shows "Zugriff verweigert" for non-admins |
| Access control (server) | FAIL | No middleware protection (BUG-003) |
| XLSX upload + parsing | PASS | Domain column detection, deduplication |
| Domain matching | PASS | Normalized matching, handles www/https |
| Progress indicator | PASS | Shows current/total with progress bar |
| Result display | PASS | Matched/Updated/NotFound counters |
| Unmatched domains list | PASS | Collapsible accordion |
| Error handling | PASS | Parse errors and import errors shown |
| File size validation | FAIL | Stated but not enforced (BUG-020) |

### 8.5 Reporting
| Check | Status | Notes |
|-------|--------|-------|
| 3-level drill-down | PASS | Category > Subcategory > Focus |
| KPI Cards | PASS | Company count + funding stats |
| Funding by Category chart | PASS | |
| Funding Timeline chart | PASS | |
| Status Distribution pie | PASS | |
| Target Model pie | PASS | |
| Top Countries list | PASS | |
| Keywords cloud | PASS | |
| Back navigation | PASS | Level 2>1>0 |
| Error state + retry | PASS | |
| Loading state | PASS | |

### 8.6 Database & RLS
| Check | Status | Notes |
|-------|--------|-------|
| RLS enabled on all tables | PASS | All 3 tables have RLS enabled |
| FinWell_data SELECT (auth) | PASS | |
| FinWell_data SELECT (anon) | FAIL | Should not allow anon access (BUG-002) |
| FinWell_data UPDATE (admin) | PASS | Correctly checks user_roles |
| FinWell_data INSERT/DELETE | PASS | No policies = blocked by default |
| watchlist user isolation | PASS | Users can only see/modify own watchlist |
| user_roles read own | PASS | Users can only read their own role |
| watchlist unique constraint | PASS | (user_id, company_id) unique |
| watchlist FK user_id | PASS | ON DELETE CASCADE |
| watchlist FK company_id | FAIL | Missing foreign key (BUG-006) |

---

## 9. IMPROVEMENT SUGGESTIONS

### Code Quality
1. **Extract shared utilities:** `formatFunding()`, `formatYear()`, `StatusBadge` are duplicated. Create `src/lib/format-utils.ts` and `src/components/StatusBadge.tsx`.
2. **Type the Supabase client:** Generate TypeScript types with `supabase gen types typescript` and use them for type-safe queries.
3. **Add unit tests:** There are currently zero tests. Add at minimum: text-utils, format-utils, country-flags mapping.
4. **Add ESLint rule:** Enforce no `select("*")` to prevent over-fetching.

### Architecture
1. **Move admin import to Edge Function:** The LinkedIn import runs entirely client-side. Move to a Supabase Edge Function for reliability, security (service_role key), and performance.
2. **Add server-side data fetching:** The main page fetches all data client-side. Consider using Next.js Server Components for initial data load (better SEO, faster FCP).
3. **Implement proper error boundaries:** Add React Error Boundaries to catch and display rendering errors gracefully.

### UX Enhancements
1. **Add keyboard navigation:** Table rows should be navigable with arrow keys, Enter to open modal.
2. **Add search debounce indicator:** Show a subtle loading indicator while search is debouncing.
3. **Improve mobile experience:** The table is not usable on mobile. Consider a card-based layout for small screens.
4. **Add "Select All" checkbox:** For bulk operations on the watchlist.
5. **Persist filter state in URL:** Use URL search params so users can share filtered views.

---

## 10. SUMMARY

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 3 | BUG-001, BUG-002, BUG-003 |
| HIGH | 5 | BUG-004, BUG-005, BUG-006, BUG-007, BUG-008 |
| MEDIUM | 6 | BUG-009 to BUG-014 |
| LOW | 6 | BUG-015 to BUG-020 |
| UI/UX | 4 | UI-001 to UI-004 |
| Performance | 3 | PERF-001 to PERF-003 |
| Security Notes | 5 | SEC-001 to SEC-005 |
| **Total** | **32** | |

---

## 11. RECOMMENDED FIX PRIORITY

**Phase 1 -- Before any production deployment:**
1. BUG-002: Remove anon read access on FinWell_data
2. BUG-008: Enforce @hoft.berlin restriction server-side
3. BUG-001: Sanitize search input for PostgREST filter injection
4. BUG-003: Add server-side admin route protection
5. SEC-002: Hide sensitive columns (contact_name, job_title, linkedin_profile_url) from non-admins
6. BUG-004: Enable leaked password protection
7. BUG-005: Fix function search_path on all 6 RPC functions

**Phase 2 -- Before scaling:**
1. BUG-009: Fix RLS policies to use subselect pattern
2. BUG-006: Add FK on watchlist.company_id
3. PERF-002: Add indexes on filtered columns
4. PERF-001: Optimize subcategory loading
5. BUG-007: Add domain index + optimize import

**Phase 3 -- Quality improvements:**
1. All remaining Medium/Low bugs
2. UI consistency fixes
3. Code quality improvements (DRY, types, tests)

---

**Recommendation:** Fix all Phase 1 items before deployment. The application has critical security gaps that expose the entire database to unauthenticated users and sensitive contact data to all authenticated users regardless of role.
