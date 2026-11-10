#!/usr/bin/env node

/**
 * infa-usage-fetch — writes the Usage panel's data from Infa with a Personal
 * Access Token. The Infa CLI does the same signed in as you, for team boards
 * too and with no ids in your stories: `npx infa storybook sync`. This stays
 * for setups that already use a token.
 *
 * Run it from your project's root (locally or in CI):
 *
 *   INFA_API_KEY=… npx infa-usage-fetch
 *   npx infa-usage-fetch --stories src --out src/data/usage-data.json
 *   npx infa-usage-fetch --ids mc_abc12345,mc_def67890
 *
 * It finds `mcComponentIds` in your story files, asks the Infa API for those
 * components, and writes the JSON file the addon shows in Storybook. The key
 * is a Personal Access Token from https://infa.ai/profile?tab=integrations
 * (Profile → Integrations → Personal Access Tokens), sent as the `x-api-key`
 * header. It is read from INFA_API_KEY, or from a .env file in the directory
 * you run this in. No dependencies: Node 18.17 or later.
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const API_URL =
  "https://api.infa.ai/rest/v1/rpc/get_storybook_main_components";
// The public (anon) key every Infa API request carries in `apikey`; it is the
// same for everyone and grants nothing on its own. Your own key goes in
// `x-api-key`.
const PUBLIC_APIKEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjaHdvdnh4YmdjZHljYXFtZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcxMDczNDksImV4cCI6MjAzMjY4MzM0OX0.0EIrHDQZMihWRsQ8ke1uoP4e0seFBJxuxLqc0jIhQGA";
const TOKEN_PAGE = "https://infa.ai/profile?tab=integrations";
const DEFAULT_OUT = "src/data/usage-data.json";
const STORY_FILE = /\.stories\.(?:[tj]sx?|mdx)$/;
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "storybook-static",
  "coverage",
  ".next",
  ".turbo",
]);

function fail(lines) {
  console.error(["", ...lines.map((l) => `  ${l}`), ""].join("\n"));
  process.exit(1);
}

function parseArgs(argv) {
  const args = { stories: ".", out: DEFAULT_OUT, ids: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      const next = argv[i + 1];
      if (next === undefined) fail([`${arg} needs a value.`]);
      i += 1;
      return next;
    };
    if (arg === "--stories") args.stories = value();
    else if (arg === "--out") args.out = value();
    else if (arg === "--ids")
      args.ids = value()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: infa-usage-fetch [--stories <dir>] [--out <file>] [--ids mc_a,mc_b]",
      );
      process.exit(0);
    } else fail([`Unknown option ${arg}. Try --help.`]);
  }
  return args;
}

/** A .env file in the working directory, without overriding the environment. */
function loadDotEnv() {
  const file = path.resolve(".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_]\w*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

/** The key as it should be sent: no whitespace, no quotes around it. */
export function cleanApiKey(raw) {
  return (raw ?? "")
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2")
    .trim();
}

function* storyFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name))
        yield* storyFiles(path.join(dir, entry.name));
    } else if (STORY_FILE.test(entry.name)) {
      yield path.join(dir, entry.name);
    }
  }
}

