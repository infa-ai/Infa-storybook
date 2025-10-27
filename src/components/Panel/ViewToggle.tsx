/**
 * ViewToggle component - Handles switching between "Components" and "Domains" view modes
 */

import React from "react";
import {
  ViewToggleContainer,
  SegmentedControl,
  ToggleButton,
  ActionButton,
  ButtonGroup,
} from "./styles";

export type ViewMode = "components" | "domains";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  boardId?: string | null;
  onTagClick?: () => void;
  onSyncClick?: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  boardId,
  onTagClick,
  onSyncClick,
}) => {
  const handleTagComponents = () => {
    if (boardId) {
      window.open(
        `https://infa.ai/open?board=${boardId}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
    onTagClick?.();
  };

  return (
    <ViewToggleContainer>
      <SegmentedControl role="tablist" aria-orientation="horizontal">
        <ToggleButton
          role="tab"
          aria-selected={viewMode === "components"}
          active={viewMode === "components"}
          onClick={() => onViewModeChange("components")}
        >
          Group by Components
        </ToggleButton>
        <ToggleButton
          role="tab"
          aria-selected={viewMode === "domains"}
          active={viewMode === "domains"}
          onClick={() => onViewModeChange("domains")}
        >
          Group by Domains
        </ToggleButton>
      </SegmentedControl>

      <ButtonGroup>
        <ActionButton
          variant="primary"
          onClick={handleTagComponents}
          disabled={!boardId}
          title={
            !boardId
              ? "No board ID available"
              : "Open Infa board to tag components"
          }
        >
          Tag Components
        </ActionButton>
        <ActionButton variant="secondary" onClick={onSyncClick}>
          Synchronize
        </ActionButton>
      </ButtonGroup>
    </ViewToggleContainer>
  );
};
