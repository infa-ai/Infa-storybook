import React, { memo } from "react";
import { AddonPanel } from "storybook/internal/components";
import { Placeholder } from "storybook/internal/components";
import { useParameter } from "storybook/manager-api";
import { styled, useTheme } from "storybook/theming";

import type { UsageParameters, UsageDataMap } from "../types";

interface PanelProps {
  active: boolean;
}

const PanelContent = styled.div(({ theme }) => ({
  padding: "1.5rem",
  background: theme.background.content,
  minHeight: "200px",
}));

const ComponentList = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginTop: "1rem",
});

const ComponentItem = styled.div(({ theme }) => ({
  padding: "1rem",
  background: theme.background.hoverable,
  borderRadius: "4px",
  border: `1px solid ${theme.color.border}`,
}));

const ComponentTitle = styled.h3(({ theme }) => ({
  margin: 0,
  fontSize: "14px",
  fontWeight: 600,
  color: theme.color.defaultText,
}));

const ComponentId = styled.p(({ theme }) => ({
  margin: "0.5rem 0 0 0",
  fontSize: "12px",
  color: theme.color.mediumdark,
  fontFamily: "monospace",
}));

const EmptyState = styled.div(({ theme }) => ({
  textAlign: "center",
  padding: "2rem",
  color: theme.color.mediumdark,
}));

const EmptyStateTitle = styled.h3(({ theme }) => ({
  margin: "0 0 0.5rem 0",
  fontSize: "16px",
  color: theme.color.defaultText,
}));

const EmptyStateText = styled.p(({ theme }) => ({
  margin: "0.5rem 0",
  fontSize: "14px",
  lineHeight: 1.6,
}));

const CodeExample = styled.pre(({ theme }) => ({
  marginTop: "1rem",
  padding: "1rem",
  background: theme.background.app,
  borderRadius: "4px",
  fontSize: "12px",
  textAlign: "left",
  overflow: "auto",
}));

// Import usage data with fallback to empty object
let usageData: UsageDataMap = {};
try {
  usageData = require("../data/usage-data.json");
} catch (e) {
  console.warn("Usage data not found. Using empty data set.");
}

export const Panel: React.FC<PanelProps> = memo(function UsagePanel(props) {
  const theme = useTheme();

  // Get mcComponentIds from story parameters
  const params = useParameter<UsageParameters>("usage", { mcComponentIds: [] });
  const mcComponentIds = params.mcComponentIds || [];

  const hasComponents = mcComponentIds.length > 0;

  return (
    <AddonPanel {...props}>
      <PanelContent>
        {hasComponents ? (
          <>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              Usage Information
            </h2>
            <ComponentList>
              {mcComponentIds.map((componentId) => {
                const component = usageData[componentId];
                return (
                  <ComponentItem key={componentId}>
                    <ComponentTitle>
                      {component?.title || "Unknown Component"}
                    </ComponentTitle>
                    <ComponentId>ID: {componentId}</ComponentId>
                    {!component && (
                      <p
                        style={{
                          margin: "0.5rem 0 0 0",
                          fontSize: "12px",
                          color: theme.color.warning,
                        }}
                      >
                        ⚠️ No data found for this component ID
                      </p>
                    )}
                  </ComponentItem>
                );
              })}
            </ComponentList>
          </>
        ) : (
          <EmptyState>
            <EmptyStateTitle>No Usage Data</EmptyStateTitle>
            <EmptyStateText>
              Configure main component IDs in your story parameters to see usage
              information.
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
          </EmptyState>
        )}
      </PanelContent>
    </AddonPanel>
  );
});
