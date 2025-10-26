# Quick Reference Guide - Panel Component

## 🚀 Quick Start

The Panel component has been refactored into modular sub-components. Here's what you need to know:

## 📁 File Structure

```
src/components/
├── Panel.tsx                      # Main component (import this)
└── Panel/
    ├── ViewToggle.tsx             # View mode selector
    ├── ComponentHeader.tsx        # Component metadata
    ├── ComponentViewCard.tsx      # Single view card
    ├── ComponentsView.tsx         # Components grouping
    ├── DomainsView.tsx           # Domains grouping
    ├── EmptyState.tsx            # Empty state
    ├── utils.ts                  # Helper functions
    ├── styles.ts                 # Styled components
    ├── index.ts                  # Exports
    └── README.md                 # Detailed docs
```

## 🔧 Common Tasks

### Adding a New Feature to Component Header

**File to edit**: `src/components/Panel/ComponentHeader.tsx`

```typescript
// 1. Update props interface
interface ComponentHeaderProps {
  title: string;
  description: string | null;
  labels: ComponentData["labels"];
  externalLinks: ComponentData["external_links"];
  // Add your new prop here
  myNewField?: string;
}

// 2. Add to component
export const ComponentHeader: React.FC<ComponentHeaderProps> = ({
  title,
  description,
  labels,
  externalLinks,
  myNewField, // Destructure here
}) => {
  return (
    <ComponentHeaderWrapper>
      {/* Existing code */}
      {myNewField && <div>{myNewField}</div>}
    </ComponentHeaderWrapper>
  );
};

// 3. Update ComponentsView to pass the prop
<ComponentHeader
  title={data.title}
  description={data.description}
  labels={data.labels}
  externalLinks={data.external_links}
  myNewField={data.myNewField} // Pass it here
/>
```

### Adding a New View Mode

**Files to edit**: 
1. `src/components/Panel/ViewToggle.tsx`
2. Create new view component (e.g., `TimelineView.tsx`)
3. `src/components/Panel.tsx`

```typescript
// 1. Update ViewMode type in ViewToggle.tsx
export type ViewMode = "components" | "domains" | "timeline";

// 2. Add button in ViewToggle.tsx
<ToggleButton
  active={viewMode === "timeline"}
  onClick={() => onViewModeChange("timeline")}
>
  Timeline View
</ToggleButton>

// 3. Create TimelineView.tsx
export const TimelineView: React.FC<TimelineViewProps> = ({ components }) => {
  return <div>Timeline implementation</div>;
};

// 4. Update Panel.tsx
import { TimelineView } from "./Panel/TimelineView";

{viewMode === "components" ? (
  <ComponentsView {...props} />
) : viewMode === "domains" ? (
  <DomainsView {...props} />
) : (
  <TimelineView {...props} />
)}
```

### Adding a New Utility Function

**File to edit**: `src/components/Panel/utils.ts`

```typescript
/**
 * Your new utility function
 */
export const myNewUtility = (input: string): string => {
  // Implementation
  return result;
};

// Don't forget to export from index.ts
export { myNewUtility } from "./utils";
```

### Modifying Styles

**File to edit**: `src/components/Panel/styles.ts`

```typescript
// Add or modify styled components
export const MyNewStyledComponent = styled.div(({ theme }) => ({
  padding: "1rem",
  color: theme.color.defaultText,
  // Your styles
}));

// Use in any component
import { MyNewStyledComponent } from "./styles";
```

## 🎨 Styling Guide

All styles use Storybook's theming system. Common theme properties:

```typescript
theme.background.content      // Main content background
theme.background.hoverable    // Hover backgrounds
theme.background.app          // App background
theme.color.defaultText       // Default text color
theme.color.secondary         // Secondary/accent color
theme.color.border           // Border color
theme.color.mediumdark       // Medium dark text
```

## 🧪 Testing Components

Each component can be tested independently:

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentViewCard } from './ComponentViewCard';

