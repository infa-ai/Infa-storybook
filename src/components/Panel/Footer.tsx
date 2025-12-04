/**
 * Footer component - Displays sync status, Synchronize button, and attribution links
 */

import React, { useMemo } from "react";
import {
  FooterWrapper,
  FooterText,
  FooterLink,
  FooterTip,
  SyncStatusContainer,
  SyncStatusText,
  SyncButton,
} from "./styles";

interface FooterProps {
  lastSyncedAt?: string;
  onSyncClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lastSyncedAt,
  onSyncClick,
}) => {
  const timeAgo = useMemo(() => {
    if (!lastSyncedAt) return null;

    const now = new Date();
    const synced = new Date(lastSyncedAt);
    const diffMs = now.getTime() - synced.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else {
      return "just now";
    }
  }, [lastSyncedAt]);

  return (
    <FooterWrapper>
      <FooterTip>
        Did you know you can connect multiple Infa components to a single story,
        helping you capture deviations and even references?{" "}
        <FooterLink
          href="https://infa.ai/docs/integrations/index"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn how
        </FooterLink>
      </FooterTip>
      <SyncStatusContainer>
        <SyncButton onClick={onSyncClick}>Synchronize</SyncButton>
        <SyncStatusText>
          Last synced: {lastSyncedAt ? timeAgo : "some time ago"}
        </SyncStatusText>
      </SyncStatusContainer>
      <FooterText>
        Usage Insights Powered by{" "}
        <FooterLink
          href="https://infa.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Infa
        </FooterLink>
        {" · "}
        <FooterLink
          href="https://infa.ai/docs/integrations/index"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
        </FooterLink>
        {" · "}
        <FooterLink
          href="https://github.com/infa-ai/Infa-storybook"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </FooterLink>
      </FooterText>
    </FooterWrapper>
  );
};
