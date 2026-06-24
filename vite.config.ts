import { copyFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

function githubPagesSpaFallback(): Plugin {
  return {
    name: "github-pages-spa-fallback",
    closeBundle() {
      copyFileSync("dist/index.html", "dist/404.html");
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Served from https://wealthtechgroup.github.io/devere-ui/ in production.
  base: command === "build" ? "/devere-ui/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    ...(command === "build" ? [githubPagesSpaFallback()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}));
