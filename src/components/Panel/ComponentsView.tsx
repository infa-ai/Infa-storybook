/**
 * ComponentsView component - Displays components grouped by component
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from "@storybook/icons";
import { Badge } from "storybook/internal/components";
import type { ComponentData, ComponentView } from "../../types";
import { ComponentHeader } from "./ComponentHeader";
import { ComponentViewCard } from "./ComponentViewCard";
import { extractDomain, formatUrlForDisplay } from "./utils";
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

  const toggleGroupCollapsed = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Group views by domain or URL
  const groupViews = (
    views: ComponentView[],
    groupType: "domains" | "pages",
  ): Map<string, ComponentView[]> => {
    const grouped = new Map<string, ComponentView[]>();

    views.forEach((view) => {
      let key: string;
      if (groupType === "domains") {
        key = extractDomain(view.url);
      } else {
        key = view.url;
      }

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(view);
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
        const visibleViews = isExpanded
          ? data.component_views
          : data.component_views.slice(0, 5);
        const hasMore = data.component_views.length > 5;
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
                              <GroupByMenuItem
                                active={groupBy === "domains"}
                                onClick={() => handleGroupBySelect("domains")}
                              >
                                Group by Domains
                              </GroupByMenuItem>
                              <GroupByMenuItem
                                active={groupBy === "pages"}
                                onClick={() => handleGroupBySelect("pages")}
                              >
                                Group by Pages
                              </GroupByMenuItem>
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

                      const grouped = groupViews(data.component_views, groupBy);
                      const groups = Array.from(grouped.entries());

                      return (
                        <>
                          {groups.map(([groupKey, groupViews]) => {
                            const groupId = `${id}-${groupBy}-${groupKey}`;
                            const isGroupCollapsed =
                              collapsedGroups[groupId] ?? false;

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
                                    {groupBy === "domains"
                                      ? groupKey
                                      : formatUrlForDisplay(groupKey)}
                                  </GroupHeaderTitle>
                                  <Badge status="neutral">
                                    {groupViews.length}
                                  </Badge>
                                </GroupHeader>
                                {!isGroupCollapsed && (
                                  <GroupContent>
                                    <ComponentViewsGrid>
                                      {groupViews.map((view, idx) => (
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

                  {hasMore && !isExpanded && (
                    <ViewMoreButton onClick={() => onToggleExpanded(id)}>
                      View More{" "}
                      <Badge status="neutral">
                        {data.component_views.length - 5}
                      </Badge>{" "}
                      more
                    </ViewMoreButton>
                  )}

                  {hasMore && isExpanded && (
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
