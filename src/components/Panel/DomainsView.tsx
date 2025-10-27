/**
 * DomainsView component - Displays components grouped by domain and URL
 */

import React from "react";
import { Badge, SyntaxHighlighter } from "storybook/internal/components";
import type { ComponentData } from "../../types";
import {
  DomainSection,
  DomainHeader,
  PageSection,
  PageUrl,
  ComponentViewCardWrapper,
  ComponentViewsGrid,
  ViewCardTitle,
  ViewInPageButton,
  LabelsContainer,
  Label,
} from "./styles";
import { groupViewsByDomain, extractInfaIds, generateInfaLink } from "./utils";
import ImagePreview from "./ImagePreview";

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
              <PageUrl>
                {url} <Badge status="neutral">{views.length}</Badge>
              </PageUrl>

              <ComponentViewsGrid>
                {views.map((view, idx) => {
                  // Try to get IDs from the data structure first, then fall back to extracting from screenshot URL
                  const extractedIds = extractInfaIds(view.screenshot);
                  const boardId = view.componentBoardId || extractedIds.boardId;
                  const componentViewId =
                    view.id || extractedIds.componentViewId;
                  const infaLink = generateInfaLink(
                    view,
                    boardId,
                    componentViewId,
                  );

                  return (
                    <ComponentViewCardWrapper key={idx}>
                      <ViewCardTitle>{view.title}</ViewCardTitle>

                      <div style={{ marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "12px", color: "#999" }}>
                          a part of{" "}
                        </span>
                        <strong style={{ fontSize: "12px" }}>
                          {view.componentTitle}
                        </strong>
                      </div>

                      {view.componentLabels &&
                        view.componentLabels.length > 0 && (
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

                      {view.screenshot && (
                        <ImagePreview
                          serverImageSources={[{ url: view.screenshot }]}
                          type="component"
                          mode="preview"
                        />
                      )}

                      {view.code && (
                        <div
                          style={{
                            marginTop: "0.75rem",
                            marginBottom: "0.75rem",
                          }}
                        >
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
              </ComponentViewsGrid>
            </PageSection>
          ))}
        </DomainSection>
      ))}
    </>
  );
};
