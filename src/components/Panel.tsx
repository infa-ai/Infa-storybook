import React, { memo, useState } from "react";
import { AddonPanel } from "storybook/internal/components";
import { Placeholder } from "storybook/internal/components";
import { useParameter } from "storybook/manager-api";
import { styled, useTheme } from "storybook/theming";

import type {
  UsageParameters,
  UsageDataMap,
  ComponentView,
  ComponentData,
} from "../types";

interface PanelProps {
  active: boolean;
}

type ViewMode = "components" | "domains";

// Utility Functions
const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

const truncateUrl = (url: string, maxLength: number = 60): string => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + "...";
};

// Extract board_id and component_view_id from screenshot URL
// Example: https://lchwovxxbgcdycaqmftj.supabase.co/storage/v1/object/public/public_screenshots/b_29btSDq0/screenshot-cv_9sdFEp70-251026121401-0@2x.png
const extractInfaIds = (
  screenshotUrl: string | null | undefined,
): { boardId: string | null; componentViewId: string | null } => {
  if (!screenshotUrl) return { boardId: null, componentViewId: null };

  try {
    // Extract board_id from path: /public_screenshots/{board_id}/
    const boardIdMatch = screenshotUrl.match(
      /\/public_screenshots\/([^\/]+)\//,
    );
    const boardId = (boardIdMatch?.[1] || null) as string | null;

    // Extract component_view_id from filename: screenshot-{cv_id}-timestamp.png
    const cvIdMatch = screenshotUrl.match(/screenshot-(cv_[^-]+)/);
    const componentViewId = (cvIdMatch?.[1] || null) as string | null;

    return { boardId, componentViewId };
  } catch {
    return { boardId: null, componentViewId: null };
  }
};

interface GroupedView extends ComponentView {
  componentId: string;
  componentTitle: string;
  componentLabels: ComponentData["labels"];
}

const groupViewsByDomain = (
  components: Array<{ id: string; data: ComponentData }>,
): Record<string, Record<string, GroupedView[]>> => {
  const grouped: Record<string, Record<string, GroupedView[]>> = {};

  components.forEach(({ id, data }) => {
    data.component_views.forEach((view) => {
      const domain = extractDomain(view.url);
      const url = view.url;

      if (!grouped[domain]) {
        grouped[domain] = {};
      }
      if (!grouped[domain][url]) {
        grouped[domain][url] = [];
      }

      grouped[domain][url].push({
        ...view,
        componentId: id,
        componentTitle: data.title,
        componentLabels: data.labels,
      });
    });
  });

  return grouped;
};

// Styled Components
const PanelContent = styled.div(({ theme }) => ({
  padding: "1.5rem",
  background: theme.background.content,
  minHeight: "200px",
}));

const ViewToggleContainer = styled.div(({ theme }) => ({
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1.5rem",
  borderBottom: `1px solid ${theme.color.border}`,
  paddingBottom: "0.5rem",
}));

const ToggleButton = styled.button<{ active: boolean }>(
  ({ theme, active }) => ({
    padding: "0.5rem 1rem",
    border: "none",
    background: active ? theme.color.secondary : "transparent",
    color: active ? "#fff" : theme.color.defaultText,
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      background: active ? theme.color.secondary : theme.background.hoverable,
    },
  }),
);

const ComponentSection = styled.div({
  marginBottom: "2rem",
});

const ComponentHeader = styled.div(({ theme }) => ({
  marginBottom: "1rem",
  paddingBottom: "1rem",
  borderBottom: `1px solid ${theme.color.border}`,
}));

const ComponentTitle = styled.h3(({ theme }) => ({
  margin: 0,
  fontSize: "16px",
  fontWeight: 600,
  color: theme.color.defaultText,
  marginBottom: "0.5rem",
}));

const ComponentDescription = styled.p(({ theme }) => ({
  margin: "0.5rem 0",
  fontSize: "13px",
  color: theme.color.defaultText,
  lineHeight: 1.5,
}));

const ExternalLinksContainer = styled.div({
  display: "flex",
  gap: "1rem",
  marginTop: "0.75rem",
  flexWrap: "wrap",
});

const ExternalLink = styled.a(({ theme }) => ({
  color: theme.color.secondary,
  textDecoration: "none",
  fontSize: "13px",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  "&:hover": {
    textDecoration: "underline",
  },
}));

const ExternalLinkIcon = styled.span(({ theme }) => ({
  width: "16px",
  height: "16px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  opacity: 0.7,
}));

const LabelsContainer = styled.div({
  display: "flex",
  gap: "0.5rem",
  marginTop: "0.75rem",
  flexWrap: "wrap",
});

