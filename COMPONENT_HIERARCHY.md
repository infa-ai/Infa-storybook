# Component Hierarchy Diagram

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         Panel.tsx (Main)                         │
│  • Manages state (viewMode, expandedComponents)                 │
│  • Loads usage data                                             │
│  • Orchestrates sub-components                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
       ┌────────▼────────┐            ┌────────▼────────┐
       │  Has Data?      │            │  No Data?       │
       └────────┬────────┘            └────────┬────────┘
                │                               │
                │                               │
       ┌────────▼────────┐            ┌────────▼────────┐
       │  ViewToggle     │            │  EmptyState     │
       │  • Components   │            │  • Instructions │
       │  • Domains      │            │  • Code example │
       └────────┬────────┘            │  • Docs links   │
                │                     └─────────────────┘
       ┌────────┴────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│ Components  │   │  Domains    │
│    View     │   │    View     │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 │
       │                 └────────────────────────┐
       │                                          │
┌──────▼──────────────┐              ┌───────────▼──────────────┐
│ ComponentsView      │              │ DomainsView              │
│ ┌─────────────────┐ │              │ ┌──────────────────────┐ │
│ │ComponentHeader  │ │              │ │ Domain Section       │ │
│ │ • Title         │ │              │ │ ┌──────────────────┐ │ │
│ │ • Labels        │ │              │ │ │ Page Section     │ │ │
│ │ • Description   │ │              │ │ │ • URL            │ │ │
│ │ • Links         │ │              │ │ │ • Cards          │ │ │
│ └─────────────────┘ │              │ │ └──────────────────┘ │ │
│ ┌─────────────────┐ │              │ └──────────────────────┘ │
│ │ ComponentView   │ │              │ ┌──────────────────────┐ │
│ │    Card(s)      │ │              │ │ View Cards           │ │
│ │ • Screenshot    │ │              │ │ • Component labels   │ │
│ │ • Code          │ │              │ │ • Screenshot         │ │
│ │ • URL           │ │              │ │ • Code               │ │
│ │ • View button   │ │              │ │ • View button        │ │
│ └─────────────────┘ │              │ └──────────────────────┘ │
│ ┌─────────────────┐ │              └──────────────────────────┘
│ │ View More/Less  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

## Data Flow

```
┌──────────────────┐
│  usage-data.json │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Panel.tsx      │
│  (loads data)    │
└────────┬─────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ ComponentsView   │  │  DomainsView     │
│ (receives array) │  │  (receives array)│
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │                     │ (calls groupViewsByDomain)
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ ComponentHeader  │  │ Grouped structure│
│ ComponentViewCard│  │ → View cards     │
└──────────────────┘  └──────────────────┘
```

## File Dependencies

```
Panel.tsx
├── imports → types.ts (UsageParameters, ComponentData, UsageDataMap)
├── imports → Panel/ViewToggle.tsx
├── imports → Panel/ComponentsView.tsx
├── imports → Panel/DomainsView.tsx
├── imports → Panel/EmptyState.tsx
└── imports → Panel/styles.ts (PanelContent)

ComponentsView.tsx
├── imports → types.ts (ComponentData)
├── imports → Panel/ComponentHeader.tsx
├── imports → Panel/ComponentViewCard.tsx
└── imports → Panel/styles.ts (ComponentSection, SectionTitle, etc.)

DomainsView.tsx
├── imports → types.ts (ComponentData)
├── imports → Panel/utils.ts (groupViewsByDomain, extractInfaIds, etc.)
└── imports → Panel/styles.ts (DomainSection, PageSection, etc.)

ComponentHeader.tsx
├── imports → types.ts (ComponentData)
└── imports → Panel/styles.ts (ComponentHeaderWrapper, ComponentTitle, etc.)

ComponentViewCard.tsx
├── imports → types.ts (ComponentView)
├── imports → Panel/utils.ts (extractInfaIds, generateInfaLink, truncateUrl)
└── imports → Panel/styles.ts (ComponentViewCardWrapper, Screenshot, etc.)

ViewToggle.tsx
└── imports → Panel/styles.ts (ViewToggleContainer, ToggleButton)

EmptyState.tsx
└── imports → Panel/styles.ts (EmptyStateWrapper, EmptyStateTitle, etc.)

utils.ts
└── imports → types.ts (ComponentData, ComponentView)

styles.ts
└── imports → storybook/theming (styled)
```

