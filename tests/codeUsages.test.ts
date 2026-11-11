/**
 * Code usages in the Usage tab: what `infa storybook sync` writes as
 * `code_usages` (every place the code renders the component), read
 * tolerantly, grouped by where each call site is, and linked to its line.
 */
import { describe, expect, it } from "vitest";
import { normalizeCodeUsages, normalizeComponent, normalizeUsageData } from "../src/usageData";
import {
  codeSiteFile,
  codeSiteUrl,
  describePropUses,
  groupCallSites,
  NO_ROUTE_KEY,
} from "../src/components/Panel/utils";
import type { CodeCallSite, CodeRoot, Screen } from "../src/types";

const site = (file: string, routes: CodeCallSite["routes"] = [], extra: Partial<CodeCallSite> = {}): CodeCallSite => ({
  file,
  root: 0,
  line: 10,
  column: 3,
  kind: "jsx",
  element: "<Button />",
  within: null,
  props: [],
  routes,
  ...extra,
});
const route = (path: string, screenId: string | null = null, kind: "page" | "layout" = "page") => ({
  path,
  kind,
  file: "src/app/x/page.tsx",
  root: 0,
  screenId,
  via: [],
});

describe("normalizeCodeUsages", () => {
  it("reads the sync's shape, and drops a site with no file or line", () => {
    const code = normalizeCodeUsages({
      file: "src/components/Button.tsx",
      exportName: "Button",
      total: 3,
      files: 2,
      sites: [
        { file: "src/app/checkout/page.tsx", root: 0, line: 4, column: 7, kind: "jsx", element: '<Button variant="primary" />', within: "Page",
          props: [{ name: "variant", value: "primary" }, { name: "disabled" }],
          routes: [{ path: "/checkout", kind: "page", file: "src/app/checkout/page.tsx", root: 0, screenId: "s_checkout", via: [] }] },
        { file: "src/Modal.tsx", line: 2, kind: "lazy", through: "LazyButton", moreRoutes: 0 },
        { file: "", line: 1 },
        { file: "src/x.tsx", line: 0 },
      ],
      props: [{ name: "variant", uses: 1, values: [{ value: "primary", count: 1 }, { value: 5 }] }],
    })!;
    expect(code.total).toBe(3);
    expect(code.sites).toHaveLength(2);
    expect(code.sites[0]).toMatchObject({ within: "Page", props: [{ name: "variant", value: "primary" }, { name: "disabled" }] });
    expect(code.sites[0]!.routes[0]).toEqual({ path: "/checkout", kind: "page", file: "src/app/checkout/page.tsx", root: 0, screenId: "s_checkout", via: [] });
    expect(code.sites[1]).toMatchObject({ kind: "lazy", through: "LazyButton", column: 1, routes: [] });
    expect(code.sites[1]!.moreRoutes).toBeUndefined();
    expect(code.props).toEqual([{ name: "variant", uses: 1, values: [{ value: "primary", count: 1 }] }]);
  });

  it("is absent when the file has none, and kept on the component when it does", () => {
    expect(normalizeCodeUsages(undefined)).toBeUndefined();
    expect(normalizeComponent({ title: "Button" }).code_usages).toBeUndefined();
    expect(normalizeComponent({ title: "Button", code_usages: { total: 0, sites: [] } }).code_usages).toMatchObject({ total: 0, sites: [] });
  });

  it("reads codeRoots from _metadata", () => {
    const { metadata } = normalizeUsageData({
      _metadata: { codeRoots: [{ name: ".", repository: { url: "https://github.com/acme/ui", branch: "main" } }, { name: "shop", repository: null }] },
    });
    expect(metadata.codeRoots).toEqual([
      { name: ".", repository: { url: "https://github.com/acme/ui", branch: "main" } },
      { name: "shop", repository: null },
    ]);
  });
});

describe("groupCallSites", () => {
  const screens: Screen[] = [
    { screenId: "s_checkout", title: "Checkout", url_pattern: "/checkout", default_url: null, is_dynamic: false, screenshot: null, component_view_count: null },
  ];

  it("puts screens first (most sites first), then routes by path, then the unrouted", () => {
    const groups = groupCallSites(
      [
        site("a.tsx", [route("/settings/*", null, "layout")]),
        site("b.tsx", [route("/checkout", "s_checkout")]),
        site("c.tsx"),
        site("d.tsx", [route("/admin")]),
        site("e.tsx", [route("/cart"), route("/checkout", "s_checkout")]),
      ],
      screens,
    );
    expect(groups.map((g) => [g.kind, g.title, g.sites.map((s) => s.file)])).toEqual([
      ["screen", "Checkout", ["b.tsx", "e.tsx"]],
      ["route", "/admin", ["d.tsx"]],
      ["route", "/settings/*", ["a.tsx"]],
      ["none", "Not on a route", ["c.tsx"]],
    ]);
    expect(groups[3]!.key).toBe(NO_ROUTE_KEY);
  });

  it("titles a screen the data does not describe with its route", () => {
    expect(groupCallSites([site("a.tsx", [route("/orders/{id}", "s_orders")])], [])[0]).toMatchObject({ title: "/orders/{id}", screenId: "s_orders" });
  });
});

describe("links and labels", () => {
  const roots: CodeRoot[] = [
    { name: ".", repository: { url: "https://github.com/acme/ui.git", branch: "main" } },
    { name: "shop", repository: { url: "https://gitlab.com/acme/shop", branch: "release/1" } },
    { name: "local", repository: null },
  ];

  it("links a call site to its line on GitHub or GitLab, and nothing without a remote", () => {
    expect(codeSiteUrl({ file: "src/app/page.tsx", root: 0, line: 4 }, roots)).toBe("https://github.com/acme/ui/blob/main/src/app/page.tsx#L4");
    expect(codeSiteUrl({ file: "pages/[id].tsx", root: 1, line: 9 }, roots)).toBe("https://gitlab.com/acme/shop/-/blob/release/1/pages/%5Bid%5D.tsx#L9");
    expect(codeSiteUrl({ file: "a.tsx", root: 2, line: 1 }, roots)).toBeNull();
    expect(codeSiteUrl({ file: "a.tsx", root: 0, line: 1 }, undefined)).toBeNull();
  });

  it("prefixes another repo's files with its name", () => {
    expect(codeSiteFile({ file: "src/a.tsx", root: 0 }, roots)).toBe("src/a.tsx");
    expect(codeSiteFile({ file: "pages/index.tsx", root: 1 }, roots)).toBe("shop/pages/index.tsx");
  });

  it("says how the props are passed", () => {
    expect(describePropUses([
      { name: "variant", uses: 5, values: [{ value: "primary", count: 3 }, { value: "danger", count: 2 }] },
      { name: "onClick", uses: 4, values: [] },
    ])).toEqual(["variant: primary ×3, danger ×2", "onClick ×4"]);
    // Free text, every value different: how often, not the values.
    const label = { name: "label", uses: 6, values: ["a", "b", "c", "d", "e", "f"].map((value) => ({ value, count: 1 })) };
    expect(describePropUses([label])).toEqual(["label ×6"]);
    expect(describePropUses([{ ...label, values: label.values.slice(0, 4), uses: 4 }])).toEqual(["label: a ×1, b ×1, c ×1, d ×1"]);
  });
});
