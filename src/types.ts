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

export interface ComponentView {
  title: string;
  url: string;
  x_path: string;
  screenshot: string | null;
  code: string | null;
  is_domain_specific: boolean;
  page_id: string | null;
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

export interface Page {
  page_id: string;
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
  pages?: Page[]; // Pages for the board this component belongs to
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
