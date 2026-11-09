import { afterAll, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { managerHead, readUsageData, resolveDataFile, usageDataScript } from "../src/preset";
import { DATA_GLOBAL, DEFAULT_DATA_FILE } from "../src/constants";

const dir = mkdtempSync(path.join(tmpdir(), "infa-usage-preset-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Runs the script the preset writes and returns what it set. */
function runScript(html: string): unknown {
  const body = /<script>([\s\S]*)<\/script>/.exec(html)?.[1];
  const window: Record<string, unknown> = {};
  new Function("window", body!)(window);
  return window[DATA_GLOBAL];
}

describe("resolveDataFile", () => {
  it("defaults to src/data/usage-data.json in the folder Storybook runs in", () => {
    expect(resolveDataFile({}, "/repo")).toBe(path.resolve("/repo", DEFAULT_DATA_FILE));
  });
  it("takes a relative dataFile against that folder, and an absolute one as is", () => {
    expect(resolveDataFile({ dataFile: "data/u.json" }, "/repo")).toBe(path.resolve("/repo", "data/u.json"));
    expect(resolveDataFile({ dataFile: "/abs/u.json" }, "/repo")).toBe("/abs/u.json");
  });
});

describe("readUsageData", () => {
  it("reads the file", () => {
    const file = path.join(dir, "ok.json");
    writeFileSync(file, JSON.stringify({ mc_a: { title: "A" } }));
    expect(readUsageData(file)).toEqual({ mc_a: { title: "A" } });
  });
  it("is null, with a hint naming the sync, when there is no file", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(readUsageData(path.join(dir, "missing.json"))).toBeNull();
    expect(warn.mock.calls[0]?.[0]).toContain("npx infa storybook sync");
    warn.mockRestore();
  });
  it("is null when the file does not parse", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const file = path.join(dir, "bad.json");
    writeFileSync(file, "{ not json");
    expect(readUsageData(file)).toBeNull();
    warn.mockRestore();
  });
});

describe("usageDataScript", () => {
  it("cannot be closed early by the data, and keeps it intact", () => {
    const data = { mc_a: { title: "</script><script>alert(1)</script>", description: "a b c" } };
    const html = usageDataScript(data);
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).not.toContain(" ");
    expect(runScript(html)).toEqual(data);
  });
  it("sets null when there is no data", () => {
    expect(runScript(usageDataScript(undefined))).toBeNull();
  });
});

describe("managerHead", () => {
  it("appends the data to the head it was given", () => {
    const file = path.join(dir, "head.json");
    writeFileSync(file, JSON.stringify({ mc_b: { title: "B" } }));
    const head = managerHead("<meta name=x>", { dataFile: file });
    expect(head.startsWith("<meta name=x>\n")).toBe(true);
    expect(runScript(head)).toEqual({ mc_b: { title: "B" } });
  });
});
