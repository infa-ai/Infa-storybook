export interface UsageParameters {
  mcComponentIds: string[];
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
}

export interface ComponentData {
  title: string;
  description: string | null;
  query: string | null;
  external_links: ExternalLink[];
  labels: Label[];
  component_views: ComponentView[];
  board_id?: string; // Board ID for Infa deep links
}

export type UsageDataMap = Record<string, ComponentData>;
