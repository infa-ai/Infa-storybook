/**
 * ComponentViewCard component - Displays a single component view with screenshot, code, and URL
 */

import React from "react";
import { SyntaxHighlighter } from "storybook/internal/components";
import type { ComponentView } from "../../types";
import {
  ComponentViewCardWrapper,
  ViewCardTitle,
  UrlDisplay,
  ViewInPageButton,
} from "./styles";
import { extractInfaIds, generateInfaLink, formatUrlForDisplay } from "./utils";
import ImagePreview from "./ImagePreview";

interface ComponentViewCardProps {
  view: ComponentView;
  boardId?: string;
}

export const ComponentViewCard: React.FC<ComponentViewCardProps> = ({
  view,
  boardId: propBoardId,
}) => {
  // Try to get IDs from the data structure first, then fall back to extracting from screenshot URL
  const extractedIds = extractInfaIds(view.screenshot);

  const boardId = propBoardId || extractedIds.boardId;
  const componentViewId = view.id || extractedIds.componentViewId;

  // Generate Infa link if we have the necessary IDs, otherwise use the original URL
  const infaLink = generateInfaLink(view, boardId, componentViewId);

  return (
    <ComponentViewCardWrapper>
      <ViewCardTitle>{view.title}</ViewCardTitle>

      {view.screenshot && (
        <ImagePreview
          serverImageSources={[{ url: view.screenshot }]}
          type="component"
          mode="preview"
        />
      )}

      {view.code && (
        <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
          <SyntaxHighlighter
            language="html"
            copyable={true}
            bordered={true}
            padded={true}
          >
            {view.code}
          </SyntaxHighlighter>
        </div>
      )}

      <div style={{ marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "11px", color: "#999" }}>Found at: </span>
        <UrlDisplay
          href={view.url}
          target="_blank"
          rel="noopener noreferrer"
          title={view.url}
        >
          {formatUrlForDisplay(view.url)}
        </UrlDisplay>
      </div>

      <ViewInPageButton
        href={infaLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        View in Page
      </ViewInPageButton>
    </ComponentViewCardWrapper>
  );
};
