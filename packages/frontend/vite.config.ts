import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import veauryVitePlugin from 'veaury/vite/esm'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    //vue(),
    //vueJsx(),
    veauryVitePlugin({
      type: 'vue'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5738/'
      }
    }
  }
})
