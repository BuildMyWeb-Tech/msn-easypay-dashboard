import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["msn-logo.png"],

      manifest: {
        name: "MSN EasyPay Dashboard",
        short_name: "EasyPay",
        description: "MSN Infotec HR & Payroll Management Dashboard",
        theme_color: "#e53935",
        background_color: "#f0f2f5",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/attendance",
        scope: "/",
        lang: "en",
        categories: ["business", "productivity"],
        icons: [
          {
            src: "/msn-logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/msn-logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/msn-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        // Pre-cache all app shell assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        // Keep cached pages fresh for offline use
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // API calls: network-first, 5-min cache fallback
            urlPattern: /\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Static assets: cache-first
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
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
