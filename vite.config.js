import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3002,
  },
  plugins: [
    vue(),
    NodeGlobalsPolyfillPlugin({
      buffer: true
    }),
    NodeModulesPolyfillPlugin()
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'path': 'path-browserify',
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
    }
  },
  base: '/phenoplus/oauth2/redirect/', //staging or dev
  // base: '/launch/', //production
})
