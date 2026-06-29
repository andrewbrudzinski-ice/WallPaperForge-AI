import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest config. Uses jsdom so we can test both pure domain logic and React
 * components/store behavior. The `@` alias mirrors tsconfig.
 */
export default defineConfig({
  // Use the automatic JSX runtime so component tests don't need to import React.
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
  },
});
