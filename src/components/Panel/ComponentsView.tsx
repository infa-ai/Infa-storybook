/**
 * ComponentsView component - Displays components grouped by component
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from "@storybook/icons";
import { Badge } from "storybook/internal/components";
import type { ComponentData, ComponentView } from "../../types";
import { ComponentHeader } from "./ComponentHeader";
import { ComponentViewCard } from "./ComponentViewCard";
import { extractDomain, formatUrlForDisplay, matchUrlToPage } from "./utils";
import {
  ComponentSection,
  SectionTitle,
  SectionTitleRow,
  ComponentViewsGrid,
  ViewMoreButton,
  ActionButton,
  GroupByDropdown,
  GroupByButton,
  GroupByMenu,
  GroupByMenuItem,
  ControlsGroup,
  GroupHeader,
  GroupHeaderButton,
  GroupHeaderTitle,
  GroupContent,
  PageInfoContainer,
  PageInfoImage,
  PageInfoContent,
  PageInfoLabel,
  PageInfoUrl,
} from "./styles";

type GroupByOption = "all" | "domains" | "pages";

interface ComponentsViewProps {
  components: Array<{ id: string; data: ComponentData }>;
  expandedComponents: Record<string, boolean>;
  onToggleExpanded: (componentId: string) => void;
  collapsedComponents: Record<string, boolean>;
  onToggleCollapsed: (componentId: string) => void;
  boardId?: string;
  onTagComponents: () => void;
}

export const ComponentsView: React.FC<ComponentsViewProps> = ({
  components,
  expandedComponents,
  onToggleExpanded,
  collapsedComponents,
  onToggleCollapsed,
  boardId,
  onTagComponents,
}) => {
  const [groupBy, setGroupBy] = useState<GroupByOption>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const groupByLabels: Record<GroupByOption, string> = {
    all: "All Views",
    domains: "Group by Domains",
    pages: "Group by Pages",
  };

  const handleGroupBySelect = (option: GroupByOption) => {
    setGroupBy(option);
    setIsDropdownOpen(false);
    // Reset collapsed groups when changing grouping
    setCollapsedGroups({});
  };

  // Check if grouping options should be available
  const checkGroupingAvailability = useMemo(() => {
    // Collect all views from all components
    const allViews = components.flatMap(
      ({ data }) => data.component_views || [],
    );

    if (allViews.length === 0) {
      return { domains: false, pages: false };
    }

    // Check domains - normalize to handle edge cases
    const domains = new Set(
      allViews.map((view) => {
        try {
          const domain = extractDomain(view.url);
          return domain.toLowerCase().trim();
        } catch {
          return view.url;
        }
      }),
    );
    const hasMultipleDomains = domains.size > 1;

    // Check pages (URLs)
    const urls = new Set(allViews.map((view) => view.url));
    const hasMultiplePages = urls.size > 1;

    return {
      domains: hasMultipleDomains,
      pages: hasMultiplePages,
    };
  }, [components]);

  // Reset groupBy if selected option is no longer available
  useEffect(() => {
    if (groupBy === "domains" && !checkGroupingAvailability.domains) {
      setGroupBy("all");
      setCollapsedGroups({});
    } else if (groupBy === "pages" && !checkGroupingAvailability.pages) {
      setGroupBy("all");
      setCollapsedGroups({});
    }
  }, [groupBy, checkGroupingAvailability]);

  const toggleGroupCollapsed = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Group views by domain or page
  const groupViews = (
    views: ComponentView[],
    groupType: "domains" | "pages",
    pages?: Array<{ id: string; data: ComponentData }>[0]["data"]["pages"],
  ): Map<string, { views: ComponentView[]; page: any }> => {
    const grouped = new Map<string, { views: ComponentView[]; page: any }>();

    views.forEach((view) => {
      let key: string;
      let page: any = null;

      if (groupType === "domains") {
        key = extractDomain(view.url);
      } else {
        // Try to match URL to a page
        const matchedPage = matchUrlToPage(view.url, pages);
        if (matchedPage) {
          key = matchedPage.page_id;
          page = matchedPage;
        } else {
          // Fallback to URL if no page match
          key = view.url;
        }
      }

      if (!grouped.has(key)) {
        grouped.set(key, { views: [], page });
      }
      grouped.get(key)!.views.push(view);
    });

    return grouped;
  };

  // Check if grouping should be shown (only if multiple groups exist)
  const shouldShowGrouping = (
    views: ComponentView[],
    groupType: "domains" | "pages",
  ): boolean => {
    if (groupType === "domains") {
      const domains = new Set(views.map((view) => extractDomain(view.url)));
      return domains.size > 1;
    } else {
      const urls = new Set(views.map((view) => view.url));
      return urls.size > 1;
    }
  };

  return (
    <>
      {components.map(({ id, data }, index) => {
        const isExpanded = expandedComponents[id];
        const isCollapsed = collapsedComponents[id];
        // When grouping is active, show all views; otherwise use pagination
        const visibleViews =
          groupBy === "all"
            ? isExpanded
              ? data.component_views
              : data.component_views.slice(0, 5)
            : data.component_views;
        const hasMore = groupBy === "all" && data.component_views.length > 5;
        // Show controls only for the first component
        const showControls = index === 0;

        return (
          <ComponentSection key={id}>
            <ComponentHeader
              title={data.title}
              description={data.description}
              labels={data.labels}
              externalLinks={data.external_links}
              isCollapsed={isCollapsed}
              onToggleCollapsed={() => onToggleCollapsed(id)}
            />

            {!isCollapsed &&
              data.component_views &&
              data.component_views.length > 0 && (
                <>
                  <SectionTitleRow>
                    <SectionTitle>
                      Component Views{" "}
                      <Badge status="neutral">
                        {data.component_views.length}
                      </Badge>
                    </SectionTitle>
                    {showControls && (
                      <ControlsGroup>
                        <ActionButton
                          variant="secondary"
                          onClick={onTagComponents}
                          disabled={!boardId}
                          title={
                            !boardId
                              ? "No board ID available"
                              : "Open Infa board to tag components"
                          }
                          style={{
                            fontSize: "12px",
                            padding: "0.375rem 0.75rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                          }}
                        >
                          <PlusIcon style={{ width: "12px", height: "12px" }} />
                          Tag More Components
                        </ActionButton>
                        <GroupByDropdown ref={dropdownRef}>
                          <GroupByButton
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            title="Group by"
                          >
                            {groupByLabels[groupBy]}
                            <ChevronDownIcon
                              style={{
                                width: "12px",
                                height: "12px",
                                transform: isDropdownOpen
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                              }}
                            />
                          </GroupByButton>
                          {isDropdownOpen && (
                            <GroupByMenu>
                              <GroupByMenuItem
                                active={groupBy === "all"}
                                onClick={() => handleGroupBySelect("all")}
                              >
                                All Views
                              </GroupByMenuItem>
                              {checkGroupingAvailability.domains && (
                                <GroupByMenuItem
                                  active={groupBy === "domains"}
                                  onClick={() => handleGroupBySelect("domains")}
                                >
                                  Group by Domains
                                </GroupByMenuItem>
                              )}
                              {checkGroupingAvailability.pages && (
                                <GroupByMenuItem
                                  active={groupBy === "pages"}
                                  onClick={() => handleGroupBySelect("pages")}
                                >
                                  Group by Pages
                                </GroupByMenuItem>
                              )}
                            </GroupByMenu>
                          )}
                        </GroupByDropdown>
                      </ControlsGroup>
                    )}
                  </SectionTitleRow>

                  {groupBy === "all" ? (
                    <ComponentViewsGrid>
                      {visibleViews.map((view, idx) => (
                        <ComponentViewCard
                          key={idx}
                          view={view}
                          boardId={data.board_id}
                        />
                      ))}
                    </ComponentViewsGrid>
                  ) : (
                    (() => {
                      const shouldGroup = shouldShowGrouping(
                        data.component_views,
                        groupBy,
                      );

                      if (!shouldGroup) {
                        // If all views have same domain/URL, show without grouping
                        return (
                          <ComponentViewsGrid>
                            {visibleViews.map((view, idx) => (
                              <ComponentViewCard
                                key={idx}
                                view={view}
                                boardId={data.board_id}
                              />
                            ))}
                          </ComponentViewsGrid>
                        );
                      }

                      const grouped = groupViews(
                        data.component_views,
                        groupBy,
                        data.pages,
                      );
                      const groups = Array.from(grouped.entries());

                      return (
                        <>
                          {groups.map(([groupKey, groupData]) => {
                            const groupId = `${id}-${groupBy}-${groupKey}`;
                            const isGroupCollapsed =
                              collapsedGroups[groupId] ?? false;
                            const page = groupData.page;
                            const displayTitle =
                              groupBy === "pages" && page
                                ? page.title
                                : groupBy === "domains"
                                  ? groupKey
                                  : formatUrlForDisplay(groupKey);

                            return (
                              <div key={groupId} style={{ marginTop: "1rem" }}>
                                <GroupHeader>
                                  <GroupHeaderButton
                                    onClick={() =>
                                      toggleGroupCollapsed(groupId)
                                    }
                                    title={
                                      isGroupCollapsed
                                        ? "Expand group"
                                        : "Collapse group"
                                    }
                                  >
                                    {isGroupCollapsed ? (
                                      <ChevronRightIcon
                                        style={{
                                          width: "12px",
                                          height: "12px",
                                        }}
                                      />
                                    ) : (
                                      <ChevronDownIcon
                                        style={{
                                          width: "12px",
                                          height: "12px",
                                        }}
                                      />
                                    )}
                                  </GroupHeaderButton>
                                  <GroupHeaderTitle
                                    isPage={groupBy === "pages"}
                                  >
                                    {displayTitle}{" "}
                                    <Badge status="neutral">
                                      {groupData.views.length}
                                    </Badge>
                                  </GroupHeaderTitle>
                                </GroupHeader>
                                {!isGroupCollapsed && (
                                  <GroupContent>
                                    {groupBy === "pages" && page && (
                                      <PageInfoContainer>
                                        {page.screenshot && (
                                          <PageInfoImage
                                            src={page.screenshot}
                                            alt={page.title}
                                          />
                                        )}
                                        <PageInfoContent>
                                          {page.url_pattern ===
                                          page.default_url ? (
                                            <PageInfoUrl>
                                              {page.url_pattern}
                                            </PageInfoUrl>
                                          ) : (
                                            <>
                                              <div>
                                                <PageInfoLabel>
                                                  URL Pattern
                                                </PageInfoLabel>
                                                <PageInfoUrl>
                                                  {page.url_pattern}
                                                </PageInfoUrl>
                                              </div>
                                              {page.default_url && (
                                                <div>
                                                  <PageInfoLabel>
                                                    Default URL
                                                  </PageInfoLabel>
                                                  <PageInfoUrl>
                                                    {page.default_url}
                                                  </PageInfoUrl>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </PageInfoContent>
                                      </PageInfoContainer>
                                    )}
                                    <ComponentViewsGrid>
                                      {groupData.views.map((view, idx) => (
                                        <ComponentViewCard
                                          key={`${groupId}-${idx}`}
                                          view={view}
                                          boardId={data.board_id}
                                        />
                                      ))}
                                    </ComponentViewsGrid>
                                  </GroupContent>
                                )}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()
                  )}

                  {/* Only show View More/Less when not grouping */}
                  {groupBy === "all" && hasMore && !isExpanded && (
                    <ViewMoreButton onClick={() => onToggleExpanded(id)}>
                      View More{" "}
                      <Badge status="neutral">
                        {data.component_views.length - 5}
                      </Badge>{" "}
                      more
                    </ViewMoreButton>
                  )}

                  {groupBy === "all" && hasMore && isExpanded && (
                    <ViewMoreButton onClick={() => onToggleExpanded(id)}>
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
