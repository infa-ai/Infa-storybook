/**
 * Utility functions for Panel component
 */

import type { ComponentData, ComponentView, Page } from "../../types";

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
      /\/public_screenshots\/([^\/]+)\//,
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

/**
 * Generates Infa link if IDs are available, otherwise returns original URL
 */
export const generateInfaLink = (
  view: ComponentView,
  boardId: string | null,
  componentViewId: string | null,
): string => {
  const infaLink = boardId && componentViewId
    ? `https://infa.ai/open?board=${boardId}&componentView=${componentViewId}`
    : view.url;

  // Log for verification
  console.log(`[Infa Link Generation]`, {
    title: view.title,
    boardId,
    componentViewId,
    hasScreenshot: !!view.screenshot,
    generatedLink: infaLink,
    isInfaLink: infaLink.startsWith('https://infa.ai/open')
  });

  return infaLink;
};

/**
 * Matches a component view URL to a page based on url_pattern
 * Returns the matching page or null
 */
export const matchUrlToPage = (
  url: string,
  pages: Page[] | undefined,
): Page | null => {
  if (!pages || pages.length === 0) return null;

  // Try exact match first
  const exactMatch = pages.find((page) => page.url_pattern === url);
  if (exactMatch) return exactMatch;

  // Try matching with default_url
  const defaultMatch = pages.find(
    (page) => page.default_url === url || page.default_url === url.replace(/\/$/, '')
  );
  if (defaultMatch) return defaultMatch;

  // Try pattern matching (simple startsWith for now)
  // For dynamic pages, url_pattern might be a pattern like "https://github.com/primer/react/*"
  const patternMatch = pages.find((page) => {
    if (page.is_dynamic && page.url_pattern) {
      const pattern = page.url_pattern.replace(/\*/g, '');
      return url.startsWith(pattern);
    }
    return false;
  });
  if (patternMatch) return patternMatch;

  return null;
};

