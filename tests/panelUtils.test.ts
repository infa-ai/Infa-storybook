import { describe, expect, it } from "vitest";
import {
  boardComponentsUrl,
  componentPageUrl,
  generateInfaLink,
  groupViewsByDomain,
  groupViewsByScreen,
  NO_SCREEN_KEY,
  normalizeStoryPath,
  screenPageUrl,
  sortViewsDefaultFirst,
  storyComponentIds,
  viewLocator,
} from "../src/components/Panel/utils";
import type { ComponentView, Screen } from "../src/types";

const view = (title: string, extra: Partial<ComponentView> = {}): ComponentView => ({
  title,
  url: `https://app.example/${title}`,
  x_path: "",
  screenshot: null,
  code: null,
  is_domain_specific: false,
  screenId: null,
  source: null,
  sourceKind: null,
  ...extra,
});

describe("links", () => {
  it("opens the component's page on the board, never the extension hand-off", () => {
    expect(componentPageUrl("b_1", "mc_a")).toBe("https://infa.ai/b/b_1/components/mc_a");
    expect(generateInfaLink(view("x"), "b_1", "mc_a")).toBe("https://infa.ai/b/b_1/components/mc_a");
    expect(generateInfaLink(view("x"), "b_1", "mc_a")).not.toContain("/open");
  });
  it("prefers the page the sync wrote (a local app), and falls back to the captured page", () => {
    expect(generateInfaLink(view("x"), "b_1", "mc_a", "http://localhost:3000/b/b_1/components/mc_a")).toBe(
      "http://localhost:3000/b/b_1/components/mc_a",
    );
    expect(generateInfaLink(view("x"), null, "mc_a")).toBe("https://app.example/x");
  });
  it("opens the board's components on that board's app", () => {
    expect(boardComponentsUrl("b_1", "http://localhost:3000/b/b_1/components/mc_a")).toBe(
      "http://localhost:3000/b/b_1/components",
    );
    expect(boardComponentsUrl("b_1")).toBe("https://infa.ai/b/b_1/components");
    expect(boardComponentsUrl(undefined)).toBeNull();
  });
});

describe("storyComponentIds", () => {
  const stories = { "src/Button.stories.tsx": ["mc_b", "mc_a"], "src/Card.stories.tsx": ["mc_c"] };
  it("adds what the sync mapped the story's file to, after the hand-typed ids", () => {
    expect(storyComponentIds(["mc_a"], stories, "./src/Button.stories.tsx")).toEqual(["mc_a", "mc_b"]);
    expect(storyComponentIds(undefined, stories, "./src/Card.stories.tsx")).toEqual(["mc_c"]);
  });
  it("keeps the hand-typed ids alone without a map or a match", () => {
    expect(storyComponentIds(["mc_x"], undefined, "./src/Button.stories.tsx")).toEqual(["mc_x"]);
    expect(storyComponentIds([], stories, "./src/Other.stories.tsx")).toEqual([]);
  });
  it("compares paths without ./ and with forward slashes", () => {
    expect(normalizeStoryPath("./src\\a\\B.stories.tsx")).toBe("src/a/B.stories.tsx");
  });
});

describe("sortViewsDefaultFirst", () => {
  it("moves the default view first and keeps the rest in order", () => {
    const views = [view("a"), view("b"), view("c", { is_default: true }), view("d")];
    expect(sortViewsDefaultFirst(views).map((v) => v.title)).toEqual(["c", "a", "b", "d"]);
  });
  it("changes nothing when no view is the default (the PAT script's data)", () => {
    expect(sortViewsDefaultFirst([view("a"), view("b")]).map((v) => v.title)).toEqual(["a", "b"]);
  });
});

const browser = (title: string, screenId: string | null, url = `https://app.example/${title}`) =>
  view(title, { url, x_path: `//main/${title}`, source: `//main/${title}`, sourceKind: "browser", screenId });
const code = (title: string, screenId: string | null) =>
  view(title, { url: `src/${title}.tsx`, source: `src/${title}.tsx`, sourceKind: "code", screenId });
const screen = (screenId: string, title: string): Screen => ({
  screenId,
  title,
  url_pattern: `https://app.example/${title}`,
  default_url: null,
  is_dynamic: false,
  screenshot: null,
  component_view_count: null,
});

describe("groupViewsByScreen", () => {
  it("groups by screen in the order the usages come, browser and code together, no screen last", () => {
    const views = [browser("a", "s_2"), browser("b", null), code("c", "s_1"), code("d", "s_2"), browser("e", null)];
    const groups = groupViewsByScreen(views, [screen("s_1", "Home"), screen("s_2", "Checkout")]);
    expect(groups.map((g) => [g.key, g.title, g.views.map((v) => v.title)])).toEqual([
      ["s_2", "Checkout", ["a", "d"]],
      ["s_1", "Home", ["c"]],
      [NO_SCREEN_KEY, "Not on a screen yet", ["b", "e"]],
    ]);
    expect(groups[0]?.screen?.title).toBe("Checkout");
    expect(groups[2]?.screen).toBeNull();
    expect(groups[2]?.screenId).toBeNull();
  });
  it("titles a screen the data does not describe with its id", () => {
    const groups = groupViewsByScreen([browser("a", "s_9")], undefined);
    expect(groups).toEqual([expect.objectContaining({ key: "s_9", title: "s_9", screen: null, screenId: "s_9" })]);
  });
  it("puts everything under one group when no usage is on a screen, and nothing for no usages", () => {
    expect(groupViewsByScreen([browser("a", null), code("b", null)], []).map((g) => g.key)).toEqual([NO_SCREEN_KEY]);
    expect(groupViewsByScreen([], [screen("s_1", "Home")])).toEqual([]);
  });
});

describe("groupViewsByDomain", () => {
  it("groups browser usages by domain and code usages under Code", () => {
    const views = [browser("a", null, "https://one.example/x"), code("b", null), browser("c", null, "https://two.example/")];
    expect(groupViewsByDomain(views).map((g) => [g.title, g.views.length])).toEqual([
      ["one.example", 1],
      ["Code", 1],
      ["two.example", 1],
    ]);
  });
});

describe("viewLocator", () => {
  it("shows the file for a usage found in code", () => {
    expect(viewLocator(code("Button", "s_1"))).toEqual({ primary: "src/Button.tsx", secondary: null });
  });
  it("shows the page for a usage found in the browser, the XPath second", () => {
    expect(viewLocator(browser("a", null, "https://app.example/cart"))).toEqual({
      primary: "app.example/cart",
      secondary: "//main/a",
    });
  });
  it("falls back to the XPath when the page is unknown", () => {
    expect(viewLocator(browser("a", null, ""))).toEqual({ primary: "//main/a", secondary: null });
  });
});

describe("links for usages", () => {
  it("opens a screen on the board's own app", () => {
    expect(screenPageUrl("b_1", "s_1")).toBe("https://infa.ai/b/b_1/screens/s_1");
    expect(screenPageUrl("b_1", "s_1", "http://localhost:3000/b/b_1/components/mc_a")).toBe(
      "http://localhost:3000/b/b_1/screens/s_1",
    );
    expect(screenPageUrl("b_1", null)).toBeNull();
  });
  it("never links a code usage to its file path as if it were a page", () => {
    expect(generateInfaLink(code("Button", null), null, null)).toBe("");
    expect(generateInfaLink(code("Button", null), "b_1", "mc_a")).toBe("https://infa.ai/b/b_1/components/mc_a");
  });
});
