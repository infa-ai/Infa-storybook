# Panel Component Architecture

This directory contains the refactored Panel component, which has been broken down into smaller, more maintainable sub-components. Each sub-component has a clear, single responsibility, making the codebase easier to understand, test, and maintain.

## Directory Structure

```
Panel/
├── index.ts                  # Exports all sub-components and utilities
├── utils.ts                  # Utility functions for URL parsing
├── styles.ts                 # All styled components
├── ComponentHeader.tsx       # Displays component metadata
├── ComponentViewCard.tsx     # Displays individual component view
├── ComponentsView.tsx        # Groups views by component
└── EmptyState.tsx           # Shown when no data is available
```

## Sub-Components

### ComponentHeader

- **Purpose**: Displays component metadata including title, labels, description, and external links
- **Props**:
  - `title`: Component title
  - `description`: Optional description
  - `labels`: Array of label objects
  - `externalLinks`: Array of external link objects
- **Responsibility**: Component metadata presentation

### ComponentViewCard

- **Purpose**: Displays a single component view with screenshot, code snippet, and action button
- **Props**:
  - `view`: ComponentView object
- **Responsibility**: Individual view card rendering

### ComponentsView

- **Purpose**: Organizes and displays component views grouped by component
- **Props**:
  - `components`: Array of component data
  - `expandedComponents`: State tracking which components are expanded
  - `onToggleExpanded`: Callback to toggle expansion
- **Responsibility**: Component-grouped view logic

### EmptyState

- **Purpose**: Shows helpful instructions when no usage data is available
- **Props**: None
- **Responsibility**: Empty state presentation

## Utilities (utils.ts)

### extractDomain(url: string): string

Extracts the hostname from a URL.

### truncateUrl(url: string, maxLength?: number): string

Shortens URLs that exceed the specified length (default: 60 characters).

### extractInfaIds(screenshotUrl: string | null | undefined): object

Parses board ID and component view ID from Infa screenshot URLs.

### generateInfaLink(view: ComponentView, boardId: string | null, componentViewId: string | null): string

Generates a deep link to Infa if IDs are available, otherwise returns the original URL.

## Design Principles

### Single Responsibility

Each component handles exactly one concern:

- ComponentHeader: Metadata display
- ComponentViewCard: Individual card display
- ComponentsView: Component grouping logic
- EmptyState: Empty state UI

### Separation of Concerns

- **Styles**: Centralized in `styles.ts`
- **Logic**: Utility functions in `utils.ts`
- **UI**: Component files focus on rendering

### Maintainability Benefits

1. **Easy to test**: Each component can be tested in isolation
2. **Easy to modify**: Changes to one component don't affect others
3. **Easy to understand**: Clear file names and single responsibilities
4. **Easy to reuse**: Sub-components can be used independently if needed
5. **Better code organization**: Related code is grouped together

## Main Panel Component

The main `Panel.tsx` file now acts as an orchestrator:

1. Manages global state (expanded components)
2. Loads usage data
3. Delegates rendering to appropriate sub-components
4. Handles parameter extraction

This makes the main component much cleaner and easier to understand at a glance.

## Adding New Features

To add new features:

1. **New metadata field**: Update `ComponentHeader.tsx` to handle the new field
2. **New utility function**: Add it to `utils.ts` with appropriate documentation
3. **New styling**: Add styled components to `styles.ts`

## Testing Strategy

Each sub-component can be tested independently:

```typescript
import { ComponentViewCard } from './ComponentViewCard';
import { render } from '@testing-library/react';

test('renders component view card', () => {
  const view = { title: 'Test', url: 'https://example.com', ... };
  render(<ComponentViewCard view={view} />);
  // assertions...
});
```

This modular structure makes unit testing straightforward and comprehensive.
