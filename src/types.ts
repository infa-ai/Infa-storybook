export interface UsageParameters {
  /** Optional when `infa storybook sync` maps the story's file to its components. */
  mcComponentIds?: string[];
  boardId?: string; // Optional board ID for Infa deep links
}

export interface ExternalLink {
  title: string;
  url: string;
}

export interface Label {
  title: string;
  description: string | null;
  color: string;
}

/**
 * How a usage was found: in the browser by the Infa Chrome extension (its
 * `source` is an XPath) or in code by the Infa CLI (its `source` is a
 * repo-relative file path).
 */
export type UsageSourceKind = "browser" | "code";

/**
 * One usage of a component, as the panel reads it: a component view, with
 * WHERE in the product it sits (`screenId`, a board screen) and WHICH element
 * it is (`source`). Every data file is read into this shape by
 * `normalizeUsageData` (src/usageData.ts), whatever wrote it.
 */
export interface ComponentView {
  title: string;
  /** The page the view was captured on (browser), or its file (code). */
  url: string;
  /** The XPath the extension captured; "" for a view found in code. */
  x_path: string;
  screenshot: string | null;
  code: string | null;
  is_domain_specific: boolean;
  /** The board screen the usage is on; null when it is on no screen yet. */
  screenId: string | null;
  /** Which element: an XPath (browser) or a repo-relative file path (code). */
  source: string | null;
  /** Read from `source`: an XPath is `browser`, anything else `code`. */
  sourceKind: UsageSourceKind | null;
  id?: string; // Component view ID for Infa deep links
  /** The component's default view (`infa storybook sync`): shown first. */
  is_default?: boolean;
  /** The view's self-contained interactive render, played live in the panel. */
  preview_html_url?: string;
  /** How the element is doing on the product (`component_views.selector_health`). */
  health?: ViewHealth;
}

export type ViewHealthState = "verified" | "recovered" | "stale" | "broken" | "removed";

export interface ViewHealth {
  state: ViewHealthState;
  checkedAt?: string;
  source?: string;
  reason?: string;
}

/** A flow (user goal) that uses the component, declared on the board or exercised by its tests. */
export interface UsageFlow {
  id: string;
  name: string;
  url: string;
  reasons?: string[];
}

/** A board screen a component's usages sit on. */
export interface Screen {
  screenId: string;
  title: string;
  url_pattern: string;
  default_url: string | null;
  is_dynamic: boolean;
  screenshot: string | null;
  component_view_count: number | null;
}

export interface ComponentData {
  title: string;
  description: string | null;
  query: string | null;
  external_links: ExternalLink[];
  labels: Label[];
  component_views: ComponentView[];
  board_id?: string; // Board ID for Infa deep links
  /** The board screens this component's usages sit on. */
  screens?: Screen[];
  main_component_id?: string;
  /** The component's page on the board (`infa storybook sync`). */
  board_url?: string;
  /** Flows that use the component (`infa storybook sync`). */
  flows?: UsageFlow[];
}

/** `_metadata` of the data file. */
export interface UsageMetadata {
  lastSyncedAt?: string;
  /** `infa-cli` (`infa storybook sync`); absent for the PAT script. */
  source?: string;
  boardId?: string;
  /** Story file (relative to where Storybook runs) → the components it documents. */
  stories?: Record<string, string[]>;
}

export type UsageDataMap = Record<string, ComponentData>;
