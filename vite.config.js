import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import path from "path";

// @ts-expect-error process is a Node.js global
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [sveltekit()],

  clearScreen: false, // Prevents Vite from hiding Rust errors

  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"], // Ignore Tauri source files
    },
  },

  ssr: {
    noExternal: ["@tauri-apps/api"], // Ensure Tauri API is bundled in SSR mode
  },

  build: {
    rollupOptions: {
      // Removed `"@tauri-apps/api"` from external to allow proper resolution
    },
  },

  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "src/lib"), // Ensure correct module resolution
    },
  },
});
