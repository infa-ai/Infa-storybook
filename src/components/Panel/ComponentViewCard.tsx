/**
 * ComponentViewCard component - Displays a single component view with screenshot, code, and URL
 */

import React from "react";
import { ArrowRightIcon } from "@storybook/icons";
import type { ComponentView } from "../../types";
import {
  ComponentViewCardWrapper,
  ViewCardTitle,
  PageUrl,
  XPathContainer,
  XPathText,
  XPathArrowButton,
} from "./styles";
import { extractInfaIds, generateInfaLink, formatUrlForDisplay } from "./utils";
import ImagePreview from "./ImagePreview";
import { CodePreview } from "./CodePreview";

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
      {view.screenshot && (
        <div style={{ margin: "6px", width: "calc(100% - 12px)" }}>
          <ImagePreview
            serverImageSources={[{ url: view.screenshot }]}
            type="component"
            mode="preview"
          />
        </div>
      )}

      <div
        style={{
          padding: "12px 16px 0px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <PageUrl>{formatUrlForDisplay(view.url)}</PageUrl>
        <ViewCardTitle>{view.title}</ViewCardTitle>
      </div>

      {view.code && (
        <div style={{ margin: "12px 6px 2px", width: "calc(100% - 12px)" }}>
          <CodePreview
            htmlCode={{ selected: view.code }}
            defaultCollapsed={true}
          />
        </div>
      )}

      {view.x_path && (
        <div
          style={{
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingBottom: "12px",
          }}
        >
          <XPathContainer>
            <XPathText>{view.x_path}</XPathText>
            <XPathArrowButton
              href={infaLink}
              target="_blank"
              rel="noopener noreferrer"
              title="View in Page"
            >
              <ArrowRightIcon />
            </XPathArrowButton>
          </XPathContainer>
        </div>
      )}
    </ComponentViewCardWrapper>
  );
};
