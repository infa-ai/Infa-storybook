/**
 * EmptyState component - Displays when no usage data is available
 */

import React from "react";
import {
  EmptyStateWrapper,
  EmptyStateTitle,
  EmptyStateText,
  CodeExample,
  DocsLink,
} from "./styles";

export const EmptyState: React.FC = () => {
  return (
    <EmptyStateWrapper>
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
    </EmptyStateWrapper>
  );
};
