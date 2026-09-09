import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// The site is served from https://<user>.github.io/<repo>/, so every asset URL
// needs that repo prefix. The Pages workflow passes it in as VITE_BASE; local
// dev and `vite preview` fall back to "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? process.env.VITE_BASE || "/" : "/",
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@data": path.resolve(__dirname, "./data"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
}));
