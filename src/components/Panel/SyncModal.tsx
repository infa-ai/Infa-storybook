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
            <h4>Step 1: Tag Components in Infa</h4>
            <p>
              Use the Infa browser extension or dashboard to tag components in your products.
              Click the "Tag Components" button to open your Infa board.
            </p>
          </ModalSection>

          <ModalSection>
            <h4>Step 2: Run the Fetch Script</h4>
            <p>Execute the following command to pull the latest data from Infa:</p>
            <ModalCode>npm run fetch-usage-data</ModalCode>
            <p style={{ fontSize: "12px", marginTop: "0.5rem", opacity: 0.8 }}>
              This will update <code>src/data/usage-data.json</code> with fresh component data.
            </p>
          </ModalSection>

          <ModalSection>
            <h4>Step 3: Rebuild Storybook</h4>
            <p>Rebuild your Storybook to see the updated data:</p>
            <ModalCode>npm run storybook</ModalCode>
            <p style={{ fontSize: "12px", marginTop: "0.5rem", opacity: 0.8 }}>
              The Usage panel will immediately show all newly tagged components.
            </p>
          </ModalSection>

          <ModalSection>
            <h4>Automated Sync (Recommended)</h4>
            <p>
              For continuous updates, integrate the fetch script into your CI/CD pipeline.
              This ensures usage data is always fresh when you deploy Storybook.
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <ModalLink
                href="https://infa.ai/docs/integrations/index"
                target="_blank"
                rel="noopener noreferrer"
              >
                View CI/CD Integration Guide →
              </ModalLink>
            </p>
          </ModalSection>

          <ModalSection style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: "1rem" }}>
            <p style={{ fontSize: "12px", opacity: 0.7, margin: 0 }}>
              <strong>Note:</strong> Your Infa API key is only used during build time and never
              exposed to the browser. Tagged components and deep links continue to work even
              after subscription deactivation.
            </p>
          </ModalSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

