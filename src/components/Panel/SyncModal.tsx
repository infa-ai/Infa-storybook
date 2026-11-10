/**
 * SyncModal component - Shows instructions for re-syncing usage data
 */

import React from "react";
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  ModalSection,
  ModalCode,
  ModalLink,
} from "./styles";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>How to Synchronize Usage Data</ModalTitle>
          <ModalCloseButton onClick={onClose}>×</ModalCloseButton>
        </ModalHeader>
        
        <ModalBody>
          <ModalSection>
            <h4>Step 1: Sign in with the Infa CLI</h4>
            <p>Once per machine, from your project&apos;s root. It opens the browser:</p>
            <ModalCode>npx infa auth</ModalCode>
            <ModalCode>npx infa board</ModalCode>
            <p style={{ fontSize: "12px", marginTop: "0.5rem", opacity: 0.8 }}>
              <code>infa board</code> picks the board this repo belongs to. Team boards work too.
            </p>
          </ModalSection>

          <ModalSection>
            <h4>Step 2: Sync</h4>
            <ModalCode>npx infa storybook sync</ModalCode>
            <p style={{ fontSize: "12px", marginTop: "0.5rem", opacity: 0.8 }}>
              Writes <code>src/data/usage-data.json</code>. Each story is linked to its component
              the way <code>infa publish</code> links it, so a component published with{" "}
              <code>npx infa publish src/Button.tsx</code> needs no ids in your stories.
            </p>
          </ModalSection>

          <ModalSection>
            <h4>Step 3: Restart Storybook</h4>
            <p>Storybook reads the data when it starts, so restart (or rebuild) it:</p>
            <ModalCode>npm run storybook</ModalCode>
          </ModalSection>

          <ModalSection>
            <h4>In CI</h4>
            <p>
              Set <code>INFA_ACCESS_TOKEN</code> (an access token from your Infa profile) and{" "}
              <code>INFA_BOARD_ID</code> as secrets, then run <code>npx infa storybook sync</code>{" "}
              before <code>storybook build</code>.
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <ModalLink
                href="https://github.com/infa-ai/Infa-storybook#readme"
                target="_blank"
                rel="noopener noreferrer"
              >
                Setup guide →
              </ModalLink>
            </p>
          </ModalSection>

          <ModalSection style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "1rem" }}>
            <p style={{ fontSize: "12px", opacity: 0.7, margin: 0 }}>
              <strong>Older setup:</strong> <code>INFA_API_KEY=… npx infa-usage-fetch</code> still
              works with a Personal Access Token and <code>mcComponentIds</code> in your stories, for
              boards the token&apos;s account owns. Either way, nothing secret reaches the browser:
              the data file holds only what the panel shows.
            </p>
          </ModalSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

