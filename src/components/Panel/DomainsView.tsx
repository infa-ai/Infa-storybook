/**
 * DomainsView component - Displays components grouped by domain and URL
 */

import React from "react";
import type { ComponentData } from "../../types";
import {
  DomainSection,
  DomainHeader,
  PageSection,
  PageUrl,
  ComponentViewCardWrapper,
  ViewCardTitle,
  Screenshot,
  CodeCapture,
  ViewInPageButton,
  LabelsContainer,
  Label,
} from "./styles";
import { groupViewsByDomain, extractInfaIds, generateInfaLink } from "./utils";

interface DomainsViewProps {
  components: Array<{ id: string; data: ComponentData }>;
}

export const DomainsView: React.FC<DomainsViewProps> = ({ components }) => {
  const groupedViews = groupViewsByDomain(components);

  return (
    <>
      {Object.entries(groupedViews).map(([domain, pages]) => (
        <DomainSection key={domain}>
          <DomainHeader>{domain}</DomainHeader>

          {Object.entries(pages).map(([url, views]) => (
            <PageSection key={url}>
              <PageUrl>{url}</PageUrl>

              {views.map((view, idx) => {
                // Extract Infa IDs from screenshot URL
                const { boardId, componentViewId } = extractInfaIds(
                  view.screenshot,
                );
                const infaLink = generateInfaLink(view, boardId, componentViewId);

                return (
                  <ComponentViewCardWrapper key={idx}>
                    <ViewCardTitle>{view.componentTitle}</ViewCardTitle>

                    {view.componentLabels && view.componentLabels.length > 0 && (
                      <LabelsContainer>
                        {view.componentLabels.map((label, labelIdx) => (
                          <Label
                            key={labelIdx}
                            bgColor={label.color}
                            title={label.description || undefined}
                          >
                            {label.title}
                          </Label>
                        ))}
                      </LabelsContainer>
                    )}

                    <div style={{ marginTop: "0.75rem" }}>
                      <strong style={{ fontSize: "12px" }}>
                        Component View:
                      </strong>{" "}
                      <span style={{ fontSize: "12px" }}>{view.title}</span>
                    </div>

                    {view.screenshot && (
                      <Screenshot
                        src={view.screenshot}
                        alt={view.title}
                        loading="lazy"
                        style={{ marginTop: "0.75rem" }}
                      />
                    )}

                    {view.code && <CodeCapture>{view.code}</CodeCapture>}

                    <ViewInPageButton
                      href={infaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View in Page
                    </ViewInPageButton>
                  </ComponentViewCardWrapper>
                );
              })}
            </PageSection>
          ))}
        </DomainSection>
      ))}
    </>
  );
};
