/**
 * ComponentHeader component - Displays component title, labels, description, and external links
 */

import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@storybook/icons";
import type { ComponentData } from "../../types";
import {
  ComponentHeaderWrapper,
  ComponentTitle,
  ComponentDescription,
  LabelsContainer,
  Label,
  ExternalLinksContainer,
  ExternalLink,
  ExternalLinkIcon,
  ViewMoreTextButton,
  ComponentTitleRow,
  CollapseButton,
} from "./styles";

interface ComponentHeaderProps {
  title: string;
  description: string | null;
  labels: ComponentData["labels"];
  externalLinks: ComponentData["external_links"];
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const MAX_DESCRIPTION_LENGTH = 200;

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  title,
  description,
  labels,
  externalLinks,
  isCollapsed = false,
  onToggleCollapsed,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Check if description needs truncation
  const needsTruncation =
    description && description.length > MAX_DESCRIPTION_LENGTH;
  const displayedDescription =
    needsTruncation && !isDescriptionExpanded
      ? description.substring(0, MAX_DESCRIPTION_LENGTH) + "..."
      : description;

  return (
    <ComponentHeaderWrapper>
      <ComponentTitleRow>
        <ComponentTitle>{title}</ComponentTitle>
        {onToggleCollapsed && (
          <CollapseButton
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? "Expand component" : "Collapse component"}
            title={isCollapsed ? "Expand component" : "Collapse component"}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
          </CollapseButton>
        )}
      </ComponentTitleRow>

      {/* Everything below is hidden when collapsed - only show when expanded */}
      {!isCollapsed && (
        <>
          {labels && labels.length > 0 && (
            <LabelsContainer>
              {labels.map((label, idx) => (
                <Label
                  key={idx}
                  bgColor={label.color}
                  title={label.description || undefined}
                >
                  {label.title}
                </Label>
              ))}
            </LabelsContainer>
          )}

          {description && (
            <>
              <ComponentDescription>
                {displayedDescription}
              </ComponentDescription>
              {needsTruncation && (
                <ViewMoreTextButton
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                >
                  {isDescriptionExpanded ? "View less" : "View more"}
                </ViewMoreTextButton>
              )}
            </>
          )}

          {externalLinks && externalLinks.length > 0 && (
            <ExternalLinksContainer>
              {externalLinks.map((link, idx) => (
                <ExternalLink
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.title}
                  <ExternalLinkIcon>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.5 1.5L1.5 10.5M10.5 1.5H4.5M10.5 1.5V7.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </ExternalLinkIcon>
                </ExternalLink>
              ))}
            </ExternalLinksContainer>
          )}
        </>
      )}
    </ComponentHeaderWrapper>
  );
};
