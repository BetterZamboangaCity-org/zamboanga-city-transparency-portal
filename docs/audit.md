# Repository audit — November 1, 2026

What this repo does: A static React application reads public BetterGov national
budget records, scopes them to configured offices and place searches, and shows
comparisons, historical appropriations, source links, and CSV downloads. There is
no backend, database, login, or local collection of citizen reports.

Assumed load: a public static site with independent browser sessions, hundreds to
a few thousand matching records per portal. Hosting scales independently; API
availability and per-visitor request volume remain external constraints.

The audit covered application source, configuration, scripts, examples, deployment
files, dependencies, documentation, and fetched remote branches. Runtime checks
used the Zamboanga configuration added after code inspection. Application logic
and styles were not changed as part of this audit.

## Architecture and branches

- `portal.config.ts` supplies identity, offices, place queries, district IDs, and
  explicit exclusions. Vite also uses it for HTML titles and canonical metadata.
- `PortalProvider` loads the overview and project scope, then district cards.
  `client.ts` caches successful GET promises and paginates results.
- `resolveScope` merges projects by dataset and ID, accumulates reasons, applies
  the optional region rule, and removes published exclusions.
- `/gaa` and `/about` share cached historical searches across all 38 departments.
  Families are deduplicated; each year's appropriation stays separate.
- Browser filters live in URLs. CSVs are generated locally. Reporting is disabled.
- `main` and `origin/main`: `cc65e37`, including the historical-budget feature.
- `origin/agents-md`: `3d8c2e6`; relative to main, only `AGENTS.md` and one README
  entry differ. Its guidance was read. It contains no additional application code.
- `origin/gaa-browsing`: `332b034`; the same two-file difference from main, through
  the agent-guidance merge. Its GAA feature is already present on main.

No branch merge or cherry-pick is needed for the city version. Branch refs were
refreshed with `git fetch --all --prune`; no remote writes were made.

## Must fix

