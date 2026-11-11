/**
 * Reads the usage data file into the one shape the panel renders.
 *
 * Three writers have produced this file over time, and a project may still
 * have any of them on disk:
 *
 * - `npx infa storybook sync` (the Infa CLI), current: each view carries
 *   `source`, `sourceKind` and `screenId`.
 * - The same command before those fields: each view has `x_path`, `url` and
 *   `page_id`, and the component a `pages` list.
 * - `npx infa-usage-fetch` (scripts/infa-integration.js, the PAT script),
 *   older releases: the same as above, sometimes `screen_id` on a view and
 *   `screens` on a component.
 *
 * A usage is a component view: `screenId` says where in the product it is (a
 * board screen) and `source` which element exactly — an XPath for a view the
 * Chrome extension found in the browser, a repo-relative file path for one
 * the CLI found in code. When a file predates those fields they are derived
 * the same way the CLI derives them, so the panel has one shape to read.
 *
 * Pure: no Storybook import, so it runs in tests and in the manager alike.
 */
import type {
  CallSiteKind,
  CodeCallSite,
  CodeRoot,
  CodeRoute,
  CodeUsages,
  ComponentData,
  ComponentView,
  Screen,
  UsageDataMap,
  UsageMetadata,
  UsageSourceKind,
  ViewHealth,
  ViewHealthState,
} from "./types";

const HEALTH_STATES = new Set<ViewHealthState>(["verified", "recovered", "stale", "broken", "removed"]);

type Raw = Record<string, unknown>;

function asRecord(value: unknown): Raw {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Raw) : {};
}

function asArray(value: unknown): Raw[] {
  return Array.isArray(value) ? value.filter((v): v is Raw => Boolean(v) && typeof v === "object") : [];
}

/** A non-empty string, else null. */
function str(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/** The first non-empty string among `keys` of `raw`. */
function firstStr(raw: Raw, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = str(raw[key]);
    if (value) return value;
  }
  return null;
}

