/**
 * Utility functions for Panel component
 */

import type { ComponentView, Screen, UsageSourceKind, ViewHealthState } from "../../types";

/**
 * Extracts domain from a URL
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

/**
 * Truncates a URL to a specified maximum length
 */
export const truncateUrl = (url: string, maxLength: number = 60): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
};

/**
 * Formats a URL for display by removing the protocol (http:// or https://)
 */
export const formatUrlForDisplay = (url: string): string => {
  try {
    return url.replace(/^https?:\/\//, '');
  } catch {
    return url;
  }
};

/**
 * Extracts board_id and component_view_id from screenshot URL
 * Example: https://lchwovxxbgcdycaqmftj.supabase.co/storage/v1/object/public/public_screenshots/b_29btSDq0/screenshot-cv_9sdFEp70-251026121401-0@2x.png
 */
export const extractInfaIds = (
  screenshotUrl: string | null | undefined,
): { boardId: string | null; componentViewId: string | null } => {
  if (!screenshotUrl) return { boardId: null, componentViewId: null };

  try {
    // Extract board_id from path: /public_screenshots/{board_id}/
    const boardIdMatch = screenshotUrl.match(
      /\/public_screenshots\/([^/]+)\//,
    );
    const boardId = (boardIdMatch?.[1] || null) as string | null;

    // Extract component_view_id from filename: screenshot-{cv_id}-timestamp.png
    const cvIdMatch = screenshotUrl.match(/screenshot-(cv_[^-]+)/);
    const componentViewId = (cvIdMatch?.[1] || null) as string | null;

    return { boardId, componentViewId };
  } catch {
    return { boardId: null, componentViewId: null };
  }
};

const INFA_ORIGIN = "https://infa.ai";

/**
 * The component's page on the board: `https://infa.ai/b/{board}/components/{mc}`.
 * Null without both ids.
 *
 * @param boardId - The board (`b_…`).
 * @param componentId - The component (`mc_…`).
 * @param origin - The app's origin (a local or preview app); infa.ai by default.
 */
export const componentPageUrl = (
  boardId: string | null | undefined,
  componentId: string | null | undefined,
  origin: string = INFA_ORIGIN,
): string | null =>
  boardId && componentId
    ? `${origin}/b/${encodeURIComponent(boardId)}/components/${encodeURIComponent(componentId)}`
    : null;

/** The origin of an absolute URL, else infa.ai. */
export const originOf = (url: string | null | undefined): string => {
  try {
    if (url) return new URL(url).origin;
  } catch {
    /* not a URL */
  }
  return INFA_ORIGIN;
};

/**
 * Where a view's "open" arrow goes: the component's page on the board when
 * the ids are known (it lists every view, its health and flows), else the
 * page the view was captured on; "" for a usage found in code with no board
 * to open (its `url` is a file, not a page).
 *
 * @param view - The view.
 * @param boardId - Its board, from the data or its screenshot's path.
 * @param componentId - Its component.
 * @param boardUrl - The component's page as the sync wrote it, if it did.
 */
export const generateInfaLink = (
  view: ComponentView,
  boardId: string | null,
  componentId: string | null,
  boardUrl?: string | null,
): string =>
  boardUrl || componentPageUrl(boardId, componentId) || (/^https?:\/\//i.test(view.url) ? view.url : "");

/** The board's components index, for "Tag More Components". */
export const boardComponentsUrl = (
  boardId: string | null | undefined,
  someBoardUrl?: string | null,
): string | null =>
  boardId ? `${originOf(someBoardUrl)}/b/${encodeURIComponent(boardId)}/components` : null;

/**
 * Story file paths as Storybook and the sync write them, compared without a
 * leading `./` and with forward slashes.
 */
export const normalizeStoryPath = (p: string): string =>
  p.replace(/\\/g, "/").replace(/^\.\//, "");

/**
 * The components a story documents: `mcComponentIds` as written, then what
 * `infa storybook sync` mapped the story's file to (its `_metadata.stories`,
 * keyed by the file's path relative to where Storybook runs).
 *
 * @param mcComponentIds - From `parameters.usage`.
 * @param stories - `_metadata.stories` of the data file.
 * @param importPath - The current story's `importPath`.
 */
export const storyComponentIds = (
  mcComponentIds: string[] | undefined,
  stories: Record<string, string[]> | undefined,
  importPath: string | undefined,
): string[] => {
  const ids = [...(mcComponentIds ?? [])];
  if (stories && importPath) {
    const wanted = normalizeStoryPath(importPath);
    for (const [key, mapped] of Object.entries(stories)) {
      if (normalizeStoryPath(key) !== wanted) continue;
      for (const id of mapped) if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
};

/** The default view first; otherwise the order the data has. */
export const sortViewsDefaultFirst = (views: ComponentView[]): ComponentView[] =>
  views
    .map((view, index) => ({ view, index }))
    .sort((a, b) => Number(Boolean(b.view.is_default)) - Number(Boolean(a.view.is_default)) || a.index - b.index)
    .map(({ view }) => view);

/** How the board says each element-health state, and the colour it wears. */
export const HEALTH_COPY: Record<ViewHealthState, { label: string; tone: "positive" | "warning" | "negative" | "neutral" }> = {
  verified: { label: "Verified", tone: "positive" },
  recovered: { label: "Recovered", tone: "positive" },
  stale: { label: "Stale", tone: "warning" },
  broken: { label: "Broken", tone: "negative" },
  removed: { label: "Removed", tone: "negative" },
};

/** How the panel names where a usage was found. */
export const SOURCE_KIND_COPY: Record<UsageSourceKind, { label: string; title: string }> = {
  browser: { label: "Browser", title: "Found in the browser with the Infa Chrome extension" },
  code: { label: "Code", title: "Found in code with the Infa CLI" },
};

/**
 * What a usage card says about where the usage is: for code, the file; for
 * the browser, the page it was captured on, with the XPath as a second,
 * quieter line.
 */
export const viewLocator = (view: ComponentView): { primary: string; secondary: string | null } => {
  if (view.sourceKind === "code") return { primary: view.source ?? view.url, secondary: null };
  const xPath = view.sourceKind === "browser" ? view.source : view.x_path || null;
  const page = view.url ? formatUrlForDisplay(view.url) : "";
  return page ? { primary: page, secondary: xPath } : { primary: xPath ?? "", secondary: null };
};

/** A screen's page on the board: `https://infa.ai/b/{board}/screens/{screen}`. */
export const screenPageUrl = (
  boardId: string | null | undefined,
  screenId: string | null | undefined,
  someBoardUrl?: string | null,
): string | null =>
  boardId && screenId
    ? `${originOf(someBoardUrl)}/b/${encodeURIComponent(boardId)}/screens/${encodeURIComponent(screenId)}`
    : null;

/** The key of the group of usages that sit on no screen. */
export const NO_SCREEN_KEY = "no-screen";
export const NO_SCREEN_TITLE = "Not on a screen yet";

/** A group of a component's usages: one screen (or none), or one domain. */
export interface UsageGroup {
  key: string;
  title: string;
  /** The screen, when the group is one and the data has it. */
  screen: Screen | null;
  screenId: string | null;
  views: ComponentView[];
}

/**
 * A component's usages grouped by the screen they sit on, screens in the
 * order their first usage comes (the default view first), the usages on no
 * screen last, under "Not on a screen yet". A screen the data does not
 * describe is still a group, titled with its id.
 *
 * @param views - The component's views.
 * @param screens - The screens the data describes.
 */
export const groupViewsByScreen = (views: ComponentView[], screens: Screen[] | undefined): UsageGroup[] => {
  const byId = new Map((screens ?? []).map((s) => [s.screenId, s]));
  const groups = new Map<string, UsageGroup>();
  const unplaced: ComponentView[] = [];
  for (const view of views) {
    if (!view.screenId) {
      unplaced.push(view);
      continue;
    }
    let group = groups.get(view.screenId);
    if (!group) {
      const screen = byId.get(view.screenId) ?? null;
      group = { key: view.screenId, title: screen?.title || view.screenId, screen, screenId: view.screenId, views: [] };
      groups.set(view.screenId, group);
    }
    group.views.push(view);
  }
  const out = [...groups.values()];
  if (unplaced.length > 0) {
    out.push({ key: NO_SCREEN_KEY, title: NO_SCREEN_TITLE, screen: null, screenId: null, views: unplaced });
  }
  return out;
};

/**
 * A component's usages grouped by the domain of the page they were captured
 * on; usages found in code together under "Code".
 *
 * @param views - The component's views.
 */
export const groupViewsByDomain = (views: ComponentView[]): UsageGroup[] => {
  const groups = new Map<string, UsageGroup>();
  for (const view of views) {
    const key = view.sourceKind === "code" ? "Code" : extractDomain(view.url) || "Unknown page";
    let group = groups.get(key);
    if (!group) {
      group = { key, title: key, screen: null, screenId: null, views: [] };
      groups.set(key, group);
    }
    group.views.push(view);
  }
  return [...groups.values()];
};
