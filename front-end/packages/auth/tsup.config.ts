import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/**/*.ts?(x)", "src/**/*.js?(x)", "index.tsx"],
  format: ["cjs", "esm"],
  banner: {
    js: "'use client'",
  },
  clean: true,
  sourcemap: true,
  dts: true,
  external: ["react", "@mui/material", "@marsidev/react-turnstile"],
  ...options,
}));