describe('ComponentViewCard', () => {
  it('renders view card correctly', () => {
    const view = {
      title: 'Test View',
      url: 'https://example.com',
      screenshot: 'screenshot.png',
      code: 'const test = true;',
      // ... other required fields
    };
    
    render(<ComponentViewCard view={view} />);
    expect(screen.getByText('Test View')).toBeInTheDocument();
  });
});
```

## 📝 Component Props Reference

### Panel (Main Component)
```typescript
interface PanelProps {
  active: boolean; // Whether panel is active
}
```

### ViewToggle
```typescript
interface ViewToggleProps {
  viewMode: ViewMode;                    // Current mode
  onViewModeChange: (mode: ViewMode) => void; // Change handler
}
```

### ComponentHeader
```typescript
interface ComponentHeaderProps {
  title: string;                         // Component title
  description: string | null;            // Optional description
  labels: ComponentData["labels"];       // Label array
  externalLinks: ComponentData["external_links"]; // Links array
}
```

### ComponentViewCard
```typescript
interface ComponentViewCardProps {
  view: ComponentView;  // View data object
}
```

### ComponentsView
```typescript
interface ComponentsViewProps {
  components: Array<{ id: string; data: ComponentData }>;
  expandedComponents: Record<string, boolean>;
  onToggleExpanded: (componentId: string) => void;
}
```

### DomainsView
```typescript
interface DomainsViewProps {
  components: Array<{ id: string; data: ComponentData }>;
}
```

### EmptyState
```typescript
// No props - static component
```

## 🛠️ Utility Functions Reference

### extractDomain(url: string): string
Extracts hostname from URL.

```typescript
extractDomain('https://example.com/path')
// Returns: 'example.com'
```

### truncateUrl(url: string, maxLength?: number): string
Shortens URLs longer than maxLength (default: 60).

```typescript
truncateUrl('https://example.com/very/long/path', 20)
// Returns: 'https://example.com/...'
```

### extractInfaIds(screenshotUrl: string | null | undefined)
Parses board ID and component view ID from screenshot URL.

```typescript
extractInfaIds('https://...public_screenshots/b_29btSDq0/screenshot-cv_9sdFEp70-...')
// Returns: { boardId: 'b_29btSDq0', componentViewId: 'cv_9sdFEp70' }
```

### generateInfaLink(view, boardId, componentViewId): string
Creates Infa deep link or returns original URL.

```typescript
generateInfaLink(view, 'b_123', 'cv_456')
// Returns: 'https://infa.ai/open?board=b_123&componentView=cv_456'
```

### groupViewsByDomain(components): Record<string, Record<string, GroupedView[]>>
Groups component views by domain and URL.

```typescript
groupViewsByDomain(components)
// Returns: { 'example.com': { 'https://example.com': [views] } }
```

## 🐛 Debugging Tips

### Component not rendering?
1. Check if data is being passed correctly as props
2. Verify import paths are correct
3. Check console for TypeScript errors

### Styles not applying?
1. Make sure styled component is imported from `./styles`
2. Check if theme properties are correct
3. Verify component is wrapped in theme provider

### Utility function not found?
1. Check if exported from `utils.ts`
2. Verify export in `index.ts`
3. Use correct import path

## 📚 Additional Resources

- **Detailed Architecture**: See `Panel/README.md`
- **Refactoring Details**: See `REFACTORING_SUMMARY.md`
- **Verification**: See `REFACTORING_VERIFICATION.md`
- **Component Hierarchy**: See `COMPONENT_HIERARCHY.md`

## 💡 Best Practices

1. **Keep components small**: Each component should do one thing well
2. **Use TypeScript**: Always define prop interfaces
3. **Document changes**: Add comments for complex logic
4. **Test in isolation**: Write unit tests for each component
5. **Follow naming conventions**: Use descriptive names
6. **Maintain separation**: Keep logic, styles, and UI separate

## 🚨 Common Pitfalls to Avoid

❌ **Don't** put business logic in styled components
✅ **Do** use utility functions or component logic

❌ **Don't** directly modify shared state in sub-components
✅ **Do** use callbacks passed from parent

❌ **Don't** import from parent components
✅ **Do** import from sibling components or shared modules

❌ **Don't** create inline styled components in render
✅ **Do** define styled components outside or in styles.ts

❌ **Don't** duplicate utility functions
✅ **Do** add to utils.ts and reuse

## ✅ Quick Checklist for Changes

Before committing changes:
- [ ] No linter errors
- [ ] TypeScript types are correct
- [ ] All imports are valid
- [ ] Component renders correctly
- [ ] Props are properly typed
- [ ] Code is documented
- [ ] Follows existing patterns
- [ ] No functionality broken

## 🎯 Performance Tips

- Use `React.memo()` for components that receive same props often
- Lazy load images with `loading="lazy"`
- Keep styled components outside render functions
- Avoid inline functions in props when possible
- Use useCallback for event handlers if needed

---

**Need Help?** Check the detailed README in `src/components/Panel/README.md`
