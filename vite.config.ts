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
        bypass: () => {
            return undefined;
        },
        router: (req: any) => {
          const url = new URL(req.url || '', 'http://localhost');
          const proxyTarget = url.searchParams.get('proxy_target');
          
          if (proxyTarget) {
            try {
              return new URL(proxyTarget).origin;
            } catch (e) {
              return 'https://www.google.com';
            }
          }
          return 'https://www.google.com';
        },
        rewrite: (path: string) => {
          const url = new URL(path, 'http://localhost');
          const proxyTarget = url.searchParams.get('proxy_target');
          const query = url.searchParams.get('q');
          
          if (proxyTarget) {
            try {
              const targetUrl = new URL(proxyTarget);
              return targetUrl.pathname + targetUrl.search;
            } catch (e) {
                return `/complete/search?client=chrome&q=${encodeURIComponent(query || '')}`;
            }
          }
          
          return `/complete/search?client=chrome&q=${encodeURIComponent(query || '')}`;
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      } as any,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})