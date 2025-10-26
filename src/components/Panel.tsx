/**
 * Panel component - Main entry point for the usage panel addon
 * 
 * This component orchestrates the display of component usage data,
 * providing two view modes: grouped by components or grouped by domains.
 */

import React, { memo, useState } from "react";
import { AddonPanel } from "storybook/internal/components";
import { useParameter } from "storybook/manager-api";
import type { UsageParameters, UsageDataMap, ComponentData } from "../types";

// Sub-components
import { ViewToggle, type ViewMode } from "./Panel/ViewToggle";
import { ComponentsView } from "./Panel/ComponentsView";
import { DomainsView } from "./Panel/DomainsView";
import { EmptyState } from "./Panel/EmptyState";

// Styles
import { PanelContent } from "./Panel/styles";

interface PanelProps {
  active: boolean;
}

// Import usage data with fallback to empty object
let usageData: UsageDataMap = {};
try {
  usageData = require("../data/usage-data.json");
} catch (e) {
  console.warn("Usage data not found. Using empty data set.");
}

/**
 * Panel component that displays component usage data
 * 
 * Features:
 * - Toggle between "Components" and "Domains" view modes
 * - Expand/collapse component views
 * - Display screenshots, code snippets, and external links
 * - Empty state with setup instructions
 */
export const Panel: React.FC<PanelProps> = memo(function UsagePanel(props) {
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("components");
  const [expandedComponents, setExpandedComponents] = useState<
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

  // Handler for toggling expanded state of a component
  const toggleExpanded = (componentId: string) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  return (
    <AddonPanel {...props}>
      <PanelContent>
        {hasComponents && components.length > 0 ? (
          <>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />

            {viewMode === "components" ? (
              <ComponentsView
                components={components}
                expandedComponents={expandedComponents}
                onToggleExpanded={toggleExpanded}
              />
            ) : (
              <DomainsView components={components} />
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </PanelContent>
    </AddonPanel>
  );
});
