import { defineMain } from "@storybook/react-vite/node";
import { watch } from "node:fs";
import { resolve } from "node:path";

const config = defineMain({
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-docs", "./local-preset.cjs"],
  framework: "@storybook/react-vite",
  viteFinal: async (config, options) => {
    // Watch dist folder for changes during development
    // This ensures Storybook reloads when the addon is rebuilt
    config.server = config.server || {};
    config.server.watch = {
      ...config.server.watch,
      // Watch dist folder for addon changes
      ignored: ["**/node_modules/**", "**/.git/**"],
    };
    // Ensure dist folder is accessible
    config.server.fs = config.server.fs || {};
    config.server.fs.allow = [
      ...(config.server.fs.allow || []),
      "..",
    ];
    // Add plugin to watch dist folder and trigger HMR
    const distPath = resolve(__dirname, "../dist");
    config.plugins = config.plugins || [];
    config.plugins.push({
      name: "watch-addon-dist",
      configureServer(server) {
        // Watch dist folder for changes
        watch(distPath, { recursive: true }, (eventType, filename) => {
          if (filename && (eventType === "change" || eventType === "rename")) {
            // Trigger full page reload when dist files change
            server.ws.send({
              type: "full-reload",
            });
          }
        });
      },
    });
    return config;
  },
});

export default config;
