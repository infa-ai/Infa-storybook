# Storybook Addon Usage

A Storybook addon that displays usage information for your components. Connect your stories to main components and display relevant usage data in a dedicated panel.

## Features

- 📊 Display component usage information directly in Storybook
- 🔗 Connect multiple main components to a single story
- 🎨 Clean, integrated UI that matches Storybook's design
- 🔒 Secure build-time data injection (no API keys exposed)
- 🎯 Framework-agnostic and data-source-agnostic

## Installation

```bash
npm install --save-dev storybook-infa-usage
```

## Setup

Register the addon in your `.storybook/main.ts`:

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/your-framework';

const config: StorybookConfig = {
  addons: [
    '@storybook/addon-docs',
    'storybook-infa-usage', // Add this line
  ],
};

export default config;
```

## Usage

### Configuring Stories

Add the `usage` parameter to your stories to connect them with main component IDs:

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    usage: {
      mcComponentIds: ['mc_abc12345'] // Single component
    }
  }
};

export default meta;
```

**Multiple Components:**

You can connect multiple main components to a single story:

```typescript
export default {
  component: ComplexButton,
  parameters: {
    usage: {
      mcComponentIds: [
        'mc_abc12345', // Primary button component
        'mc_def67890'  // Icon component
      ]
    }
  }
};
```

**Story-Level Override:**

You can also override at the story level:

```typescript
export const Primary: StoryObj<typeof Button> = {
  parameters: {
    usage: {
      mcComponentIds: ['mc_primary']
    }
  }
};

export const Secondary: StoryObj<typeof Button> = {
  parameters: {
    usage: {
      mcComponentIds: ['mc_secondary']
    }
  }
};
```

### Data Format

The addon reads component data from `src/data/usage-data.json`. Create this file with the following structure:

```json
{
  "mc_abc12345": {
    "title": "Primary Button"
  },
  "mc_def67890": {
    "title": "Icon Component"
  }
}
```

## Infa Integration (Optional)

If you're using [Infa](https://infa.ai) to track your design system, we provide an example integration script to automatically fetch component data.

### Prerequisites

1. Get your Infa API key from your account settings
2. Note the main component IDs from your Infa board

### Setup

1. **Set your API key:**

```bash
export INFA_API_KEY="your-api-key-here"
```

2. **Add glob package (used by the script):**

```bash
npm install --save-dev glob
```

3. **Add a script to your package.json:**

```json
{
  "scripts": {
    "fetch-usage-data": "node scripts/infa-integration.js"
  }
}
```

4. **Run the script:**

```bash
npm run fetch-usage-data
```

This will:
- Scan your story files for `mcComponentIds` parameters
- Fetch component titles from the Infa API
- Generate `src/data/usage-data.json` with the fetched data

### Build-Time Integration (CI/CD)

For automated builds, integrate the data fetching into your CI/CD pipeline:

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
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Fetch usage data
        env:
          INFA_API_KEY: ${{ secrets.INFA_API_KEY }}
        run: npm run fetch-usage-data
      
      - name: Build Storybook
        run: npm run build-storybook
      
      - name: Deploy
        # Your deployment step here
```

## Custom Data Sources

The addon is data-source-agnostic. You can create your own integration script or manually maintain the `usage-data.json` file. The addon simply reads from this file to display component information.

### Custom Integration Example

```javascript
// scripts/custom-integration.js
const fs = require('fs');

async function fetchFromYourAPI() {
  // Your custom logic here
  const data = {
    "component-1": { title: "My Component" },
    // ... more components
  };
  
  fs.writeFileSync(
    'src/data/usage-data.json',
    JSON.stringify(data, null, 2)
  );
}

fetchFromYourAPI();
```

## Development

### Running the Example Storybook

```bash
npm install
npm run storybook
```

### Building the Addon

```bash
npm run build
```

## API

### Story Parameters

The addon adds support for the `usage` parameter:

```typescript
interface UsageParameters {
  mcComponentIds: string[];
}
```

**Usage in stories:**

```typescript
parameters: {
  usage: {
    mcComponentIds: ['mc_id1', 'mc_id2']
  }
}
```

### Data File Format

**Location:** `src/data/usage-data.json`

**Schema:**

```typescript
type UsageDataMap = Record<string, {
  title: string;
}>;
```

**Example:**

```json
{
  "mc_component_id": {
    "title": "Component Display Name"
  }
}
```

## Troubleshooting

### Panel shows "No Usage Data"

- Make sure you've added the `usage` parameter to your story
- Check that `mcComponentIds` is an array of strings
- Verify the component IDs exist in your `usage-data.json` file

### Component shows "Unknown Component"

- The component ID exists in the story parameters but not in `usage-data.json`
- Run your data fetching script to update the data file
- Or manually add the component to `usage-data.json`

### Data not updating

- Make sure to rebuild your Storybook after updating `usage-data.json`
- Clear your browser cache if the old data persists
- Check the browser console for any errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
