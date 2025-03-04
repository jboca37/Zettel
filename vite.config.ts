import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import process from "node:process";

// ✅ Explicitly import Vite types
import type { UserConfig } from "vite";

// ✅ Use `await import()` inside a separate async function
async function getPostCSSPlugins() {
  const tailwindcss = (await import("tailwindcss")).default;
  const autoprefixer = (await import("autoprefixer")).default;
  return [tailwindcss, autoprefixer];
}

// ✅ Define the config synchronously
export default defineConfig(async () => ({
  plugins: [sveltekit()],
  css: {
    postcss: {
      plugins: await getPostCSSPlugins(), // ✅ Ensures plugins are correctly loaded
    },
  },
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
      ignored: ["**/src-tauri/**"],
    },
  },
}) as UserConfig);
