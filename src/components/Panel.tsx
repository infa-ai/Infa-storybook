/**
 * Panel component - Main entry point for the usage panel addon
 *
 * This component orchestrates the display of component usage data,
 * grouped by components.
 */

import React, { memo, useState } from "react";
import { AddonPanel } from "storybook/internal/components";
import { useParameter, useStorybookApi, useStorybookState } from "storybook/manager-api";
import type { UsageParameters, UsageDataMap, ComponentData, UsageMetadata } from "../types";
import { DATA_GLOBAL } from "../constants";

// Sub-components
import { ComponentsView } from "./Panel/ComponentsView";
import { EmptyState } from "./Panel/EmptyState";
import { Footer } from "./Panel/Footer";
import { SyncModal } from "./Panel/SyncModal";

// Styles
import { PanelContent } from "./Panel/styles";
import { boardComponentsUrl, sortViewsDefaultFirst, storyComponentIds } from "./Panel/utils";

interface PanelProps {
  active: boolean;
}

// The project's usage data, put into the manager page by the preset
// (src/preset.ts) from the file `infa-usage-fetch` wrote. It used to be
// imported from this package's own src/data, which bundled the addon's demo
// data into the published build: a project never saw its own components.
let usageData: UsageDataMap = {};
let metadata: UsageMetadata = {};
const injected = (globalThis as Record<string, unknown>)[DATA_GLOBAL];
if (injected && typeof injected === "object") {
  const { _metadata, ...rest } = injected as UsageDataMap & {
    _metadata?: UsageMetadata;
  };
  metadata = _metadata ?? {};
  usageData = rest as UsageDataMap;
} else {
  console.warn(
    "[storybook-infa-usage] No usage data. Run `npx infa storybook sync` (or `npx infa-usage-fetch`), then restart Storybook.",
  );
}

/**
 * Panel component that displays component usage data
 *
 * Features:
 * - Expand/collapse component views
 * - Display screenshots, code snippets, and external links
 * - Empty state with setup instructions
 */
export const Panel: React.FC<PanelProps> = memo(function UsagePanel(props) {
  // State management
  const [expandedComponents, setExpandedComponents] = useState<
    Record<string, boolean>
  >({});
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Initialize all components as open (not collapsed) by default
  const [collapsedComponents, setCollapsedComponents] = useState<
    Record<string, boolean>
  >({});

  // The story's components: `parameters.usage.mcComponentIds` as written,
  // plus what `infa storybook sync` mapped this story's file to.
  const params = useParameter<UsageParameters>("usage", { mcComponentIds: [] });
  const api = useStorybookApi();
  const { storyId, refId } = useStorybookState();
  const entry = storyId ? (api.getData(storyId, refId) as { importPath?: string } | undefined) : undefined;
  const mcComponentIds = storyComponentIds(params?.mcComponentIds, metadata.stories, entry?.importPath);

  const hasComponents = mcComponentIds.length > 0;

  // Get component data for all IDs - filter out undefined data
  const components = mcComponentIds
    .map((id) => ({ id, data: usageData[id] }))
    .filter(
      (c): c is { id: string; data: ComponentData } => c.data !== undefined,
    )
    .map(({ id, data }) => ({
      id,
      data: { ...data, component_views: sortViewsDefaultFirst(data.component_views ?? []) },
    }));

  // Extract board_id from first component that has one
  const boardId = components.find((c) => c.data.board_id)?.data.board_id;

  // Handler for toggling expanded state of a component
  const toggleExpanded = (componentId: string) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  // Handler for toggling collapsed state of a component
  const toggleCollapsed = (componentId: string) => {
    setCollapsedComponents((prev) => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  // Opens the board's components, where views are added and tagged.
  const handleTagComponents = () => {
    const url = boardComponentsUrl(boardId, components.find((c) => c.data.board_url)?.data.board_url);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AddonPanel {...props}>
      <PanelContent>
        {hasComponents && components.length > 0 ? (
          <ComponentsView
            components={components}
            expandedComponents={expandedComponents}
            onToggleExpanded={toggleExpanded}
            collapsedComponents={collapsedComponents}
            onToggleCollapsed={toggleCollapsed}
            boardId={boardId}
            onTagComponents={handleTagComponents}
          />
        ) : (
          <EmptyState />
        )}
        <Footer
          lastSyncedAt={metadata.lastSyncedAt}
          onSyncClick={() => setIsSyncModalOpen(true)}
        />

        <SyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
        />
      </PanelContent>
    </AddonPanel>
  );
});
