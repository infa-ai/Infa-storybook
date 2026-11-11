/**
 * ComponentsView component - each component of the story with its usages.
 *
 * A usage is a component view: where in the product it is (a board screen)
 * and which element exactly (an XPath found in the browser, or a file found
 * in code). They are listed in one list grouped by screen by default, the
 * usages on no screen last; by domain, or ungrouped, on request.
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from "@storybook/icons";
import { Badge } from "storybook/internal/components";
import type { CodeRoot, ComponentData, ComponentView } from "../../types";
import { CodeUsagesSection } from "./CodeUsagesSection";
import { ComponentHeader } from "./ComponentHeader";
import { ComponentViewCard } from "./ComponentViewCard";
import {
  boardComponentsUrl,
  componentPageUrl,
  extractDomain,
  groupViewsByDomain,
  groupViewsByScreen,
  screenPageUrl,
  type UsageGroup,
} from "./utils";
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
  GroupHeaderLink,
  GroupContent,
  PageInfoContainer,
  PageInfoImage,
  PageInfoContent,
  PageInfoLabel,
  PageInfoUrl,
  NoUsagesWrapper,
  NoUsagesTitle,
  NoUsagesText,
  DocsLink,
} from "./styles";

type GroupByOption = "screens" | "domains" | "all";

const GROUP_BY_LABELS: Record<GroupByOption, string> = {
  screens: "Group by Screen",
  domains: "Group by Domain",
  all: "All Usages",
};

/** Views shown before "View More" in the ungrouped list. */
const PAGE_SIZE = 6;

interface ComponentsViewProps {
  components: Array<{ id: string; data: ComponentData }>;
  expandedComponents: Record<string, boolean>;
  onToggleExpanded: (componentId: string) => void;
  collapsedComponents: Record<string, boolean>;
  onToggleCollapsed: (componentId: string) => void;
  boardId?: string;
  onTagComponents: () => void;
  /** `_metadata.codeRoots`: where each call site's file links to. */
  codeRoots?: CodeRoot[];
}

