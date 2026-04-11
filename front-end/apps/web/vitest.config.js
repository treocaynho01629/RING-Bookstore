import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { sharedConfig } from "@ring/vitest-config";

export default defineConfig({
  ...sharedConfig,
  plugins: [react()],
  test: {
    ...sharedConfig.test,
    environment: "jsdom",
    css: true,
  },
});