1. **[P1] A sort parameter can blank the application** —
   [`Home.tsx:78`](../src/pages/Home.tsx#L78).
   - **What this is:** URL parameters select the project-list comparison function.
   - **Problem:** `in SORTS` accepts inherited properties. Opening
     `/?sort=constructor` produced `SORTS[sort].cmp is not a function` and an empty
     React root in the browser.
   - **Fix:** Validate with `Object.hasOwn(SORTS, value)` before indexing.
   - **If we skip it:** A malformed shared URL makes the portal unusable until the
     URL is corrected. This is a client-side crash, not demonstrated code execution.

2. **[P1] Malformed section fragments blank two pages** —
   [`Home.tsx:57`](../src/pages/Home.tsx#L57),
   [`Enacted.tsx:49`](../src/pages/Enacted.tsx#L49).
   - **What this is:** Effects decode URL fragments before scrolling to sections.
   - **Problem:** `/#%` and `/gaa#%` both produced `URI malformed` and an empty root.
   - **Fix:** Catch decoding failures and ignore invalid fragments at both callers.
   - **If we skip it:** Bad pasted links crash otherwise usable pages.

3. **[P1] Project-detail “Try again” does not retry the project** —
   [`Project.tsx:27`](../src/pages/Project.tsx#L27),
   [`Bits.tsx:57`](../src/components/Bits.tsx#L57).
   - **What this is:** The shared error component calls the provider's retry function.
   - **Problem:** Project detail owns a separate effect with unchanged dependencies.
     A simulated HTTP 503 followed by clicking “Try again” still recorded only one
     detail request and did not recover.
   - **Fix:** Allow the shared error component to accept a local retry callback;
     increment a local attempt dependency in Project. Keep the provider default.
   - **If we skip it:** Readers must reload or leave the page after a temporary error.

4. **[P1] Truncated project totals are presented as complete** —
   [`client.ts:109`](../src/api/client.ts#L109),
   [`Home.tsx:118`](../src/pages/Home.tsx#L118),
   [`About.tsx:59`](../src/pages/About.tsx#L59).
   - **What this is:** Each 2027 search loads at most 4,000 rows.
   - **Problem:** A query matching 4,001 rows is marked truncated in the data layer,
     but Home never displays that flag. About still says every returned line is
     shown. The CLI detects this only when someone runs it.
   - **Fix:** Show an incomplete-data warning on Home and About whenever a query is
     truncated. Keep the existing limit and CLI failure.
   - **If we skip it:** Broader configurations can publish understated totals with
     complete-looking labels. Current Zamboanga queries do not reach the limit.

5. **[P1] Setup produces an unsafe Zamboanga City search scope** —
   [`setup.ts:177`](../scripts/setup.ts#L177).
   - **What this is:** Setup strips ` City` from a district jurisdiction to build `q`.
   - **Problem:** For this city it searches `Zamboanga`, which also names multiple
     provinces. Even `Zamboanga City` matches separate words across title, region,
     and office. Live results included Dipolog, Dapitan, Pagadian, Isabela, and
     Laoag projects. Restricting to IX also loses two city projects tagged NCR.
   - **Fix:** Preserve the city name and review matches using existing exclusions.
     The city fork now does this explicitly; the generic setup generator is unchanged.
   - **If we skip it:** Rerunning setup replaces the reviewed scope and exclusions
     and can silently mix other cities' budgets into this portal.

6. **[P1] Mobile tables lose their column labels** —
   [`app.css:432`](../src/styles/app.css#L432),
   [`About.tsx:69`](../src/pages/About.tsx#L69).
   - **What this is:** At widths below 860px, table headers use `display: none`.
   - **Problem:** The About query rows have no replacement labels for Found and
     Kept. At 390px there were zero visible column headers. Hiding headers also
     removes their accessible semantics; the numeric columns lose their meaning.
   - **Fix:** Keep accessible header associations and add visible mobile labels to
     each query value. Review all three grid-based tables together.
   - **If we skip it:** Mobile readers and assistive-technology users cannot reliably
     identify counts. This affects WCAG 1.3.1, Information and Relationships.

7. **[P1] Historical-budget text falls below contrast requirements** —
   [`app.css:338`](../src/styles/app.css#L338),
   [`app.css:355`](../src/styles/app.css#L355).
   - **What this is:** Congress labels use `--ink-mute`; missing-value dashes use
     `--rule`, both against white.
   - **Problem:** Computed color ratios are 3.13:1 and 1.43:1 respectively. These
     small text elements need 4.5:1 under WCAG 1.4.3.
   - **Fix:** Use the existing `--ink-3` token, which measures 6.04:1 against white.
   - **If we skip it:** Important context and missing-data indicators remain hard
     to distinguish for readers with low vision.

## Should fix

8. **[P2] Core budget rules have no offline regression tests** —
   [`package.json`](../package.json), [`scope.ts`](../src/lib/scope.ts),
   [`gaa.ts`](../src/lib/gaa.ts), [`client.ts`](../src/api/client.ts).
   - **What this is:** The existing check script validates configured queries
     against today's live API.
   - **Problem:** There is no test command or fixture suite. Live checks do not
     exercise malformed URLs, detail retry, null versus zero, overlap deduplication,
     or truncation notices; the reproduced failures pass build and lint.
   - **Fix:** Add small Node assert tests around pagination, scope merging, exclusions,
     and yearly sums, plus browser checks for findings 1–3. Reuse installed tools.
   - **If we skip it:** Future API or UI changes can break budget rules without a
     deterministic failure before deployment.

## UI assessment

Eight findings: seven P1 and one P2; no P0 or P3 findings. Finding 5 is mitigated
in this fork's configuration, but the setup generator still needs the stated fix.

Implementation integrity: **Pass with data-scope caveats.** Office/district hierarchy,
version-separated amounts, source documents, and API disclaimers form a coherent
budget-reading interface. The original visual system was preserved.

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Accessibility | 2/4 | Labeled controls and focus styles; mobile headers and contrast need fixes. |
| Performance | 3/4 | Cached GETs, bounded pagination, lazy portraits; 99.13 KB gzip JavaScript. |
| Responsive design | 3/4 | All four pages render at 1280px and 390px; controls are 36–38px tall. |
| Theming | 3/4 | Shared color/type tokens; several component colors remain literal. No dark-mode feature is advertised. |
| Implementation integrity | 3/4 | Clear office-led data model; generic scope wording overstates location certainty. |
| **Total** | **14/20** | **Good, with release issues to address.** |

Scores describe the inspected surfaces, not a formal accessibility certification.
Small control heights are a touch-usability concern, not by themselves proof of a
WCAG 2.2 AA target-size failure. The detector flagged two left borders on disclaimers
and the source-code callout. These are incumbent design choices; no functional
defect was established, so they were not counted as findings.

Systemic gaps are URL validation, independent retry ownership, and presentation of
partial data. Preserve the good parts: explicit source links and exclusions, no
addition across budget versions, whole shared-office figures, visible unconfirmed
matches, keyboard focus, and reduced-motion handling.

Recommended UI sequence: `$impeccable harden` for URL/error handling and incomplete
data; `$impeccable adapt` for mobile table labels and touch targets;
`$impeccable polish` for contrast using the existing tokens. These can be addressed
individually or together. Re-run `$impeccable audit` after fixes.

## City configuration and checks

Configured operator: Chex and friends, linking to `https://github.com/RALPH22222` and
`https://github.com/BetterZamboangaCity-org` respectively.
Canonical URL: `https://transparency.betterzamboangacity.org`.
Both published office names and district IDs were verified against the live API.

The scope contains 120 FY 2027 lines: 113 DPWH, four farm-to-market roads, and three
health-facility entries. Twenty explicit false matches are excluded and visible
on About. The 994 historical families span five matching departments, with all
38 departments searched. All 35 matching department/year totals reconcile.

The central-office projects `house-reading:16155` and `house-reading:16139` remain
included despite their NCR tags. Reviewed inclusions either name Zamboanga City
in the title or belong to one of its two offices. Inter-city road sections still
need geographic review; a matching road name does not establish city boundaries.
Historical office totals unavailable from the API remain null: 2020–2025 for the
1st office and 2020–2024 for the 2nd office at the time of checking.

Validation completed:

- TypeScript build, ESLint, and Vite production build passed.
- City live check passed, including all exclusions and 35 reconciliations.
- All three example configurations passed live checks. The municipality example
  emitted its expected warning about three title-only DPWH matches.
- Additional live assertions checked exclusions, title/office inclusion reasons,
  the two NCR-tagged city projects, and all historical family names.
- Four routes were inspected in Chromium/Edge at 1280px and 390px. Normal routes
  rendered without uncaught errors. Three malformed-link reproductions and the
  simulated 503 detail-retry check failed as documented above.
- Built HTML contains the city identity and configured canonical/Open Graph URL.

Dependency audit: `npm audit` reports 12 moderate package entries, all tracing to
one development-tool advisory for `minimatch@10.2.6` through ESLint and
TypeScript-ESLint. The [upstream advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249)
describes excessive resource use from attacker-controlled glob patterns with
`optimizationLevel >= 2`; version 11.0.1 is patched. This is not 12 separate
application vulnerabilities. No visitor-controlled path to this development tool
was found. `npm audit --omit=dev` reports zero vulnerabilities. Review compatible
lint-tool upgrades separately; no forced downgrade or dependency override was applied.

Verdict: The city configuration is ready for review. Fix the reproduced crashes,
retry failure, and accessibility issues before calling the application release-ready.

Not checked: deployed Vercel behavior, physical mobile devices, a screen-reader
session, geographic chainage of inter-city roads, every source PDF amount, or poster
regeneration. No deployment, commit, or push was performed.