/** What a component with no usages shows: where to add them. */
const NoUsages: React.FC<{ componentUrl: string | null; codeRead: boolean }> = ({ componentUrl, codeRead }) => (
  <NoUsagesWrapper data-testid="infa-usage-no-usages">
    <NoUsagesTitle>No usages yet</NoUsagesTitle>
    <NoUsagesText>
      A usage is a place in your product where this component is used. Add them
      from the browser with the Infa Chrome extension, or from code with the
      Infa CLI or the Claude plugin, then sync again.
    </NoUsagesText>
    {codeRead && (
      <NoUsagesText data-testid="infa-usage-no-usages-code">
        The code was read too: nothing in this repo renders it. A design system used by other repos: sync with{" "}
        <code>--in ../app</code>.
      </NoUsagesText>
    )}
    {componentUrl && (
      <NoUsagesText>
        <DocsLink
          href={componentUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="infa-usage-no-usages-link"
        >
          Open the component in Infa →
        </DocsLink>
      </NoUsagesText>
    )}
  </NoUsagesWrapper>
);

export const ComponentsView: React.FC<ComponentsViewProps> = ({
  components,
  expandedComponents,
  onToggleExpanded,
  collapsedComponents,
  onToggleCollapsed,
  boardId,
  onTagComponents,
  codeRoots,
}) => {
  const [groupBy, setGroupBy] = useState<GroupByOption>("screens");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Grouping by domain is offered only when the usages span several.
  const hasManyDomains = useMemo(() => {
    const domains = new Set(
      components
        .flatMap(({ data }) => data.component_views)
        .map((view) => (view.sourceKind === "code" ? "code" : extractDomain(view.url).toLowerCase().trim())),
    );
    return domains.size > 1;
  }, [components]);

  useEffect(() => {
    if (groupBy === "domains" && !hasManyDomains) {
      setGroupBy("screens");
      setCollapsedGroups({});
    }
  }, [groupBy, hasManyDomains]);

  const handleGroupBySelect = (option: GroupByOption) => {
    setGroupBy(option);
    setIsDropdownOpen(false);
    setCollapsedGroups({});
  };

  const toggleGroupCollapsed = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const renderCards = (views: ComponentView[], id: string, data: ComponentData, keyPrefix: string) => (
    <ComponentViewsGrid>
      {views.map((view, idx) => (
        <ComponentViewCard
          key={`${keyPrefix}-${view.id ?? idx}`}
          view={view}
          boardId={data.board_id}
          componentId={id}
          boardUrl={data.board_url}
        />
      ))}
    </ComponentViewsGrid>
  );

  const renderGroup = (group: UsageGroup, id: string, data: ComponentData) => {
    const groupId = `${id}-${groupBy}-${group.key}`;
    const isGroupCollapsed = collapsedGroups[groupId] ?? false;
    const screen = group.screen;
    const screenUrl = screenPageUrl(data.board_id, group.screenId, data.board_url);

    return (
      <div
        key={groupId}
        style={{ marginTop: "1rem" }}
        data-testid="infa-usage-group"
        data-group-key={group.key}
        data-screen-id={group.screenId ?? undefined}
      >
        <GroupHeader>
          <GroupHeaderButton
            onClick={() => toggleGroupCollapsed(groupId)}
            title={isGroupCollapsed ? "Expand group" : "Collapse group"}
          >
            {isGroupCollapsed ? (
              <ChevronRightIcon style={{ width: "12px", height: "12px" }} />
            ) : (
              <ChevronDownIcon style={{ width: "12px", height: "12px" }} />
            )}
          </GroupHeaderButton>
          <GroupHeaderTitle data-testid="infa-usage-group-title">
            {screenUrl ? (
              <GroupHeaderLink href={screenUrl} target="_blank" rel="noopener noreferrer" title="Open the screen in Infa">
                {group.title}
              </GroupHeaderLink>
            ) : (
              group.title
            )}{" "}
            <Badge status="neutral">{group.views.length}</Badge>
          </GroupHeaderTitle>
        </GroupHeader>
        {!isGroupCollapsed && (
          <GroupContent>
            {screen && (screen.screenshot || screen.url_pattern) && (
              <PageInfoContainer>
                {screen.screenshot && <PageInfoImage src={screen.screenshot} alt={screen.title} />}
                <PageInfoContent>
                  {!screen.default_url || screen.url_pattern === screen.default_url ? (
                    <PageInfoUrl>{screen.url_pattern}</PageInfoUrl>
                  ) : (
                    <>
                      <div>
                        <PageInfoLabel>URL Pattern</PageInfoLabel>
                        <PageInfoUrl>{screen.url_pattern}</PageInfoUrl>
                      </div>
                      <div>
                        <PageInfoLabel>Default URL</PageInfoLabel>
                        <PageInfoUrl>{screen.default_url}</PageInfoUrl>
                      </div>
                    </>
                  )}
                </PageInfoContent>
              </PageInfoContainer>
            )}
            {renderCards(group.views, id, data, groupId)}
          </GroupContent>
        )}
      </div>
    );
  };

  return (
    <>
      {components.map(({ id, data }, index) => {
        const views = data.component_views;
        const isExpanded = expandedComponents[id];
        const isCollapsed = collapsedComponents[id];
        const hasMore = groupBy === "all" && views.length > PAGE_SIZE;
        const visibleViews = groupBy === "all" && !isExpanded ? views.slice(0, PAGE_SIZE) : views;
        // Show controls only for the first component
        const showControls = index === 0;
        const groups =
          groupBy === "screens"
            ? groupViewsByScreen(views, data.screens)
            : groupBy === "domains"
              ? groupViewsByDomain(views)
              : [];
        const componentUrl =
          data.board_url ||
          componentPageUrl(data.board_id, id) ||
          boardComponentsUrl(data.board_id ?? boardId);

        return (
          <ComponentSection key={id}>
            <ComponentHeader
              title={data.title}
              description={data.description}
              labels={data.labels}
              externalLinks={data.external_links}
              flows={data.flows}
              boardUrl={data.board_url}
              isCollapsed={isCollapsed}
              onToggleCollapsed={() => onToggleCollapsed(id)}
            />

            {!isCollapsed && views.length === 0 && !(data.code_usages && data.code_usages.total > 0) && (
              <NoUsages componentUrl={componentUrl} codeRead={Boolean(data.code_usages)} />
            )}

            {!isCollapsed && views.length > 0 && (
              <>
                <SectionTitleRow>
                  <SectionTitle>
                    Usages <Badge status="neutral">{views.length}</Badge>
                  </SectionTitle>
                  {showControls && (
                    <ControlsGroup>
                      <ActionButton
                        variant="secondary"
                        onClick={onTagComponents}
                        disabled={!boardId}
                        title={!boardId ? "No board ID available" : "Open Infa board to tag components"}
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
                          data-testid="infa-usage-group-by"
                        >
                          {GROUP_BY_LABELS[groupBy]}
                          <ChevronDownIcon
                            style={{
                              width: "12px",
                              height: "12px",
                              transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          />
                        </GroupByButton>
                        {isDropdownOpen && (
                          <GroupByMenu>
                            <GroupByMenuItem
                              active={groupBy === "screens"}
                              onClick={() => handleGroupBySelect("screens")}
                            >
                              {GROUP_BY_LABELS.screens}
                            </GroupByMenuItem>
                            {hasManyDomains && (
                              <GroupByMenuItem
                                active={groupBy === "domains"}
                                onClick={() => handleGroupBySelect("domains")}
                              >
                                {GROUP_BY_LABELS.domains}
                              </GroupByMenuItem>
                            )}
                            <GroupByMenuItem active={groupBy === "all"} onClick={() => handleGroupBySelect("all")}>
                              {GROUP_BY_LABELS.all}
                            </GroupByMenuItem>
                          </GroupByMenu>
                        )}
                      </GroupByDropdown>
                    </ControlsGroup>
                  )}
                </SectionTitleRow>

                {groupBy === "all"
                  ? renderCards(visibleViews, id, data, `${id}-all`)
                  : groups.map((group) => renderGroup(group, id, data))}

                {hasMore && (
                  <ViewMoreButton onClick={() => onToggleExpanded(id)}>
                    {isExpanded ? (
                      "View Less"
                    ) : (
                      <>
                        View More <Badge status="neutral">{views.length - PAGE_SIZE}</Badge> more
                      </>
                    )}
                  </ViewMoreButton>
                )}
              </>
            )}

            {!isCollapsed && data.code_usages && data.code_usages.total > 0 && (
              <CodeUsagesSection
                code={data.code_usages}
                screens={data.screens}
                roots={codeRoots}
                boardId={data.board_id ?? boardId}
                boardUrl={data.board_url}
                componentTitle={data.title}
              />
            )}
          </ComponentSection>
        );
      })}
    </>
  );
};
