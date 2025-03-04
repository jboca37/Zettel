/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,svelte,js,ts}"], // ✅ Ensures Tailwind scans all files
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"), // ✅ Registers DaisyUI
    require("@tailwindcss/typography"), // ✅ Registers Tailwind Typography
  ],
};
