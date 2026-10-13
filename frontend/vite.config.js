import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "MSN EasyPay Dashboard",
        short_name: "EasyPay",
        theme_color: "#e53935",
        background_color: "#0b0f1a",
        display: "standalone",
        icons: [{ src: "/msn-logo.png", sizes: "192x192", type: "image/png" }],
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      "/api": { target: "http://localhost:5001", changeOrigin: true },
    },
  },
});
