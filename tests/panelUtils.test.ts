import { describe, expect, it } from "vitest";
import {
  boardComponentsUrl,
  componentPageUrl,
  generateInfaLink,
  normalizeStoryPath,
  sortViewsDefaultFirst,
  storyComponentIds,
} from "../src/components/Panel/utils";
import type { ComponentView } from "../src/types";

const view = (title: string, extra: Partial<ComponentView> = {}): ComponentView => ({
  title,
  url: `https://app.example/${title}`,
  x_path: "",
  screenshot: null,
  code: null,
  is_domain_specific: false,
  page_id: null,
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
