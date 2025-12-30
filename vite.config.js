import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "apple-touch-icon.png"],
            manifest: {
                name: "BlackJack",
                short_name: "BlackJack",
                description: "BlackJack game",
                start_url: "/",
                scope: "/",
                display: "standalone",
                background_color: "#0b1220",
                theme_color: "#0b1220",
                icons: [
                    { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
                    { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
                ]
            },
            workbox: {
                cleanupOutdatedCaches: true,
                navigateFallback: "/index.html"
            }
        })
    ]
})