import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), cloudflare()],
  build: {
    chunkSizeWarningLimit: 2048,
    rolldownOptions: {
      checks: {
        // Suppress invalid /* #__PURE__ */ annotations emitted by dependencies.
        invalidAnnotation: false,
      },
    },
  },
})