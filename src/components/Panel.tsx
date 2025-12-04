/**
 * Panel component - Main entry point for the usage panel addon
 *
 * This component orchestrates the display of component usage data,
 * grouped by components.
 */

import React, { memo, useState } from "react";
import { AddonPanel } from "storybook/internal/components";
import { useParameter } from "storybook/manager-api";
import type { UsageParameters, UsageDataMap, ComponentData } from "../types";

// Sub-components
import { ComponentsView } from "./Panel/ComponentsView";
import { EmptyState } from "./Panel/EmptyState";
import { Footer } from "./Panel/Footer";
import { SyncModal } from "./Panel/SyncModal";

// Styles
import { PanelContent } from "./Panel/styles";

interface PanelProps {
  active: boolean;
}

// Import usage data with fallback to empty object
let usageData: UsageDataMap = {};
let lastSyncedAt: string | undefined;
try {
  const data = require("../data/usage-data.json");
  // Extract metadata if it exists
  if (data._metadata?.lastSyncedAt) {
    lastSyncedAt = data._metadata.lastSyncedAt;
    // Remove metadata from usageData
    const { _metadata, ...rest } = data;
    usageData = rest;
  } else {
    usageData = data;
  }
} catch (e) {
  console.warn("Usage data not found. Using empty data set.");
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

  // Get mcComponentIds from story parameters
  const params = useParameter<UsageParameters>("usage", { mcComponentIds: [] });
  const mcComponentIds = params.mcComponentIds || [];

  const hasComponents = mcComponentIds.length > 0;

  // Get component data for all IDs - filter out undefined data
  const components = mcComponentIds
    .map((id) => ({ id, data: usageData[id] }))
    .filter(
      (c): c is { id: string; data: ComponentData } => c.data !== undefined,
    );

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

  // Handler for opening Infa board to tag components
  const handleTagComponents = () => {
    if (boardId) {
      window.open(
        `https://infa.ai/open?board=${boardId}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
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
          lastSyncedAt={lastSyncedAt}
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
