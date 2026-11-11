/**
 * CodeUsagesSection - every place the code renders the component, read from
 * the repo by `infa storybook sync` (the same scan as `infa usages`), with
 * nothing tagged by hand.
 *
 * Call sites are grouped by where they are: the board screen their route is,
 * else the route itself (the board has no screen for it yet), else "Not on a
 * route". Each one names its file and line (a link into the repository when
 * the repo has a remote), the element as written, and the component it sits in.
 */

import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@storybook/icons";
import { Badge } from "storybook/internal/components";
import type { CodeRoot, CodeUsages, Screen } from "../../types";
import {
  CALL_SITE_KIND_COPY,
  codeSiteFile,
  codeSiteUrl,
  describePropUses,
  groupCallSites,
  screenPageUrl,
} from "./utils";
import {
  CallSiteElement,
  CallSiteFile,
  CallSiteList,
  CallSiteMeta,
  CallSiteRow,
  CodeSummary,
  GroupContent,
  GroupHeader,
  GroupHeaderButton,
  GroupHeaderLink,
  GroupHeaderTitle,
  SectionTitle,
  SectionTitleRow,
  ViewChip,
} from "./styles";

/** Call sites shown per group before "Show all". */
const GROUP_PAGE = 8;

interface CodeUsagesSectionProps {
  code: CodeUsages;
  screens?: Screen[];
  roots?: CodeRoot[];
  boardId?: string;
  boardUrl?: string;
  componentTitle: string;
}

export const CodeUsagesSection: React.FC<CodeUsagesSectionProps> = ({
  code,
  screens,
  roots,
  boardId,
  boardUrl,
  componentTitle,
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const groups = groupCallSites(code.sites, screens);
  const props = describePropUses(code.props);
  const command = `npx infa usages ${code.exportName && code.exportName !== "default" ? code.exportName : componentTitle}`;

  return (
    <div data-testid="infa-usage-code" style={{ marginTop: "1.5rem" }}>
      <SectionTitleRow>
        <SectionTitle>
          In code <Badge status="neutral">{code.total}</Badge>
        </SectionTitle>
      </SectionTitleRow>
      <CodeSummary data-testid="infa-usage-code-summary">
        {code.total === 0
          ? "Nothing in the code renders it."
          : `${code.total} call site${code.total === 1 ? "" : "s"} in ${code.files} file${code.files === 1 ? "" : "s"}, read from the code: nothing to tag.`}
        {code.total > code.sites.length && ` Showing ${code.sites.length}; \`${command}\` lists all.`}
      </CodeSummary>
      {props.length > 0 && (
        <CodeSummary data-testid="infa-usage-code-props">Props: {props.join(" · ")}</CodeSummary>
      )}

      {groups.map((group) => {
        const isCollapsed = collapsed[group.key] ?? false;
        const showAll = expanded[group.key] ?? false;
        const visible = showAll ? group.sites : group.sites.slice(0, GROUP_PAGE);
        const screenUrl = group.screenId ? screenPageUrl(boardId, group.screenId, boardUrl) : null;
        return (
          <div
            key={group.key}
            style={{ marginTop: "1rem" }}
            data-testid="infa-usage-code-group"
            data-group-kind={group.kind}
            data-screen-id={group.screenId ?? undefined}
          >
            <GroupHeader>
              <GroupHeaderButton
                onClick={() => setCollapsed((prev) => ({ ...prev, [group.key]: !isCollapsed }))}
                title={isCollapsed ? "Expand group" : "Collapse group"}
              >
                {isCollapsed ? (
                  <ChevronRightIcon style={{ width: "12px", height: "12px" }} />
                ) : (
                  <ChevronDownIcon style={{ width: "12px", height: "12px" }} />
                )}
              </GroupHeaderButton>
              <GroupHeaderTitle data-testid="infa-usage-code-group-title">
                {screenUrl ? (
                  <GroupHeaderLink href={screenUrl} target="_blank" rel="noopener noreferrer" title="Open the screen in Infa">
                    {group.title}
                  </GroupHeaderLink>
                ) : (
                  group.title
                )}{" "}
                <Badge status="neutral">{group.sites.length}</Badge>
                {group.kind === "route" && (
                  <ViewChip title="A route in the code that the board has no screen for yet" style={{ marginLeft: "6px" }}>
                    {group.path?.endsWith("/*") ? "Layout" : "No screen on the board"}
                  </ViewChip>
                )}
              </GroupHeaderTitle>
            </GroupHeader>
            {!isCollapsed && (
              <GroupContent>
                <CallSiteList>
                  {visible.map((site) => {
                    const file = codeSiteFile(site, roots);
                    const url = codeSiteUrl(site, roots);
                    const kind = CALL_SITE_KIND_COPY[site.kind];
                    const otherRoutes = site.routes.length - 1 + (site.moreRoutes ?? 0);
                    return (
                      <CallSiteRow
                        key={`${site.root}:${site.file}:${site.line}:${site.column}`}
                        data-testid="infa-usage-code-site"
                        data-kind={site.kind}
                      >
                        <CallSiteFile>
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" title="Open the line in the repository">
                              {file}:{site.line}
                            </a>
                          ) : (
                            `${file}:${site.line}`
                          )}
                        </CallSiteFile>
                        <CallSiteElement title={site.element}>{site.element}</CallSiteElement>
                        {(site.within || kind || site.through || otherRoutes > 0) && (
                          <CallSiteMeta>
                            {kind && <ViewChip>{kind}</ViewChip>}
                            {site.through && <span>through {site.through}</span>}
                            {site.within && <span>in {site.within}</span>}
                            {otherRoutes > 0 && (
                              <span title={site.routes.slice(1).map((r) => r.path).join("\n")}>
                                +{otherRoutes} more route{otherRoutes === 1 ? "" : "s"}
                              </span>
                            )}
                          </CallSiteMeta>
                        )}
                      </CallSiteRow>
                    );
                  })}
                </CallSiteList>
                {group.sites.length > GROUP_PAGE && (
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [group.key]: !showAll }))}
                    style={{ marginTop: "6px", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "12px", color: "inherit", textDecoration: "underline" }}
                    data-testid="infa-usage-code-group-more"
                  >
                    {showAll ? "Show fewer" : `Show all ${group.sites.length}`}
                  </button>
                )}
              </GroupContent>
            )}
          </div>
        );
      })}
    </div>
  );
};
