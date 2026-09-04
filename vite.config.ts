import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  // No Electron mantém "./" (caminhos relativos).
  // No GitHub Pages, definir VITE_BASE_PATH=/nome-do-repo/ no workflow.
  base: process.env.VITE_BASE_PATH || "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
