#!/usr/bin/env node

/**
 * Check if pages data is present in usage-data.json
 * Looks for:
 * - page_id values in component_views
 * - Separate pages array/object
 * - Page titles and URLs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "../src/data/usage-data.json");

console.log("🔍 Checking for pages data in usage-data.json\n");

try {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  
  // Check for top-level pages array/object
  const hasTopLevelPages = data.pages !== undefined;
  const hasPagesArray = Array.isArray(data.pages);
  const hasPagesObject = typeof data.pages === "object" && !Array.isArray(data.pages);
  
  console.log("📊 Top-level structure:");
  console.log(`   - Has 'pages' key: ${hasTopLevelPages}`);
  if (hasTopLevelPages) {
    console.log(`   - Pages is array: ${hasPagesArray}`);
    console.log(`   - Pages is object: ${hasPagesObject}`);
    if (hasPagesArray) {
      console.log(`   - Pages count: ${data.pages.length}`);
    } else if (hasPagesObject) {
      console.log(`   - Pages keys: ${Object.keys(data.pages).length}`);
    }
  }
  console.log("");
  
  // Check component_views for page_id values
  let totalViews = 0;
  let viewsWithPageId = 0;
  let uniquePageIds = new Set();
  const pageIdStats = {};
  
  // Check all components
  Object.keys(data).forEach((key) => {
    if (key === "_metadata") return;
    
    const component = data[key];
    if (component.component_views && Array.isArray(component.component_views)) {
      component.component_views.forEach((view) => {
        totalViews++;
        if (view.page_id !== null && view.page_id !== undefined) {
          viewsWithPageId++;
          uniquePageIds.add(view.page_id);
          if (!pageIdStats[view.page_id]) {
            pageIdStats[view.page_id] = {
              count: 0,
              urls: new Set(),
              titles: new Set(),
            };
          }
          pageIdStats[view.page_id].count++;
          if (view.url) pageIdStats[view.page_id].urls.add(view.url);
          if (view.title) pageIdStats[view.page_id].titles.add(view.title);
        }
      });
    }
  });
  
  console.log("📄 Component Views Analysis:");
  console.log(`   - Total component views: ${totalViews}`);
  console.log(`   - Views with page_id: ${viewsWithPageId}`);
  console.log(`   - Views without page_id: ${totalViews - viewsWithPageId}`);
  console.log(`   - Unique page_ids: ${uniquePageIds.size}`);
  console.log("");
  
  if (uniquePageIds.size > 0) {
    console.log("✅ Found page_ids! Details:");
    Object.entries(pageIdStats).forEach(([pageId, stats]) => {
      console.log(`\n   Page ID: ${pageId}`);
      console.log(`   - Referenced by ${stats.count} component view(s)`);
      console.log(`   - URLs: ${Array.from(stats.urls).join(", ")}`);
      console.log(`   - Titles: ${Array.from(stats.titles).join(", ")}`);
    });
  } else {
    console.log("❌ No page_ids found in component_views (all are null)");
  }
  
  console.log("");
  
  // Check for page objects with title/URL
  const allUrls = new Set();
  const urlToViews = {};
  
  Object.keys(data).forEach((key) => {
    if (key === "_metadata") return;
    
    const component = data[key];
    if (component.component_views && Array.isArray(component.component_views)) {
      component.component_views.forEach((view) => {
        if (view.url) {
          allUrls.add(view.url);
          if (!urlToViews[view.url]) {
            urlToViews[view.url] = [];
          }
          urlToViews[view.url].push({
            componentTitle: component.title,
            viewTitle: view.title,
            pageId: view.page_id,
          });
        }
      });
    }
  });
  
  console.log("🌐 URL Analysis (for 'Group by Pages' feature):");
  console.log(`   - Unique URLs: ${allUrls.size}`);
  if (allUrls.size > 0) {
    console.log(`   - Sample URLs:`);
    Array.from(allUrls).slice(0, 5).forEach((url) => {
      console.log(`     • ${url} (${urlToViews[url].length} view(s))`);
    });
  }
  console.log("");
  
  // Summary
  console.log("📋 Summary:");
  console.log(`   ${hasTopLevelPages ? "✅" : "❌"} Top-level pages data: ${hasTopLevelPages ? "YES" : "NO"}`);
  console.log(`   ${viewsWithPageId > 0 ? "✅" : "❌"} Component views with page_id: ${viewsWithPageId > 0 ? "YES" : "NO"} (${viewsWithPageId}/${totalViews})`);
  console.log(`   ✅ URLs available for grouping: YES (${allUrls.size} unique URLs)`);
  
} catch (error) {
  console.error("❌ Error reading/parsing data file:", error.message);
  process.exit(1);
}