## Responsibility Matrix

| Component | Data Management | UI Rendering | Business Logic | State Management |
|-----------|----------------|--------------|----------------|------------------|
| Panel.tsx | ✅ Load data | ❌ Delegates | ✅ Filtering | ✅ Global state |
| ViewToggle.tsx | ❌ | ✅ Toggle UI | ❌ | ❌ Stateless |
| ComponentHeader.tsx | ❌ | ✅ Metadata | ❌ | ❌ Stateless |
| ComponentViewCard.tsx | ❌ | ✅ Card UI | ✅ Link gen | ❌ Stateless |
| ComponentsView.tsx | ❌ | ✅ Layout | ✅ Expand logic | ❌ Uses props |
| DomainsView.tsx | ❌ | ✅ Layout | ✅ Grouping | ❌ Stateless |
| EmptyState.tsx | ❌ | ✅ Static UI | ❌ | ❌ Stateless |
| utils.ts | ❌ | ❌ | ✅ All utils | ❌ |
| styles.ts | ❌ | ✅ Styles | ❌ | ❌ |

## Code Metrics Summary

| Metric | Value |
|--------|-------|
| **Original Panel.tsx** | 684 lines |
| **New Panel.tsx** | 94 lines (86% reduction) |
| **Total sub-components** | 812 lines (9 files) |
| **Average file size** | 90 lines |
| **Number of components** | 6 UI components + 1 utility module + 1 styles module |
| **Cyclomatic complexity** | Significantly reduced |
| **Maintainability index** | Excellent |

## Benefits Visualization

```
┌────────────────────────────────────────────────────────┐
│                    BEFORE                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Single File (684 lines)                  │ │
│  │  ⚠️ Hard to navigate                            │ │
│  │  ⚠️ Complex dependencies                        │ │
│  │  ⚠️ Difficult to test                           │ │
│  │  ⚠️ Hard to maintain                            │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

                         ↓ REFACTOR ↓

┌────────────────────────────────────────────────────────┐
│                     AFTER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Panel.tsx│  │  Utils   │  │  Styles  │            │
│  │ (94 ln)  │  │(103 ln)  │  │(274 ln)  │            │
│  └────┬─────┘  └──────────┘  └──────────┘            │
│       │                                                │
│  ┌────┴─────────────────────────────────────┐         │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │         │
│  │  │View  │ │Header│ │ Card │ │ Views│   │         │
│  │  │Toggle│ │(84ln)│ │(53ln)│ │(168ln│   │         │
│  │  │(35ln)│ │      │ │      │ │      │   │         │
│  │  └──────┘ └──────┘ └──────┘ └──────┘   │         │
│  └──────────────────────────────────────────┘         │
│  ✅ Easy to navigate                                  │
│  ✅ Clear dependencies                                │
│  ✅ Simple to test                                    │
│  ✅ Easy to maintain                                  │
└────────────────────────────────────────────────────────┘
```

## Testing Strategy

```
Unit Tests (Easy to implement now)
├── ViewToggle.test.tsx
│   ├── Renders both buttons
│   ├── Calls onViewModeChange with correct mode
│   └── Shows active state correctly
│
├── ComponentHeader.test.tsx
│   ├── Displays title
│   ├── Renders labels when present
│   ├── Shows description when present
│   └── Renders external links
│
├── ComponentViewCard.test.tsx
│   ├── Displays screenshot
│   ├── Shows code capture
│   ├── Truncates long URLs
│   └── Generates correct Infa links
│
├── ComponentsView.test.tsx
│   ├── Renders all components
│   ├── Expand/collapse works
│   └── Shows correct view counts
│
├── DomainsView.test.tsx
│   ├── Groups by domain correctly
│   ├── Shows page URLs
│   └── Renders view cards
│
├── EmptyState.test.tsx
│   ├── Shows instructions
│   ├── Displays code example
│   └── Links work correctly
│
└── utils.test.ts
    ├── extractDomain() tests
    ├── truncateUrl() tests
    ├── extractInfaIds() tests
    ├── generateInfaLink() tests
    └── groupViewsByDomain() tests
```

This modular structure makes comprehensive testing straightforward and maintainable!
