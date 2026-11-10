import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  isRepoPath,
  isXPath,
  normalizeComponent,
  normalizeScreen,
  normalizeUsageData,
  normalizeView,
  sourceKindOf,
} from "../src/usageData";
// The PAT fallback (`npx infa-usage-fetch`); importing it runs nothing.
import { toComponentData } from "../scripts/infa-integration.js";

describe("sourceKindOf", () => {
  it("reads an XPath as the browser and anything else as code", () => {
    expect(sourceKindOf("//body/div/button")).toBe("browser");
    expect(sourceKindOf("/html/body/main/button[2]")).toBe("browser");
    expect(sourceKindOf("(//button)[3]")).toBe("browser");
    expect(sourceKindOf("src/components/Button/Button.tsx")).toBe("code");
    expect(sourceKindOf("")).toBeNull();
    expect(sourceKindOf(null)).toBeNull();
  });
  it("tells a repo path from a page", () => {
    expect(isRepoPath("src/components/Button.tsx")).toBe(true);
    expect(isRepoPath("https://app.example/x")).toBe(false);
    expect(isRepoPath("infa:src/x.tsx")).toBe(false);
    expect(isRepoPath("//cdn.example/x")).toBe(false);
    expect(isRepoPath("")).toBe(false);
    expect(isXPath("  //a")).toBe(true);
  });
});

describe("normalizeView", () => {
  it("keeps what the current CLI writes", () => {
    const view = normalizeView({
      id: "cv_1",
      title: "Save",
      url: "src/components/Button/Button.tsx",
      x_path: "",
      screenshot: null,
      code: null,
      is_domain_specific: false,
      source: "src/components/Button/Button.tsx",
      sourceKind: "code",
      screenId: "s_home",
      is_default: true,
      preview_html_url: "https://cdn.example/cv_1.html",
      health: { state: "verified", checkedAt: "2026-11-01" },
    });
    expect(view).toEqual({
      id: "cv_1",
      title: "Save",
      url: "src/components/Button/Button.tsx",
      x_path: "",
      screenshot: null,
      code: null,
      is_domain_specific: false,
      source: "src/components/Button/Button.tsx",
      sourceKind: "code",
      screenId: "s_home",
      is_default: true,
      preview_html_url: "https://cdn.example/cv_1.html",
      health: { state: "verified", checkedAt: "2026-11-01" },
    });
  });

  it("derives the kind from a written source when the kind is missing or unknown", () => {
    expect(normalizeView({ source: "//main/button" }).sourceKind).toBe("browser");
    expect(normalizeView({ source: "src/A.tsx", sourceKind: "elsewhere" }).sourceKind).toBe("code");
  });

  it("reads an older file: the XPath is the source, page_id the screen", () => {
    const view = normalizeView({
      title: "Star",
      url: "https://github.com/search",
      x_path: "//body/div/button",
      page_id: "p_search",
    });
    expect(view).toMatchObject({
      url: "https://github.com/search",
      source: "//body/div/button",
      sourceKind: "browser",
      screenId: "p_search",
    });
  });

  it("reads a view found in code from its url when there is no XPath", () => {
    expect(normalizeView({ url: "src/Button.tsx", x_path: "", screen_id: "s_1" })).toMatchObject({
      source: "src/Button.tsx",
      sourceKind: "code",
      screenId: "s_1",
    });
    // An absolute file path is still code, though it starts with "/".
    expect(normalizeView({ url: "/Users/me/app/src/Button.tsx" })).toMatchObject({
      source: "/Users/me/app/src/Button.tsx",
      sourceKind: "code",
    });
  });

  it("leaves source, kind and screen null when nothing says them", () => {
    expect(normalizeView({ title: "x", url: "https://app.example/" })).toMatchObject({
      source: null,
      sourceKind: null,
      screenId: null,
    });
  });

  it("fills a broken item instead of throwing", () => {
    expect(normalizeView(null)).toMatchObject({ title: "Untitled view", url: "", x_path: "", screenId: null });
    expect(normalizeView({ health: { state: "nonsense" } }).health).toBeUndefined();
  });
});