const Label = styled.span<{ bgColor?: string }>(({ theme, bgColor }) => ({
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: 500,
  backgroundColor: bgColor || theme.color.mediumdark,
  color: "#fff",
}));

const SectionTitle = styled.h4(({ theme }) => ({
  margin: "1.5rem 0 0.75rem 0",
  fontSize: "14px",
  fontWeight: 600,
  color: theme.color.defaultText,
}));

const ComponentViewsGrid = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const ComponentViewCard = styled.div(({ theme }) => ({
  padding: "1rem",
  background: theme.background.hoverable,
  borderRadius: "6px",
  border: `1px solid ${theme.color.border}`,
}));

const ViewCardTitle = styled.h5(({ theme }) => ({
  margin: 0,
  fontSize: "13px",
  fontWeight: 600,
  color: theme.color.defaultText,
  marginBottom: "0.75rem",
}));

const Screenshot = styled.img(({ theme }) => ({
  width: "100%",
  maxHeight: "200px",
  objectFit: "cover",
  borderRadius: "4px",
  border: `1px solid ${theme.color.border}`,
  marginBottom: "0.75rem",
  display: "block",
}));

const CodeCapture = styled.pre(({ theme }) => ({
  margin: "0.75rem 0",
  padding: "0.75rem",
  background: theme.background.app,
  borderRadius: "4px",
  fontSize: "11px",
  fontFamily: "monospace",
  overflow: "auto",
  maxHeight: "100px",
  lineHeight: 1.4,
  color: theme.color.defaultText,
}));

const UrlDisplay = styled.div(({ theme }) => ({
  fontSize: "11px",
  color: theme.color.mediumdark,
  marginBottom: "0.75rem",
  wordBreak: "break-all",
}));

const ViewInPageButton = styled.a(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.5rem 0.75rem",
  background: theme.color.secondary,
  color: "#fff",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 500,
  textDecoration: "none",
  transition: "background 0.2s ease",
  "&:hover": {
    background: theme.color.secondary,
    opacity: 0.9,
  },
}));

const ViewMoreButton = styled.button(({ theme }) => ({
  padding: "0.75rem",
  width: "100%",
  border: `1px solid ${theme.color.border}`,
  background: "transparent",
  color: theme.color.defaultText,
  borderRadius: "4px",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  marginTop: "0.5rem",
  transition: "all 0.2s ease",
  "&:hover": {
    background: theme.background.hoverable,
  },
}));

const DomainSection = styled.div({
  marginBottom: "2rem",
});

const DomainHeader = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "1rem",
  fontSize: "14px",
  fontWeight: 600,
  color: theme.color.defaultText,
  paddingBottom: "0.5rem",
  borderBottom: `1px solid ${theme.color.border}`,
}));

const PageSection = styled.div(({ theme }) => ({
  marginBottom: "1.5rem",
  paddingLeft: "1rem",
  borderLeft: `2px solid ${theme.color.border}`,
}));

const PageUrl = styled.div(({ theme }) => ({
  fontSize: "12px",
  color: theme.color.mediumdark,
  marginBottom: "0.75rem",
  fontFamily: "monospace",
  fontWeight: 500,
}));

const EmptyState = styled.div(({ theme }) => ({
  textAlign: "center",
  padding: "3rem 2rem",
  color: theme.color.mediumdark,
}));

const EmptyStateTitle = styled.h3(({ theme }) => ({
  margin: "0 0 0.5rem 0",
  fontSize: "16px",
  color: theme.color.defaultText,
}));

const EmptyStateText = styled.p(({ theme }) => ({
  margin: "0.5rem 0",
  fontSize: "14px",
  lineHeight: 1.6,
}));

const CodeExample = styled.pre(({ theme }) => ({
  marginTop: "1rem",
  padding: "1rem",
  background: theme.background.app,
  borderRadius: "4px",
  fontSize: "12px",
  textAlign: "left",
  overflow: "auto",
  maxWidth: "600px",
  margin: "1rem auto",
}));

const DocsLink = styled.a(({ theme }) => ({
  color: theme.color.secondary,
  textDecoration: "none",
  fontWeight: 500,
  "&:hover": {
    textDecoration: "underline",
  },
}));

// Import usage data with fallback to empty object
let usageData: UsageDataMap = {};
try {
  usageData = require("../data/usage-data.json");
} catch (e) {
  console.warn("Usage data not found. Using empty data set.");
}