/** Every id inside `mcComponentIds: [ … ]` in the story files under `dir`. */
export function findComponentIds(dir) {
  const ids = new Set();
  for (const file of storyFiles(dir)) {
    const content = fs.readFileSync(file, "utf8");
    for (const list of content.matchAll(/mcComponentIds\s*:\s*\[([^\]]*)\]/g)) {
      for (const id of list[1].matchAll(/['"`]([^'"`]+)['"`]/g))
        ids.add(id[1].trim());
    }
  }
  return [...ids];
}

/** What a failed answer from the API means, in words a person can act on. */
export function explainApiError(status, body) {
  let message = body;
  try {
    message = JSON.parse(body).message ?? body;
  } catch {
    /* not JSON */
  }
  if (/Invalid API key or (API key|user) not found/i.test(message)) {
    return [
      "Infa did not recognise the key in INFA_API_KEY.",
      `Copy a Personal Access Token from ${TOKEN_PAGE}`,
      "(Profile → Integrations → Personal Access Tokens → the copy button)",
      "and set it as INFA_API_KEY, with no spaces or line breaks around it.",
    ];
  }
  if (status === 401) {
    return [
      "The request was refused before reaching Infa (401).",
      "Your key goes in INFA_API_KEY; this script sends it as the x-api-key header.",
    ];
  }
  return [`The Infa API answered ${status}: ${message}`];
}

/**
 * Which element a view is and how it was found, as the addon reads it
 * (src/usageData.ts does the same for any file): an XPath means the browser
 * (the Chrome extension), a repo path in `url` means code (the Infa CLI).
 */
export function viewSource(view) {
  const xPath = typeof view.x_path === "string" ? view.x_path.trim() : "";
  if (xPath) return { source: xPath, sourceKind: "browser" };
  const url = typeof view.url === "string" ? view.url.trim() : "";
  if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith("//")) {
    return { source: url, sourceKind: "code" };
  }
  return { source: null, sourceKind: null };
}

/** One component from the API, in the shape the panel reads. */
export function toComponentData(item) {
  const screens = Array.isArray(item.screens) ? item.screens : (item.pages ?? []);
  return {
    title: item.title || "Untitled Component",
    description: item.description ?? null,
    query: item.query ?? null,
    external_links: item.external_links ?? [],
    labels: item.labels ?? [],
    component_views: (item.component_views ?? []).map(({ page_id, screen_id, ...view }) => ({
      ...view,
      screenId: screen_id ?? page_id ?? null,
      ...viewSource(view),
    })),
    board_id: item.board_id ?? null,
    screens: screens.map(({ page_id, screen_id, ...screen }) => ({
      ...screen,
      screenId: screen_id ?? page_id,
    })),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadDotEnv();

  const apiKey = cleanApiKey(process.env.INFA_API_KEY);
  if (!apiKey) {
    fail([
      "INFA_API_KEY is not set.",
      `Create a Personal Access Token at ${TOKEN_PAGE}`,
      "(Profile → Integrations → Personal Access Tokens), then:",
      '  export INFA_API_KEY="<your token>"',
      "or put INFA_API_KEY=<your token> in a .env file here.",
    ]);
  }
  if (!/^[A-Za-z0-9]{64}$/.test(apiKey)) {
    console.warn(
      "⚠️  INFA_API_KEY does not look like an Infa Personal Access Token (64 letters and digits). Trying anyway.",
    );
  }

  const ids = args.ids ?? findComponentIds(path.resolve(args.stories));
  const outFile = path.resolve(args.out);
  if (ids.length === 0) {
    console.log(
      "ℹ️  No mcComponentIds found in your stories; writing an empty data file.",
    );
  } else {
    console.log(
      `🔄 Fetching ${ids.length} component(s) from Infa: ${ids.join(", ")}`,
    );
  }

  let data = [];
  if (ids.length > 0) {
    let response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: PUBLIC_APIKEY,
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ p_mc_component_ids: ids }),
      });
    } catch (error) {
      fail([`Could not reach api.infa.ai: ${error.message}`]);
    }
    if (!response.ok)
      fail(explainApiError(response.status, await response.text()));
    data = await response.json();
  }

  const result = {};
  for (const item of data) result[item.id] = toComponentData(item);

  const missing = ids.filter((id) => !result[id]);
  if (missing.length > 0) {
    console.warn(
      `⚠️  Not returned: ${missing.join(", ")}. The key reads components on boards its own account owns; check the id and which account made the token, or sync as yourself (team boards too) with \`npx infa storybook sync\`.`,
    );
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(
    outFile,
    `${JSON.stringify(
      { ...result, _metadata: { lastSyncedAt: new Date().toISOString() } },
      null,
      2,
    )}\n`,
  );
  console.log(
    `✅ Wrote ${Object.keys(result).length} component(s) to ${path.relative(process.cwd(), outFile)}. Restart Storybook to see them.`,
  );
}

const invokedDirectly =
  process.argv[1] &&
  import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
if (invokedDirectly) main();