describe("normalizeScreen", () => {
  it("reads screenId, screen_id and the older page_id", () => {
    expect(normalizeScreen({ screenId: "s_1", title: "Home" })?.screenId).toBe("s_1");
    expect(normalizeScreen({ screen_id: "s_2", title: "Home" })?.screenId).toBe("s_2");
    expect(normalizeScreen({ page_id: "p_3", url_pattern: "/x" })).toMatchObject({ screenId: "p_3", title: "/x" });
    expect(normalizeScreen({ title: "No id" })).toBeNull();
  });
});

describe("normalizeComponent", () => {
  it("reads screens, and pages from an older file", () => {
    expect(normalizeComponent({ screens: [{ screenId: "s_1", title: "A" }] }).screens).toHaveLength(1);
    expect(normalizeComponent({ pages: [{ page_id: "p_1", title: "A" }] }).screens?.[0]?.screenId).toBe("p_1");
  });
  it("keeps what only the CLI writes", () => {
    const out = normalizeComponent({
      title: "Button",
      board_id: "b_1",
      main_component_id: "mc_a",
      board_url: "https://infa.ai/b/b_1/components/mc_a",
      flows: [{ id: "f_1", name: "Sign in", url: "https://infa.ai/b/b_1/flows/f_1", reasons: ["test_evidence"] }],
    });
    expect(out).toMatchObject({
      board_id: "b_1",
      main_component_id: "mc_a",
      board_url: "https://infa.ai/b/b_1/components/mc_a",
      flows: [{ id: "f_1", name: "Sign in", reasons: ["test_evidence"] }],
      component_views: [],
      screens: [],
    });
  });
});

describe("the PAT script's shape", () => {
  const apiItem = {
    id: "mc_a",
    title: "Button",
    board_id: "b_1",
    component_views: [
      { id: "cv_1", title: "On home", url: "https://app.example/", x_path: "//main/button", screen_id: "s_1" },
      { id: "cv_2", title: "In code", url: "src/Button.tsx", x_path: "", screen_id: null },
    ],
    screens: [{ screen_id: "s_1", title: "Home", url_pattern: "https://app.example/" }],
  };

  it("writes the three fields itself", () => {
    const written = toComponentData(apiItem);
    expect(written.component_views.map((v: Record<string, unknown>) => [v.screenId, v.source, v.sourceKind])).toEqual([
      ["s_1", "//main/button", "browser"],
      [null, "src/Button.tsx", "code"],
    ]);
    expect(written.screens[0].screenId).toBe("s_1");
  });

  it("reads back the same through the panel's reader", () => {
    const read = normalizeComponent(toComponentData(apiItem));
    expect(read.component_views.map((v) => [v.screenId, v.source, v.sourceKind])).toEqual([
      ["s_1", "//main/button", "browser"],
      [null, "src/Button.tsx", "code"],
    ]);
    expect(read.screens?.[0]).toMatchObject({ screenId: "s_1", title: "Home" });
  });
});

describe("normalizeUsageData", () => {
  it("splits the components from _metadata", () => {
    const { components, metadata } = normalizeUsageData({
      mc_a: { title: "A", component_views: [{ x_path: "//a", page_id: "p_1" }] },
      _metadata: { lastSyncedAt: "2026-11-10T00:00:00Z", stories: { "src/A.stories.tsx": ["mc_a"] } },
    });
    expect(Object.keys(components)).toEqual(["mc_a"]);
    expect(components.mc_a?.component_views[0]).toMatchObject({ screenId: "p_1", sourceKind: "browser" });
    expect(metadata.stories).toEqual({ "src/A.stories.tsx": ["mc_a"] });
  });
  it("reads nothing from a value that is not an object", () => {
    expect(normalizeUsageData(null)).toEqual({ components: {}, metadata: {} });
    expect(normalizeUsageData([1, 2])).toEqual({ components: {}, metadata: {} });
  });
  it("reads the sample data file: a browser and a code usage, one on no screen", () => {
    const file = path.join(__dirname, "../src/data/usage-data.json");
    const { components } = normalizeUsageData(JSON.parse(readFileSync(file, "utf8")));
    const views = components.mc_kpGXAvqI?.component_views ?? [];
    expect(views.some((v) => v.sourceKind === "browser" && v.source?.startsWith("/"))).toBe(true);
    expect(views.some((v) => v.sourceKind === "code" && v.source === "src/stories/Button.tsx")).toBe(true);
    expect(views.some((v) => v.screenId === null)).toBe(true);
    expect(components.mc_kpGXAvqI?.screens?.length).toBeGreaterThan(0);
  });
});
