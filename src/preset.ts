/**
 * Node-side preset: hands the project's usage data to the Usage panel.
 *
 * The panel runs in Storybook's manager (the browser), which cannot read
 * files from the project. The preset reads the data file that
 * `infa-usage-fetch` wrote and puts it into the manager page as
 * `window.__INFA_USAGE_DATA__`, which the panel reads.
 *
 * Options (in `.storybook/main.ts`):
 *   addons: [{ name: "storybook-infa-usage", options: { dataFile: "src/data/usage-data.json" } }]
 * A relative `dataFile` is resolved against the directory Storybook runs in.
 */
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

import { DATA_GLOBAL, DEFAULT_DATA_FILE } from "./constants";

interface UsageAddonOptions {
  dataFile?: string;
}

/** Where the data file is, for the given addon options. */
export function resolveDataFile(options: UsageAddonOptions = {}, cwd = process.cwd()): string {
  const file = options.dataFile || DEFAULT_DATA_FILE;
  return isAbsolute(file) ? file : resolve(cwd, file);
}

/** The data file's JSON, or null when there is none or it does not parse. */
export function readUsageData(file: string): unknown {
  if (!existsSync(file)) {
    console.warn(
      `[storybook-infa-usage] No usage data at ${file}. Run \`npx infa-usage-fetch\` to create it.`,
    );
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    console.warn(
      `[storybook-infa-usage] Could not read ${file}: ${(error as Error).message}`,
    );
    return null;
  }
}

/** A `<script>` that sets the global, safe to put inline in HTML. */
export function usageDataScript(data: unknown): string {
  const json = JSON.stringify(data ?? null)
    .replace(/</g, "\\u003c")
    .split(String.fromCharCode(0x2028)).join("\\u2028")
    .split(String.fromCharCode(0x2029)).join("\\u2029");
  return `<script>window.${DATA_GLOBAL} = ${json};</script>`;
}

export const managerHead = (head: string | undefined, options: UsageAddonOptions = {}) => {
  const data = readUsageData(resolveDataFile(options));
  return `${head ?? ""}\n${usageDataScript(data)}`;
};
