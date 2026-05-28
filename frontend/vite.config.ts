import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },

    // 🔥 ADD THIS (critical fix)
    nitro: {
      preset: "netlify",
    },
  },
});
