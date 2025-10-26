/**
 * ComponentsView component - Displays components grouped by component
 */

import React from "react";
import type { ComponentData } from "../../types";
import { ComponentHeader } from "./ComponentHeader";
import { ComponentViewCard } from "./ComponentViewCard";
import {
  ComponentSection,
  SectionTitle,
  ComponentViewsGrid,
  ViewMoreButton,
} from "./styles";

interface ComponentsViewProps {
  components: Array<{ id: string; data: ComponentData }>;
  expandedComponents: Record<string, boolean>;
  onToggleExpanded: (componentId: string) => void;
}

export const ComponentsView: React.FC<ComponentsViewProps> = ({
  components,
  expandedComponents,
  onToggleExpanded,
}) => {
  return (
    <>
      {components.map(({ id, data }) => {
        const isExpanded = expandedComponents[id];
        const visibleViews = isExpanded
          ? data.component_views
          : data.component_views.slice(0, 5);
        const hasMore = data.component_views.length > 5;

        return (
          <ComponentSection key={id}>
            <ComponentHeader
              title={data.title}
              description={data.description}
              labels={data.labels}
              externalLinks={data.external_links}
            />

            {data.component_views && data.component_views.length > 0 && (
              <>
                <SectionTitle>
                  Component Views ({data.component_views.length})
                </SectionTitle>
                <ComponentViewsGrid>
                  {visibleViews.map((view, idx) => (
                    <ComponentViewCard key={idx} view={view} />
                  ))}
                </ComponentViewsGrid>

                {hasMore && !isExpanded && (
                  <ViewMoreButton onClick={() => onToggleExpanded(id)}>
                    View More ({data.component_views.length - 5} more)
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
