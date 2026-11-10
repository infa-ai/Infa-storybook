#!/usr/bin/env node

/**
 * Says what a usage data file knows about screens and sources:
 * - which views sit on a screen (`screenId`), and which on none yet
 * - which were found in the browser (an XPath) and which in code (a file)
 * - the screens each component lists (`screens`)
 *
 * Older files are read too: `page_id` / `screen_id` on a view, `pages` on a
 * component, and no `source` (the XPath, else a repo path in `url`).
 *
 *   node scripts/check-screens.js [path/to/usage-data.json]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, "../src/data/usage-data.json");

const firstString = (obj, ...keys) => {
  for (const key of keys) {
    if (typeof obj[key] === "string" && obj[key].trim()) return obj[key];
  }
  return null;
};

const sourceKindOf = (view) => {
  if (view.sourceKind === "browser" || view.sourceKind === "code") return view.sourceKind;
  const source = firstString(view, "source");
  if (source) return /^[/(]/.test(source.trim()) ? "browser" : "code";
  if (firstString(view, "x_path", "xPath")) return "browser";
  const url = firstString(view, "url");
  if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith("//")) return "code";
  return null;
};

console.log(`🔍 Checking screens and sources in ${path.relative(process.cwd(), DATA_FILE)}\n`);

try {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  let totalViews = 0;
  let withScreen = 0;
  let listedScreens = 0;
  const kinds = { browser: 0, code: 0, unknown: 0 };
  const byScreen = new Map();

  for (const [key, component] of Object.entries(data)) {
    if (key === "_metadata" || !component || typeof component !== "object") continue;
    const screens = Array.isArray(component.screens) ? component.screens : (component.pages ?? []);
    listedScreens += screens.length;
    const titles = new Map(
      screens.map((s) => [firstString(s, "screenId", "screen_id", "page_id"), s.title]),
    );

    for (const view of component.component_views ?? []) {
      totalViews++;
      kinds[sourceKindOf(view) ?? "unknown"]++;
      const screenId = firstString(view, "screenId", "screen_id", "pageId", "page_id");
      if (!screenId) continue;
      withScreen++;
      const entry = byScreen.get(screenId) ?? { title: titles.get(screenId) ?? null, views: [] };
      entry.views.push(`${component.title} · ${view.title}`);
      byScreen.set(screenId, entry);
    }
  }

  console.log("📄 Usages (component views):");
  console.log(`   - Total: ${totalViews}`);
  console.log(`   - On a screen: ${withScreen}`);
  console.log(`   - Not on a screen yet: ${totalViews - withScreen}`);
  console.log(`   - Found in the browser: ${kinds.browser}`);
  console.log(`   - Found in code: ${kinds.code}`);
  console.log(`   - No source: ${kinds.unknown}`);
  console.log(`   - Screens listed by components: ${listedScreens}`);
  console.log("");

  if (byScreen.size > 0) {
    console.log("🖥  Screens with usages:");
    for (const [screenId, { title, views }] of byScreen) {
      console.log(`\n   ${title ?? "(not listed)"} — ${screenId}`);
      for (const v of views) console.log(`   • ${v}`);
    }
  } else {
    console.log("❌ No usage sits on a screen (every screenId is null).");
  }
  console.log("");
} catch (error) {
  console.error("❌ Error reading/parsing data file:", error.message);
  process.exit(1);
}
