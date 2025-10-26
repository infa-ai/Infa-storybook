/**
 * ComponentViewCard component - Displays a single component view with screenshot, code, and URL
 */

import React from "react";
import type { ComponentView } from "../../types";
import {
  ComponentViewCardWrapper,
  ViewCardTitle,
  Screenshot,
  CodeCapture,
  UrlDisplay,
  ViewInPageButton,
} from "./styles";
import { extractInfaIds, generateInfaLink, truncateUrl } from "./utils";

interface ComponentViewCardProps {
  view: ComponentView;
}

export const ComponentViewCard: React.FC<ComponentViewCardProps> = ({
  view,
}) => {
  // Extract Infa IDs from screenshot URL
  const { boardId, componentViewId } = extractInfaIds(view.screenshot);

  // Generate Infa link if we have the necessary IDs, otherwise use the original URL
  const infaLink = generateInfaLink(view, boardId, componentViewId);

  return (
    <ComponentViewCardWrapper>
      <ViewCardTitle>{view.title}</ViewCardTitle>

      {view.screenshot && (
        <Screenshot src={view.screenshot} alt={view.title} loading="lazy" />
      )}

      {view.code && <CodeCapture>{view.code}</CodeCapture>}

      <UrlDisplay>
        <strong>URL:</strong> {truncateUrl(view.url)}
      </UrlDisplay>

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
