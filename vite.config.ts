import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'audio/**/*.mp3', 'perks/**/*.webp', 'widgets/**/*'],
        manifest: {
          name: 'Fennec',
          short_name: 'Fennec',
          description: 'Master languages in the post-apocalyptic wasteland with AI mentors and survival stats.',
          theme_color: '#18181b',
          background_color: '#18181b',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          // @ts-ignore - widgets is a valid property for PWA manifest but not yet in types
          widgets: [
            {
              name: 'Card of the Day',
              description: 'Learn a new word every day',
              tag: 'card-of-the-day',
              ms_ac_template: 'widgets/card-template.json',
              data: 'widgets/card-data.json',
              type: 'application/json'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom', 'zustand'],
            'vendor-ui': ['lucide-react', 'motion', 'react-markdown'],
            'vendor-ai': ['@google/genai'],
            'vendor-db': ['@supabase/supabase-js'],
            'vendor-charts': ['recharts', 'd3']
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
