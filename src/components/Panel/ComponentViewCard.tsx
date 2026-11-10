/**
 * ComponentViewCard component - one usage of a component: its screenshot (or
 * live render), where it was found (a Browser or Code badge) and its locator
 * (the file for code; the page for the browser, the XPath as a quieter line).
 */

import React, { useState } from "react";
import { ArrowRightIcon } from "@storybook/icons";
import type { ComponentView } from "../../types";
import {
  ComponentViewCardWrapper,
  ViewCardTitle,
  LocatorRow,
  LocatorText,
  SourceBadge,
  XPathContainer,
  XPathText,
  XPathArrowButton,
  ViewChipRow,
  ViewChip,
  LiveToggle,
} from "./styles";
import { extractInfaIds, generateInfaLink, HEALTH_COPY, SOURCE_KIND_COPY, viewLocator } from "./utils";
import ImagePreview from "./ImagePreview";
import { CodePreview } from "./CodePreview";
import { LivePreview } from "./LivePreview";

interface ComponentViewCardProps {
  view: ComponentView;
  boardId?: string;
  /** The view's component (`mc_…`), for the link to its page on the board. */
  componentId?: string;
  /** The component's page as `infa storybook sync` wrote it. */
  boardUrl?: string;
}

export const ComponentViewCard: React.FC<ComponentViewCardProps> = ({
  view,
  boardId: propBoardId,
  componentId,
  boardUrl,
}) => {
  const [showLive, setShowLive] = useState(false);
  // The board from the data, else from the screenshot's storage path.
  const boardId = propBoardId || extractInfaIds(view.screenshot).boardId;

  // The component's page on the board; the captured page when the ids are unknown.
  const infaLink = generateInfaLink(view, boardId, componentId ?? null, boardUrl);
  const health = view.health ? HEALTH_COPY[view.health.state] : null;
  const live = showLive && view.preview_html_url;
  const kind = view.sourceKind ? SOURCE_KIND_COPY[view.sourceKind] : null;
  const locator = viewLocator(view);

  return (
    <ComponentViewCardWrapper
      data-testid="infa-usage-view"
      data-view-id={view.id}
      data-source-kind={view.sourceKind ?? undefined}
      data-screen-id={view.screenId ?? undefined}
    >
      {live ? (
        <div style={{ margin: "6px", width: "calc(100% - 12px)" }}>
          <LivePreview url={view.preview_html_url!} title={view.title} />
        </div>
      ) : view.screenshot && (
        <div style={{ margin: "6px", width: "calc(100% - 12px)" }}>
          <ImagePreview
            serverImageSources={[{ url: view.screenshot }]}
            type="component"
            mode="preview"
          />
        </div>
      )}

      <div
        style={{
          padding: "12px 16px 0px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {(kind || locator.primary) && (
          <LocatorRow>
            {kind && view.sourceKind && (
              <SourceBadge kind={view.sourceKind} title={kind.title} data-testid="infa-usage-view-source-badge">
                {kind.label}
              </SourceBadge>
            )}
            {locator.primary && (
              <LocatorText title={view.source ?? locator.primary} data-testid="infa-usage-view-locator">
                {locator.primary}
              </LocatorText>
            )}
          </LocatorRow>
        )}
        <ViewCardTitle>{view.title}</ViewCardTitle>
        {(view.is_default || health || view.preview_html_url) && (
          <ViewChipRow>
            {view.is_default && (
              <ViewChip data-testid="infa-usage-view-default">Default</ViewChip>
            )}
            {health && (
              <ViewChip
                tone={health.tone}
                title={view.health?.reason ?? `Checked ${view.health?.checkedAt ?? ""}`.trim()}
                data-testid="infa-usage-view-health"
                data-state={view.health?.state}
              >
                {health.label}
              </ViewChip>
            )}
            {view.preview_html_url && (
              <LiveToggle
                type="button"
                active={showLive}
                aria-pressed={showLive}
                onClick={() => setShowLive((v) => !v)}
                title={showLive ? "Show the screenshot" : "Play the live render"}
                data-testid="infa-usage-view-live-toggle"
              >
                {showLive ? "Screenshot" : "Live"}
              </LiveToggle>
            )}
          </ViewChipRow>
        )}
      </div>

      {view.code && (
        <div style={{ margin: "12px 6px 2px", width: "calc(100% - 12px)" }}>
          <CodePreview
            htmlCode={{ selected: view.code }}
            defaultCollapsed={true}
          />
        </div>
      )}

      {infaLink && (
        <div
          style={{
            paddingLeft: "16px",
            paddingRight: "6px",
            paddingBottom: "6px",
          }}
        >
          <XPathContainer>
            {/* The XPath, for a usage found in the browser: secondary, full text on hover. */}
            <XPathText title={locator.secondary ?? undefined} data-testid="infa-usage-view-xpath">
              {locator.secondary ?? ""}
            </XPathText>
            <XPathArrowButton
              href={infaLink}
              target="_blank"
              rel="noopener noreferrer"
              title={infaLink === view.url ? "View in Page" : "Open in Infa"}
            >
              <ArrowRightIcon />
            </XPathArrowButton>
          </XPathContainer>
        </div>
      )}
    </ComponentViewCardWrapper>
  );
};
