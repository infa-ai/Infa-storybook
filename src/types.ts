export interface UsageParameters {
  mcComponentIds: string[];
}

export interface ComponentData {
  title: string;
}

export type UsageDataMap = Record<string, ComponentData>;
