import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Vitest config for the pure domain logic (no DOM needed). The `@` alias mirrors
 * tsconfig so tests import modules exactly like the app does.
 */
export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
