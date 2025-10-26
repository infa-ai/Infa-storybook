/**
 * ViewToggle component - Handles switching between "Components" and "Domains" view modes
 */

import React from "react";
import { ViewToggleContainer, ToggleButton } from "./styles";

export type ViewMode = "components" | "domains";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <ViewToggleContainer>
      <ToggleButton
        active={viewMode === "components"}
        onClick={() => onViewModeChange("components")}
      >
        Group by Components
      </ToggleButton>
      <ToggleButton
        active={viewMode === "domains"}
        onClick={() => onViewModeChange("domains")}
      >
        Group by Domains
      </ToggleButton>
    </ViewToggleContainer>
  );
};
