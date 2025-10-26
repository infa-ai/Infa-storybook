export interface UsageParameters {
  mcComponentIds: string[];
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
}

export interface ComponentData {
  title: string;
  description: string | null;
  query: string | null;
  external_links: ExternalLink[];
  labels: Label[];
  component_views: ComponentView[];
}

export type UsageDataMap = Record<string, ComponentData>;
