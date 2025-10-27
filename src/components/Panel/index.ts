/**
 * Panel sub-components and utilities
 * 
 * This module exports all the sub-components and utilities used by the Panel component.
 * Each sub-component has a clear, single responsibility:
 * 
 * - ViewToggle: Toggle between view modes (components/domains) and action buttons
 * - ComponentHeader: Display component metadata (title, labels, description, links)
 * - ComponentViewCard: Display individual component view with screenshot and code
 * - ComponentsView: Group and display views by component
 * - DomainsView: Group and display views by domain
 * - EmptyState: Show instructions when no data is available
 * - Footer: Display "Powered by Infa" with link to documentation
 * - SyncModal: Modal dialog with instructions for synchronizing usage data
 * 
 * Utilities:
 * - extractDomain: Extract domain from URL
 * - truncateUrl: Shorten long URLs
 * - extractInfaIds: Parse Infa IDs from screenshot URLs
 * - generateInfaLink: Create deep links to Infa
 * - groupViewsByDomain: Organize views by domain and URL
 */

export { ViewToggle, type ViewMode } from "./ViewToggle";
export { ComponentHeader } from "./ComponentHeader";
export { ComponentViewCard } from "./ComponentViewCard";
export { ComponentsView } from "./ComponentsView";
export { DomainsView } from "./DomainsView";
export { EmptyState } from "./EmptyState";
export { Footer } from "./Footer";
export { SyncModal } from "./SyncModal";

export {
  extractDomain,
  truncateUrl,
  extractInfaIds,
  generateInfaLink,
  groupViewsByDomain,
  type GroupedView,
} from "./utils";

export * from "./styles";
