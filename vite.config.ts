import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["cuzbangs.png"],
      manifest: {
        name: "cuzbangs",
        short_name: "cuzbangs",
        description: "cuzbangs. cuz it bangs",
        theme_color: "#ffffff",
        icons: [
          {
            src: "cuzbangs.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "cuzbangs.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
