import { afterAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
// The PAT fallback (`npx infa-usage-fetch`); importing it runs nothing.
import {
  cleanApiKey,
  explainApiError,
  findComponentIds,
  toComponentData,
} from "../scripts/infa-integration.js";

const dir = mkdtempSync(path.join(tmpdir(), "infa-usage-fetch-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function put(rel: string, text: string) {
  const file = path.join(dir, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
}

describe("cleanApiKey", () => {
  it("drops whitespace and quotes a paste brings along", () => {
    expect(cleanApiKey('  "abc123"\n')).toBe("abc123");
    expect(cleanApiKey("'abc123'")).toBe("abc123");
    expect(cleanApiKey(undefined)).toBe("");
  });
});

describe("findComponentIds", () => {
  it("collects every mcComponentIds in story files, skipping dependencies and builds", () => {
    put("src/Button.stories.tsx", `parameters: { usage: { mcComponentIds: ["mc_a", 'mc_b'] } }`);
    put("src/deep/Card.stories.mdx", "mcComponentIds: [`mc_c`, \"mc_a\"]");
    put("src/Other.tsx", `mcComponentIds: ["mc_not_a_story"]`);
    put("node_modules/x/X.stories.ts", `mcComponentIds: ["mc_dep"]`);
    put("storybook-static/Y.stories.js", `mcComponentIds: ["mc_built"]`);
    expect(findComponentIds(dir).sort()).toEqual(["mc_a", "mc_b", "mc_c"]);
  });
});

describe("explainApiError", () => {
  it("says how to get a working key for an unknown one", () => {
    const lines = explainApiError(400, JSON.stringify({ message: "Invalid API key or API key not found" }));
    expect(lines.join("\n")).toContain("profile?tab=integrations");
  });
  it("names the header on a 401", () => {
    expect(explainApiError(401, "nope").join("\n")).toContain("x-api-key");
  });
  it("passes anything else through", () => {
    expect(explainApiError(500, JSON.stringify({ message: "boom" }))).toEqual(["The Infa API answered 500: boom"]);
    expect(explainApiError(502, "<html>bad gateway</html>")).toEqual(["The Infa API answered 502: <html>bad gateway</html>"]);
  });
});

describe("toComponentData", () => {
  it("maps the API's screens and each view's screen, source and kind", () => {
    const out = toComponentData({
      id: "mc_a",
      title: "Button",
      board_id: "b_1",
      component_views: [{ title: "v", x_path: "//main/button", url: "https://app.example/", screen_id: "s_1" }],
      screens: [{ screen_id: "s_1", title: "Home" }],
    });
    expect(out.screens).toEqual([{ title: "Home", screenId: "s_1" }]);
    expect(out.component_views[0]).toEqual({
      title: "v",
      x_path: "//main/button",
      url: "https://app.example/",
      screenId: "s_1",
      source: "//main/button",
      sourceKind: "browser",
    });
    expect(out.board_id).toBe("b_1");
  });
  it("still reads the old pages shape, and fills what is missing", () => {
    const out = toComponentData({ pages: [{ page_id: "p_1" }], component_views: [{ page_id: "p_1" }] });
    expect(out).toMatchObject({
      title: "Untitled Component",
      description: null,
      query: null,
      external_links: [],
      labels: [],
      board_id: null,
    });
    expect(out.screens[0].screenId).toBe("p_1");
    expect(out.component_views[0]).toEqual({ screenId: "p_1", source: null, sourceKind: null });
  });
});
