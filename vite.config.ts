import { defineConfig, type PluginOption } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "tailwindcss"; // ✅ Correct Tailwind import
import autoprefixer from "autoprefixer"; // ✅ Ensure autoprefixer is included
import process from "node:process";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [sveltekit()], // ✅ Tailwind removed from plugins (handled via PostCSS)

  // ✅ Tailwind & Autoprefixer should be handled in PostCSS instead of a Vite plugin
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer], // ✅ Ensuring proper Tailwind processing
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,

  // 2. tauri expects a fixed port, fail if that port is not available
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
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"], // ✅ Ignore Tauri source files
    },
  },
});