/** An XPath, as the extension captures it: absolute (`/…`, `//…`) or grouped (`(//…)[2]`). */
export function isXPath(source: string): boolean {
  return /^[/(]/.test(source.trim());
}

/**
 * Whether a view's `url` is a file in the repo (what the CLI stores for a
 * view it found in code) rather than a page: no scheme (`https:`, `infa:`,
 * `file:`), not protocol-relative.
 */
export function isRepoPath(url: string): boolean {
  const value = url.trim();
  return value.length > 0 && !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//");
}

/**
 * How a usage was found, read from its `source`: an XPath means the browser
 * (the Chrome extension), anything else a file found in code (the CLI).
 */
export function sourceKindOf(source: string | null | undefined): UsageSourceKind | null {
  if (!source || !source.trim()) return null;
  return isXPath(source) ? "browser" : "code";
}

function readSourceKind(value: unknown): UsageSourceKind | null {
  return value === "browser" || value === "code" ? value : null;
}

function readHealth(value: unknown): ViewHealth | undefined {
  const raw = asRecord(value);
  const state = raw.state as ViewHealthState;
  if (!HEALTH_STATES.has(state)) return undefined;
  const health: ViewHealth = { state };
  const checkedAt = str(raw.checkedAt);
  if (checkedAt) health.checkedAt = checkedAt;
  const source = str(raw.source);
  if (source) health.source = source;
  const reason = str(raw.reason);
  if (reason) health.reason = reason;
  return health;
}

/**
 * The view's source and how it was found. The file's own fields win; a file
 * without them falls back to the XPath, then to a `url` that is a repo path.
 */
function readSource(raw: Raw, xPath: string, url: string): { source: string | null; sourceKind: UsageSourceKind | null } {
  const written = str(raw.source);
  const writtenKind = readSourceKind(raw.sourceKind ?? raw.source_kind);
  if (written) return { source: written, sourceKind: writtenKind ?? sourceKindOf(written) };
  if (xPath) return { source: xPath, sourceKind: writtenKind ?? "browser" };
  // A file path is code even when it is absolute (`/Users/…`), which would
  // read as an XPath by its first character.
  if (isRepoPath(url)) return { source: url, sourceKind: writtenKind ?? "code" };
  return { source: null, sourceKind: writtenKind };
}

/**
 * One view of the data file, in the panel's shape.
 *
 * @param value - A `component_views` item as any writer wrote it.
 */
export function normalizeView(value: unknown): ComponentView {
  const raw = asRecord(value);
  const xPath = firstStr(raw, "x_path", "xPath") ?? "";
  const url = firstStr(raw, "url") ?? "";
  const view: ComponentView = {
    title: firstStr(raw, "title") ?? "Untitled view",
    url,
    x_path: xPath,
    screenshot: str(raw.screenshot),
    code: str(raw.code),
    is_domain_specific: raw.is_domain_specific === true,
    screenId: firstStr(raw, "screenId", "screen_id", "pageId", "page_id"),
    ...readSource(raw, xPath, url),
  };
  const id = firstStr(raw, "id", "component_view_id");
  if (id) view.id = id;
  if (raw.is_default === true || raw.isDefault === true) view.is_default = true;
  const live = firstStr(raw, "preview_html_url", "previewHtmlUrl");
  if (live) view.preview_html_url = live;
  const health = readHealth(raw.health);
  if (health) view.health = health;
  return view;
}

/**
 * One screen of a component's `screens` (or the older `pages`), or null
 * without an id.
 *
 * @param value - The item.
 */
export function normalizeScreen(value: unknown): Screen | null {
  const raw = asRecord(value);
  const screenId = firstStr(raw, "screenId", "screen_id", "pageId", "page_id");
  if (!screenId) return null;
  const pattern = firstStr(raw, "url_pattern") ?? "";
  return {
    screenId,
    title: firstStr(raw, "title") ?? (pattern || screenId),
    url_pattern: pattern,
    default_url: str(raw.default_url),
    is_dynamic: raw.is_dynamic === true,
    screenshot: str(raw.screenshot),
    component_view_count: typeof raw.component_view_count === "number" ? raw.component_view_count : null,
  };
}

/**
 * One component of the data file, in the panel's shape.
 *
 * @param value - The component's object.
 */
export function normalizeComponent(value: unknown): ComponentData {
  const raw = asRecord(value);
  const screenList = Array.isArray(raw.screens) ? raw.screens : raw.pages;
  const component: ComponentData = {
    title: firstStr(raw, "title") ?? "Untitled Component",
    description: str(raw.description),
    query: str(raw.query),
    external_links: asArray(raw.external_links).flatMap((l) => {
      const url = str(l.url);
      return url ? [{ title: str(l.title) ?? url, url }] : [];
    }),
    labels: asArray(raw.labels).map((l) => ({
      title: str(l.title) ?? "",
      description: str(l.description),
      color: str(l.color) ?? "#8d8d8d",
    })),
    component_views: asArray(raw.component_views).map(normalizeView),
    screens: asArray(screenList).flatMap((s) => {
      const screen = normalizeScreen(s);
      return screen ? [screen] : [];
    }),
  };
  const boardId = str(raw.board_id);
  if (boardId) component.board_id = boardId;
  const mainId = str(raw.main_component_id);
  if (mainId) component.main_component_id = mainId;
  const boardUrl = str(raw.board_url);
  if (boardUrl) component.board_url = boardUrl;
  const flows = asArray(raw.flows).flatMap((f) => {
    const id = str(f.id);
    const url = str(f.url);
    if (!id || !url) return [];
    const reasons = Array.isArray(f.reasons) ? f.reasons.filter((r): r is string => typeof r === "string") : undefined;
    return [{ id, name: str(f.name) ?? "Untitled flow", url, ...(reasons ? { reasons } : {}) }];
  });
  if (flows.length > 0) component.flows = flows;
  const code = normalizeCodeUsages(raw.code_usages);
  if (code) component.code_usages = code;
  return component;
}

const CALL_SITE_KINDS = new Set<CallSiteKind>(["jsx", "wrapper", "lazy", "reference"]);

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readRoute(value: unknown): CodeRoute | null {
  const raw = asRecord(value);
  const path = str(raw.path);
  const file = str(raw.file);
  if (!path || !file) return null;
  return {
    path,
    kind: raw.kind === "layout" ? "layout" : "page",
    file,
    root: num(raw.root),
    screenId: str(raw.screenId),
    via: Array.isArray(raw.via) ? raw.via.filter((v): v is string => typeof v === "string") : [],
  };
}

function readCallSite(value: unknown): CodeCallSite | null {
  const raw = asRecord(value);
  const file = str(raw.file);
  const line = num(raw.line);
  if (!file || line < 1) return null;
  const kind = CALL_SITE_KINDS.has(raw.kind as CallSiteKind) ? (raw.kind as CallSiteKind) : "jsx";
  const site: CodeCallSite = {
    file,
    root: num(raw.root),
    line,
    column: num(raw.column, 1),
    kind,
    element: str(raw.element) ?? "",
    within: str(raw.within),
    props: asArray(raw.props).flatMap((p) => {
      const name = str(p.name);
      if (!name) return [];
      return [typeof p.value === "string" ? { name, value: p.value } : { name }];
    }),
    routes: asArray(raw.routes).flatMap((r) => {
      const route = readRoute(r);
      return route ? [route] : [];
    }),
  };
  const through = str(raw.through);
  if (through) site.through = through;
  const more = num(raw.moreRoutes);
  if (more > 0) site.moreRoutes = more;
  return site;
}

/**
 * A component's `code_usages` (`infa storybook sync`), or undefined when the
 * file has none. Sites without a file and a line are dropped.
 *
 * @param value - The component's `code_usages`.
 */
export function normalizeCodeUsages(value: unknown): CodeUsages | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = asRecord(value);
  const sites = asArray(raw.sites).flatMap((s) => {
    const site = readCallSite(s);
    return site ? [site] : [];
  });
  return {
    file: str(raw.file) ?? "",
    exportName: str(raw.exportName),
    total: Math.max(num(raw.total, sites.length), sites.length),
    files: num(raw.files, new Set(sites.map((s) => `${s.root}:${s.file}`)).size),
    sites,
    props: asArray(raw.props).flatMap((p) => {
      const name = str(p.name);
      if (!name) return [];
      return [
        {
          name,
          uses: num(p.uses),
          values: asArray(p.values).flatMap((v) => (typeof v.value === "string" ? [{ value: v.value, count: num(v.count) }] : [])),
        },
      ];
    }),
  };
}

function readCodeRoots(value: unknown): CodeRoot[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((v) => {
    const raw = asRecord(v);
    const repo = asRecord(raw.repository);
    const url = str(repo.url);
    const branch = str(repo.branch);
    return { name: str(raw.name) ?? ".", repository: url && branch ? { url, branch } : null };
  });
}

/**
 * The whole data file (`window.__INFA_USAGE_DATA__`): its components keyed by
 * id and its `_metadata`. Anything that is not an object reads as empty.
 *
 * @param value - The parsed JSON.
 */
export function normalizeUsageData(value: unknown): { components: UsageDataMap; metadata: UsageMetadata } {
  const raw = asRecord(value);
  const components: UsageDataMap = {};
  for (const [id, entry] of Object.entries(raw)) {
    if (id === "_metadata" || !entry || typeof entry !== "object") continue;
    components[id] = normalizeComponent(entry);
  }
  const metadata = { ...asRecord(raw._metadata) } as UsageMetadata;
  const codeRoots = readCodeRoots(asRecord(raw._metadata).codeRoots);
  if (codeRoots) metadata.codeRoots = codeRoots;
  else delete metadata.codeRoots;
  return { components, metadata };
}
