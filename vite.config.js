import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  build: {
    target: "es2018",
    outDir: "dist",
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    hmr: true,
  },
  plugins: [
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
});
