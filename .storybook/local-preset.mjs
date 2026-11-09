/**
 * Loads the built addon in this test Storybook, the way a project's
 * `addons: ["storybook-infa-usage"]` does: the manager and preview entries,
 * and the preset that hands the usage data (src/data/usage-data.json) to the
 * panel.
 */
import { fileURLToPath } from "node:url";

const dist = (file) => fileURLToPath(new URL(`../dist/${file}`, import.meta.url));

export function previewAnnotations(entry = []) {
  return [...entry, dist("preview.js")];
}

export function managerEntries(entry = []) {
  return [...entry, dist("manager.js")];
}

export { managerHead } from "../dist/preset.js";
