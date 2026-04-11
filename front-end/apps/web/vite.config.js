import { defineConfig, loadEnv } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import process from "node:process";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), "");
  const baseUrl = env.VITE_API_URL;

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
      }),
      babel({
        presets: [reactCompilerPreset()],
        plugins: ["@emotion/babel-plugin"],
      }),
      svgr({
        svgrOptions: {
          exportType: "named",
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: "**/*.svg",
      }),
      visualizer({ open: false, filename: "analyse.html" }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("@mui/x-date-pickers")) {
                return "mui-date-pickers";
              }

              return id.toString().split("node_modules/")[1].split("/")[0].toString();
            }
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: baseUrl,
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.error("Proxy Error:", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.info("Sending Request to the Target:", req.method, req.url);
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.info("Received Response from the Target:", proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
  };
});
