/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,svelte,js,ts}"], // ✅ Ensures Tailwind scans all files
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"), // ✅ Ensures DaisyUI is loaded
    require("@tailwindcss/typography"), // ✅ Ensures Typography is loaded
  ],
};
