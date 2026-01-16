import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'cuzbangs',
        short_name: 'cuzbangs',
        description: 'A redirect engine with customizable bangs.',
        theme_color: '#000000',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    }),
  ],
  server: {
    proxy: {
      '/suggestions': {
        target: 'https://www.google.com', // Default target (Google)
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
            // Kita JANGAN bypass request ini biar ga jatuh ke index.html
            // Biarin masuk ke router/rewrite di bawah
            return undefined;
        },
        router: (req) => {
          const url = new URL(req.url || '', 'http://localhost');
          const proxyTarget = url.searchParams.get('proxy_target');
          
          if (proxyTarget) {
            try {
              return new URL(proxyTarget).origin;
            } catch (e) {
              return 'https://www.google.com';
            }
          }
          // Fallback Default kalo ga ada proxy_target: Google
          return 'https://www.google.com';
        },
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const proxyTarget = url.searchParams.get('proxy_target');
          const query = url.searchParams.get('q');
          
          if (proxyTarget) {
            try {
              const targetUrl = new URL(proxyTarget);
              return targetUrl.pathname + targetUrl.search;
            } catch (e) {
                // Fallback rewrite
                return `/complete/search?client=chrome&q=${encodeURIComponent(query || '')}`;
            }
          }
          
          // Fallback Default: Google Path
          return `/complete/search?client=chrome&q=${encodeURIComponent(query || '')}`;
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})