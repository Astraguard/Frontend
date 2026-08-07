import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    // Show controls for all props by default
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    // Render with a neutral background so the colored verdict states stand out
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "#0B1F1A" },
        { name: "grey", value: "#F4F5F4" }
      ]
    }
  }
};

export default preview;
