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
        This story has no Infa components yet. To show where they are used:
      </EmptyStateText>
      <EmptyStateText>
        1. Publish the component to your board with the Infa CLI
        (once: <code>npx infa auth</code> and <code>npx infa board</code>)
      </EmptyStateText>
      <CodeExample>{`npx infa publish src/components/Button.tsx`}</CodeExample>
      <EmptyStateText>
        2. Sync, then restart Storybook. Stories link to their components by
        themselves.
      </EmptyStateText>
      <CodeExample>{`npx infa storybook sync`}</CodeExample>
      <EmptyStateText>
        Components tagged in your product with the{" "}
        <DocsLink
          href="https://infa.ai/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Infa browser extension
        </DocsLink>{" "}
        can be named in the story instead:
      </EmptyStateText>
      <CodeExample>
        {`parameters: { usage: { mcComponentIds: ['mc_xxxxxxxx'] } }`}
      </CodeExample>
      <EmptyStateText style={{ marginTop: "1rem" }}>
        <DocsLink
          href="https://github.com/infa-ai/Infa-storybook#readme"
          target="_blank"
          rel="noopener noreferrer"
        >
          View full documentation →
        </DocsLink>
      </EmptyStateText>
    </EmptyStateWrapper>
  );
};
