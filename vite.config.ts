import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import process from "node:process";

// ✅ Explicitly import Vite types
import type { UserConfig } from "vite";

const config: UserConfig = {
  plugins: [sveltekit()],
  css: {
    postcss: {
      plugins: [
        require("tailwindcss"), // ✅ Ensures Tailwind loads properly
        require("autoprefixer"),
      ],
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
};

export default defineConfig(config);
