# Infa Storybook Addon

[![npm version](https://badge.fury.io/js/storybook-infa-usage.svg)](https://www.npmjs.com/package/storybook-infa-usage)
[![npm downloads](https://img.shields.io/npm/dm/storybook-infa-usage.svg)](https://www.npmjs.com/package/storybook-infa-usage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Storybook addon that connects your component documentation with real-world product usage. See where and how your design system components are actually being used across your products—directly in Storybook.

## The Problem

Design system teams often struggle to connect Storybook components with their real-world product usage. While Storybook provides a centralized place to document and showcase components, it doesn't show:

- **Where components are actually used** across product UIs
- **Whether they're used consistently** or with deviations
- **How often they appear**, and in which product contexts
- **Adoption metrics** per product and page

This creates a gap between design documentation and reality, making it challenging to communicate adoption, identify inconsistencies, and prioritize refactoring efforts.

## The Solution

The Infa Storybook Addon adds a **Usage** panel to every story, connecting Storybook component previews with live product usage data. This empowers teams to:

- **See real usage instances** of components across products and pages
- **Identify deviations and variants** using labels (e.g., "Deviation", "To Refactor", "Reference")
- **Track adoption** per product and page _(coming soon: visual real estate ratio, DOM nodes ratio)_
- **Collaborate with context** - share not just the component, but where it lives in production
- **Tag components in browser** - all data syncs via API during build time

Storybook remains your component playground and source of truth, while Infa serves as the adoption and usage discovery engine. This addon bridges them seamlessly.

## Features

- Display actual usage instances with product URLs, XPaths, and screenshots
- Organize components with labels (deviations, references, refactoring candidates)
- Connect external documentation and design system resources
- Secure build-time data injection (no API keys exposed to browsers)
- Framework-agnostic

## How It Works

The addon consists of two parts that work together:

### Part 1: CI/CD Data Fetching (Build-Time)

A Node.js script that runs during your build process (locally or in CI/CD):

1. Scans your story files for Infa main component IDs
2. Fetches component data from the Infa API (title, description, usage instances, labels, etc.)
3. Generates `src/data/usage-data.json` with the fetched data

**Key Benefits:**

- **Full Control**: Runs at build time, giving you complete control over when data is fetched
- **Secure**: Your Infa API key never gets exposed to the browser or end users
- **Always Fresh**: Tag new components in Infa, rebuild Storybook, and immediately see them in the Usage panel
- **No Runtime Dependencies**: No API calls from the browser, keeping your Storybook fast

### Part 2: Storybook Addon (Browser)

A Storybook addon that runs in the browser:

1. Reads the pre-generated `usage-data.json` file
2. Displays component usage information in a dedicated "Usage" panel
3. Shows where components appear in your products with visual evidence

## Prerequisites

To use this addon, you'll need:

- **Infa Pro Account** - The Infa API requires a Pro subscription (only $20/month)
- **Get started at**: [infa.ai](https://infa.ai)

**Good news:** Once you've tagged your components and added deep links, they'll continue to work even after subscription deactivation. You'll still be able to see where and how components are used in your products.

## Installation

```bash
npm i storybook-infa-usage
```

## Quick Start

### 1. Register the Addon

Add to your `.storybook/main.ts`:

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/your-framework";

const config: StorybookConfig = {
  addons: [
    "@storybook/addon-docs",
    "storybook-infa-usage", // Add this line
  ],
};

export default config;
```

### 2. Configure Your Stories

Add Infa main component IDs to your story parameters:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    usage: {
      mcComponentIds: ["mc_abc12345"], // Your Infa main component ID
    },
  },
};

export default meta;
```

**Multiple Components:**

Connect multiple Infa components to a single story:

```typescript
export default {
  component: ComplexButton,
  parameters: {
    usage: {
      mcComponentIds: [
        "mc_abc12345", // Primary button component
        "mc_def67890", // Icon component used within button
      ],
    },
  },
};
```

**Story-Level Override:**

Override component IDs at the story level:

```typescript
export const Primary: StoryObj<typeof Button> = {
  parameters: {
    usage: {
      mcComponentIds: ["mc_primary_variant"],
    },
  },
};

export const Secondary: StoryObj<typeof Button> = {
  parameters: {
    usage: {
      mcComponentIds: ["mc_secondary_variant"],
    },
  },
};
```

### 3. Set Up Data Fetching

The data fetching script is included in the package. Set it up to run during your build:

1. **Copy the integration script** to your project (example provided in the package):

```bash
mkdir -p scripts
cp node_modules/storybook-infa-usage/scripts/infa-integration.js scripts/
```

> **Note:** You can customize this script for your specific needs. It's designed to be modified!

2. **Install required dependencies:**

```bash
npm install --save-dev glob dotenv
```

3. **Set your Infa API key:**

```bash
export INFA_API_KEY="your-api-key-here"
```

Or create a `.env` file:

```
INFA_API_KEY=your-api-key-here
```

4. **Add script to package.json:**

```json
{
  "scripts": {
    "fetch-usage-data": "node scripts/infa-integration.js"
  }
}
```

5. **Run the script:**

```bash
npm run fetch-usage-data
```

This generates `src/data/usage-data.json` with your component usage data.

### 4. Run Storybook

```bash
npm run storybook
```

Open any story with configured `mcComponentIds` and check the **Usage** panel!

## Fetching Usage Data from Infa

The integration script runs at build time, giving you full control over your data pipeline and keeping your Infa API key secure.

### The Workflow

1. **Tag components in Infa** - Use the Infa browser extension or dashboard to tag components in your products
2. **Configure your stories** - Add `mcComponentIds` to your story parameters
3. **Run the fetch script** - Execute `npm run fetch-usage-data` to pull the latest data
4. **Rebuild Storybook** - The Usage panel immediately shows all tagged components

This build-time approach means you can continuously tag new components in Infa and see them in Storybook with a simple rebuild—no code changes needed!

### What Data Gets Fetched

The script fetches rich component data from Infa's API. For each main component ID in your stories:

- **Title & Description**: Component name and documentation
- **Component Views**: Actual instances where the component appears in products
  - Product page URL
  - XPath location in the DOM
  - Screenshot (if available)
  - Visual context of where users see this component
- **Labels**: Tags for organization (e.g., "Deviation", "Reference", "To Refactor")
- **External Links**: Links to design docs, component libraries, or other resources
- **Query**: CSS selector or query used to identify the component

### Component Views Explained

**Component Views** are the heart of this addon. Each view represents a real instance of your component in a product:

- **URL**: The exact page where the component appears (e.g., `https://yourapp.com/dashboard`)
- **XPath**: The DOM path to locate the component (e.g., `//*[@id="primary-cta"]`)
- **Screenshot**: Visual proof of the component in context
- **Title**: Descriptive name (e.g., "Dashboard Primary CTA", "Login Button")

This lets you see not just _that_ a component is used, but **where** and **how often** across your product landscape.

### Upcoming Adoption Metrics

We're adding quantitative adoption tracking:

- **Visual Real Estate Ratio**: Percentage of screen space occupied by the component
- **DOM Nodes Ratio**: Proportion of DOM nodes belonging to the component
- **Per-Product, Per-Page Tracking**: See adoption metrics broken down by product and page

These metrics will help you demonstrate actual adoption—what users see, not just what's in Figma or code repositories.

### Automated Data Fetching (Recommended)

Integrate data fetching into your CI/CD pipeline so usage data is always fresh:

```yaml
# .github/workflows/storybook.yml
name: Build and Deploy Storybook

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Fetch usage data from Infa
        env:
          INFA_API_KEY: ${{ secrets.INFA_API_KEY }}
        run: npm run fetch-usage-data

      - name: Build Storybook
        run: npm run build-storybook

      - name: Deploy
        # Your deployment step here
        run: npm run deploy-storybook
```

**Best Practices:**

- Add `src/data/usage-data.json` to `.gitignore` and fetch fresh data in CI. This keeps your repo clean and ensures data is always up-to-date.
- Store your `INFA_API_KEY` in GitHub Secrets or your CI platform's secret management
- The build-time approach means your API key is never exposed to end users
- Tag new components in Infa anytime, then rebuild to see them instantly in Storybook

## Understanding the Usage Panel

When you configure a story with `mcComponentIds`, the Usage panel displays:

### 1. Component Overview

- **Title**: Component name from Infa
- **ID**: Main component ID for reference
- **Description**: Full component documentation (supports markdown and images)

### 2. Component Views

Shows every instance where this component appears in your products:

```
Component Views (6)
  • Dashboard Primary Button
    https://yourapp.com/dashboard
    XPath: //*[@id="cta-button"]
    Screenshot: [thumbnail]

  • Login Submit Button
    https://yourapp.com/login
    XPath: //button[@type="submit"]
    Screenshot: [thumbnail]
```

Each view gives you:

- Direct link to the product page
- Technical location (XPath) for developers
- Visual screenshot for context

### 3. Labels

Organize and categorize components:

- **Deviation**: Component used differently than designed
- **Reference**: Good example to follow
- **To Refactor**: Needs updating to match design system
- **Custom labels**: Create your own in Infa

Labels help you:

- Identify inconsistencies across products
- Prioritize refactoring work
- Share examples with your team

### 4. External Links

Quick access to related resources:

- Design system documentation
- Component library (e.g., React Storybook)
- Figma designs
- GitHub repositories

### 5. Query

CSS selector or DOM query used to find the component in products. Useful for developers investigating usage.

## Data File Format

The generated `src/data/usage-data.json` follows this structure:

```json
{
  "mc_abc12345": {
    "title": "Primary Button",
    "description": "Main call-to-action button used across products...",
    "query": "button.btn-primary",
    "external_links": [
      {
        "title": "Design System Docs",
        "url": "https://design.yourcompany.com/button"
      }
    ],
    "labels": [
      {
        "title": "Reference",
        "description": "Good implementation example",
        "color": "#10b981"
      }
    ],
    "component_views": [
      {
        "title": "Dashboard CTA",
        "url": "https://app.yourcompany.com/dashboard",
        "x_path": "//*[@id=\"main-cta\"]",
        "screenshot": "https://cdn.infa.ai/screenshots/abc123.png",
        "code": null,
        "is_domain_specific": false,
        "page_id": null
      }
    ]
  }
}
```

### TypeScript Types

The addon includes full TypeScript definitions:

```typescript
interface ComponentData {
  title: string;
  description: string | null;
  query: string | null;
  external_links: ExternalLink[];
  labels: Label[];
  component_views: ComponentView[];
}

interface ComponentView {
  title: string;
  url: string;
  x_path: string;
  screenshot: string | null;
  code: string | null;
  is_domain_specific: boolean;
  page_id: string | null;
}

interface Label {
  title: string;
  description: string | null;
  color: string;
}

interface ExternalLink {
  title: string;
  url: string;
}

type UsageDataMap = Record<string, ComponentData>;
```

See `node_modules/storybook-infa-usage/dist/types.d.ts` for full definitions.

## Getting Infa Main Component IDs

To connect your stories to Infa components, you need main component IDs:

1. **Sign up for Infa Pro** at [infa.ai](https://infa.ai) ($20/month)
2. **Tag components** in your products using the browser extension or dashboard
3. **Get component IDs** - found in component detail pages or the browser extension
4. **Format**: IDs typically look like `mc_abc12345`

You can find component IDs in:

- Component detail pages in Infa
- Infa API responses
- Browser extension when tagging components

**Remember:** Once tagged, your component deep links work forever—even if you pause your subscription later. You'll retain access to all the usage data you've already captured.

## Custom Data Sources (Advanced)

While this addon is designed for Infa, you can use custom data sources by creating your own integration script. The addon simply reads from `src/data/usage-data.json`—it doesn't care how the file was generated.

### Custom Integration Example

```javascript
// scripts/custom-integration.js
const fs = require("fs");

async function fetchFromYourAPI() {
  // Your custom logic here
  const response = await fetch("https://your-api.com/components");
  const data = await response.json();

  // Transform to the expected format
  const usageData = {};
  data.forEach((component) => {
    usageData[component.id] = {
      title: component.name,
      description: component.docs,
      query: component.selector,
      external_links: [],
      labels: [],
      component_views: component.instances.map((instance) => ({
        title: instance.name,
        url: instance.url,
        x_path: instance.xpath,
        screenshot: instance.screenshot,
        code: null,
        is_domain_specific: false,
        page_id: null,
      })),
    };
  });

  fs.writeFileSync(
    "src/data/usage-data.json",
    JSON.stringify(usageData, null, 2),
  );
}

fetchFromYourAPI();
```

**Note:** Infa provides the most comprehensive design system usage data, including automated component detection, screenshot generation, and deviation tracking.

## Development

### Running the Example Storybook

```bash
npm install
npm run storybook
```

### Development Mode with Auto-Rebuild

For development with automatic rebuilding when you make changes to the addon:

```bash
npm run start
```

This runs both the addon build in watch mode and Storybook in parallel. Changes to addon source files will automatically rebuild and reload in Storybook.

### Building the Addon

```bash
npm run build
```

## API Reference

### Story Parameters

Add the `usage` parameter to your story metadata:

```typescript
interface UsageParameters {
  mcComponentIds: string[];
}
```

**Usage:**

```typescript
parameters: {
  usage: {
    mcComponentIds: ["mc_id1", "mc_id2"];
  }
}
```

## Troubleshooting

### Panel shows "No Usage Data"

- Verify you've added the `usage` parameter to your story
- Check that `mcComponentIds` is an array of strings
- Ensure you've run `npm run fetch-usage-data` to generate the data file
- Confirm `src/data/usage-data.json` exists and contains your component IDs

### Component shows "Unknown Component"

- The component ID exists in story parameters but not in `usage-data.json`
- Check that the ID format is correct (e.g., `mc_abc12345`)
- Run `npm run fetch-usage-data` to update the data file
- Verify your Infa API key has access to these components

### Data not updating

- Make sure to rebuild Storybook after updating `usage-data.json`
- Clear your browser cache if old data persists
- Check the browser console for any errors
- Verify the data file is being bundled correctly (check Network tab)

### Fetch script fails

- Verify `INFA_API_KEY` environment variable is set
- Check your API key has the correct permissions
- Ensure you have network access to `api.infa.ai`
- Review the console output for specific error messages

### Empty Component Views

- Verify components have been tagged in Infa
- Check that you're using the correct main component IDs
- Ensure the component has been detected in at least one product page
- Try re-syncing data in your Infa dashboard

## Resources

- [Infa Documentation](https://docs.infa.ai)
- [Get Your Infa API Key](https://infa.ai/settings/api)
- [Storybook Documentation](https://storybook.js.org)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
