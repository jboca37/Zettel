import { defineConfig, type PluginOption } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import * as tailwindcss from "tailwindcss"; // ✅ Fixes Tailwind import
import * as autoprefixer from "autoprefixer"; // ✅ Fixes Autoprefixer import
import process from "node:process";

export default defineConfig({
  plugins: [sveltekit()], // ✅ Removed Tailwind from plugins (handled via PostCSS)

  css: {
    postcss: {
      plugins: [tailwindcss.default, autoprefixer.default], // ✅ Ensures correct ES module imports
    },
  },

  // Vite options tailored for Tauri development
  clearScreen: false,

  server: {
    port: 1420,
    strictPort: true,
    host: process.env.TAURI_DEV_HOST || false,
    hmr: process.env.TAURI_DEV_HOST
      ? {
          protocol: "ws",
          host: process.env.TAURI_DEV_HOST,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"], // ✅ Ignore Tauri source files
    },
  },
});
