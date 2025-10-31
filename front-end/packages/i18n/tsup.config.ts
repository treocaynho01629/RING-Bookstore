import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*.ts?(x)", "index.tsx"],
  format: ["cjs", "esm"],
  clean: true,
  sourcemap: true,
  dts: true,
  ...options,
}));
