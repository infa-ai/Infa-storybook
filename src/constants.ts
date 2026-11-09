export const ADDON_ID = "usage-addon";
export const PANEL_ID = `${ADDON_ID}/panel`;
export const KEY = `usage-addon`;

/** The data file `infa-usage-fetch` writes, relative to the project root. */
export const DEFAULT_DATA_FILE = "src/data/usage-data.json";

/** The global the preset sets in the manager page and the panel reads. */
export const DATA_GLOBAL = "__INFA_USAGE_DATA__";

export const EVENTS = {
  RESULT: `${ADDON_ID}/result`,
  REQUEST: `${ADDON_ID}/request`,
};
