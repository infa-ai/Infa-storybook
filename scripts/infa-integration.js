#!/usr/bin/env node

/**
 * Infa Integration Script
 *
 * This script is NOT part of the published addon package.
 * It's an optional example that users can adapt for fetching usage data from Infa API.
 *
 * Usage:
 *   1. Set INFA_API_KEY in .env file or environment variable
 *   2. Run: npm run fetch-usage-data
 *   3. Generates src/data/usage-data.json with component information
 *
 * The script:
 *   - Scans your Storybook stories for usage.mcComponentIds parameters
 *   - Fetches component data from Infa API
 *   - Generates a JSON file with component titles
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_URL = "https://api.infa.ai/rest/v1/rpc/get_storybook_main_components";
const API_KEY = process.env.INFA_API_KEY;
const APIKEY_HEADER =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjaHdvdnh4YmdjZHljYXFtZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcxMDczNDksImV4cCI6MjAzMjY4MzM0OX0.0EIrHDQZMihWRsQ8ke1uoP4e0seFBJxuxLqc0jIhQGA";

// Output file path
const OUTPUT_FILE = path.join(__dirname, "../src/data/usage-data.json");

// Validate API key
if (!API_KEY) {
  console.error("❌ Error: INFA_API_KEY environment variable is not set");
  console.error("");
  console.error("Please set your Infa API key:");
  console.error('  export INFA_API_KEY="your-api-key-here"');
  console.error("");
  process.exit(1);
}

/**
 * Scan story files for mcComponentIds parameters
 * This is a simple regex-based scanner - you may need to adjust for your project
 */
function scanStoriesForComponentIds() {
  console.log("📚 Scanning story files for component IDs...");

  const storyFiles = glob.sync("**/*.stories.{ts,tsx,js,jsx}", {
    cwd: path.join(__dirname, "../src"),
    absolute: true,
  });

  const componentIds = new Set();
  const mcComponentIdPattern = /mcComponentIds:\s*\[([^\]]+)\]/g;
  const stringPattern = /['"]([^'"]+)['"]/g;

  storyFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf8");
      let match;

      while ((match = mcComponentIdPattern.exec(content)) !== null) {
        const arrayContent = match[1];
        let idMatch;

        while ((idMatch = stringPattern.exec(arrayContent)) !== null) {
          componentIds.add(idMatch[1]);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not read file ${file}:`, error.message);
    }
  });

  return Array.from(componentIds);
}

/**
 * Fetch component data from Infa API
 */
async function fetchComponentData(componentIds) {
  if (componentIds.length === 0) {
    console.log("ℹ️  No component IDs found in stories");
    return {};
  }

  console.log(`🔄 Fetching data for ${componentIds.length} component(s)...`);
  console.log(`   IDs: ${componentIds.join(", ")}`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: APIKEY_HEADER,
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        p_mc_component_ids: componentIds,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Debug: Log API response structure to check for pages
    console.log("\n🔍 API Response Structure:");
    console.log(
      `   - Response type: ${Array.isArray(data) ? "Array" : typeof data}`,
    );
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   - First item keys: ${Object.keys(data[0]).join(", ")}`);
      if (data[0].pages !== undefined) {
        console.log(`   ✅ Found 'pages' in API response!`);
        console.log(
          `   - Pages type: ${Array.isArray(data[0].pages) ? "Array" : typeof data[0].pages}`,
        );
        if (Array.isArray(data[0].pages)) {
          console.log(`   - Pages count: ${data[0].pages.length}`);
        }
      }
    } else if (typeof data === "object" && !Array.isArray(data)) {
      console.log(`   - Top-level keys: ${Object.keys(data).join(", ")}`);
      if (data.pages !== undefined) {
        console.log(`   ✅ Found 'pages' in API response!`);
        console.log(
          `   - Pages type: ${Array.isArray(data.pages) ? "Array" : typeof data.pages}`,
        );
      }
    }

    // Check for page_id in component_views
    if (Array.isArray(data) && data.length > 0) {
      const sampleComponent = data[0];
      if (
        sampleComponent.component_views &&
        Array.isArray(sampleComponent.component_views)
      ) {
        const viewsWithPageId = sampleComponent.component_views.filter(
          (v) => v.page_id !== null && v.page_id !== undefined,
        );
        console.log(
          `   - Component views with page_id: ${viewsWithPageId.length}/${sampleComponent.component_views.length}`,
        );
        if (viewsWithPageId.length > 0) {
          console.log(`   ✅ Found page_ids in component_views!`);
        }
      }
    }
    console.log("");

    // Convert array response to object keyed by component ID
    const result = {};
    data.forEach((item) => {
      result[item.id] = {
        title: item.title || "Untitled Component",
        description: item.description || null,
        query: item.query || null,
        external_links: item.external_links || [],
        labels: item.labels || [],
        component_views: item.component_views || [],
        board_id: item.board_id || null,
        pages: item.pages || [], // Pages for the board
      };
    });

    console.log(
      `✅ Fetched data for ${Object.keys(result).length} component(s)`,
    );
    return result;
  } catch (error) {
    console.error("❌ Error fetching component data:", error.message);
    throw error;
  }
}

/**
 * Write data to JSON file
 */
function writeDataFile(data) {
  const dir = path.dirname(OUTPUT_FILE);

  // Ensure directory exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Add metadata with sync timestamp
  const outputData = {
    ...data,
    _metadata: {
      lastSyncedAt: new Date().toISOString(),
    },
  };

  // Write formatted JSON
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(outputData, null, 2) + "\n",
    "utf8",
  );

  console.log(
    `✅ Wrote usage data to ${path.relative(process.cwd(), OUTPUT_FILE)}`,
  );
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Infa Integration Script");
  console.log("═══════════════════════════\n");

  try {
    // Step 1: Scan stories for component IDs
    const componentIds = scanStoriesForComponentIds();

    // Step 2: Fetch data from API
    const data = await fetchComponentData(componentIds);

    // Step 3: Write to file
    writeDataFile(data);

    console.log("\n✨ Done!");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Review the generated data file");
    console.log("  2. Run your Storybook: npm run storybook");
    console.log('  3. Check the "Usage" panel in your stories');
    console.log("");
  } catch (error) {
    console.error("\n❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
