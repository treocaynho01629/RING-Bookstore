import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*.ts?(x)", "src/**/*.js?(x)", "index.tsx"],
  format: ["cjs", "esm"],
  clean: true,
  sourcemap: true,
  dts: true,
  external: ["react", "@mui/material", "@mui/icons-material"],
  ...options,
}));
