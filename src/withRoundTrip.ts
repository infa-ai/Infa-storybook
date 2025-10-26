import type { DecoratorFunction } from "storybook/internal/types";

/**
 * Placeholder decorator for future features.
 * Currently, the Usage panel reads data from pre-fetched JSON files
 * rather than performing runtime DOM analysis.
 */
export const withRoundTrip: DecoratorFunction = (storyFn) => {
  return storyFn();
};
