import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/ticketApp-hng/",
  plugins: [react()],

  // This tells Vite to process CSS and automatically
  // load the separate postcss.config.cjs file in your root directory.
  css: {
    postcss: {},
  },
});
