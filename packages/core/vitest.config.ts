import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/__tests__/*.spec.ts",
      "src/**/__tests__/*.spec.tsx",
      "src/hooks/__tests__/*.spec.tsx",
      "tests/contracts/**/*.spec.ts",
    ],
    reporters: ["default"],
  },
});
