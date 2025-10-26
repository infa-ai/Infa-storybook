/**
 * ComponentHeader component - Displays component title, labels, description, and external links
 */

import React from "react";
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
} from "./styles";

interface ComponentHeaderProps {
  title: string;
  description: string | null;
  labels: ComponentData["labels"];
  externalLinks: ComponentData["external_links"];
}

export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  title,
  description,
  labels,
  externalLinks,
}) => {
  return (
    <ComponentHeaderWrapper>
      <ComponentTitle>{title}</ComponentTitle>

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

      {description && <ComponentDescription>{description}</ComponentDescription>}

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
    </ComponentHeaderWrapper>
  );
};