// Component to render a single component view card
const ComponentViewCardComponent: React.FC<{
  view: ComponentView;
  index: number;
}> = ({ view, index }) => {
  // Extract Infa IDs from screenshot URL
  const { boardId, componentViewId } = extractInfaIds(view.screenshot);

  // Generate Infa link if we have the necessary IDs, otherwise use the original URL
  const infaLink =
    boardId && componentViewId
      ? `https://infa.ai/open?board=${boardId}&componentView=${componentViewId}`
      : view.url;

  return (
    <ComponentViewCard>
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
    </ComponentViewCard>
  );
};

export const Panel: React.FC<PanelProps> = memo(function UsagePanel(props) {
  const theme = useTheme();
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

  const toggleExpanded = (componentId: string) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  // Render Group by Components view
  const renderComponentsView = () => {
    return (
      <>
        {components.map(({ id, data }) => {
          const isExpanded = expandedComponents[id];
          const visibleViews = isExpanded
            ? data.component_views
            : data.component_views.slice(0, 5);
          const hasMore = data.component_views.length > 5;

          return (
            <ComponentSection key={id}>
              <ComponentHeader>
                <ComponentTitle>{data.title}</ComponentTitle>

                {data.labels && data.labels.length > 0 && (
                  <LabelsContainer>
                    {data.labels.map((label, idx) => (
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

                {data.description && (
                  <ComponentDescription>
                    {data.description}
                  </ComponentDescription>
                )}

                {data.external_links && data.external_links.length > 0 && (
                  <ExternalLinksContainer>
                    {data.external_links.map((link, idx) => (
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
              </ComponentHeader>

              {data.component_views && data.component_views.length > 0 && (
                <>
                  <SectionTitle>
                    Component Views ({data.component_views.length})
                  </SectionTitle>
                  <ComponentViewsGrid>
                    {visibleViews.map((view, idx) => (
                      <ComponentViewCardComponent
                        key={idx}
                        view={view}
                        index={idx}
                      />
                    ))}
                  </ComponentViewsGrid>

                  {hasMore && !isExpanded && (
                    <ViewMoreButton onClick={() => toggleExpanded(id)}>
                      View More ({data.component_views.length - 5} more)
                    </ViewMoreButton>
                  )}

                  {hasMore && isExpanded && (
                    <ViewMoreButton onClick={() => toggleExpanded(id)}>
                      View Less
                    </ViewMoreButton>
                  )}
                </>
              )}
            </ComponentSection>
          );
        })}
      </>
    );
  };

  // Render Group by Domains view
  const renderDomainsView = () => {
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
                  const infaLink =
                    boardId && componentViewId
                      ? `https://infa.ai/open?board=${boardId}&componentView=${componentViewId}`
                      : view.url;

                  return (
                    <ComponentViewCard key={idx}>
                      <ViewCardTitle>{view.componentTitle}</ViewCardTitle>

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
                    </ComponentViewCard>
                  );
                })}
              </PageSection>
            ))}
          </DomainSection>
        ))}
      </>
    );
  };

  return (
    <AddonPanel {...props}>
      <PanelContent>
        {hasComponents && components.length > 0 ? (
          <>
            <ViewToggleContainer>
              <ToggleButton
                active={viewMode === "components"}
                onClick={() => setViewMode("components")}
              >
                Group by Components
              </ToggleButton>
              <ToggleButton
                active={viewMode === "domains"}
                onClick={() => setViewMode("domains")}
              >
                Group by Domains
              </ToggleButton>
            </ViewToggleContainer>

            {viewMode === "components"
              ? renderComponentsView()
              : renderDomainsView()}
          </>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Usage Data</EmptyStateTitle>
            <EmptyStateText>
              To see where your components are used, you need to:
            </EmptyStateText>
            <EmptyStateText>
              1. Tag components in your products using{" "}
              <DocsLink
                href="https://www.npmjs.com/package/storybook-infa-usage#quick-start"
                target="_blank"
                rel="noopener noreferrer"
              >
                Infa browser extension
              </DocsLink>
            </EmptyStateText>
            <EmptyStateText>
              2. Configure your story with main component IDs
            </EmptyStateText>
            <CodeExample>
              {`// Button.stories.tsx
export default {
  component: Button,
  parameters: {
    usage: {
      mcComponentIds: ['mc_xxxxxxxx']
    }
  }
}`}
            </CodeExample>
            <EmptyStateText style={{ marginTop: "1rem" }}>
              <DocsLink
                href="https://www.npmjs.com/package/storybook-infa-usage"
                target="_blank"
                rel="noopener noreferrer"
              >
                View full documentation →
              </DocsLink>
            </EmptyStateText>
          </EmptyState>
        )}
      </PanelContent>
    </AddonPanel>
  );
});
