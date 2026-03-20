import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import terser from '@rollup/plugin-terser'

const terserOptions: Record<string, unknown> = {
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
  mangle: {
    safari10: true,
  },
}

export default defineConfig({
  plugins: [
    react(),
    terser(terserOptions),
  ],
  server: {
    host: true,
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions,
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@react-three/postprocessing')) {
              return 'vendor-postprocessing'
            }
            if (id.includes('@react-three')) {
              return 'vendor-r3f'
            }
            if (id.includes('three')) {
              return 'vendor-three'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            if (id.includes('react-dom')) {
              return 'vendor-react'
            }
          }
          if (id.includes('/src/scenes/')) {
            const sceneName = id.split('/').pop()?.replace('.tsx', '') || 'scene'
            return `scene-${sceneName.toLowerCase()}`
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'react', 'react-dom', 'framer-motion'],
    exclude: [],
    esbuildOptions: {
      treeShaking: true,
    },
  },
  preview: {
    host: true,
    port: 4173,
    open: false,
  },
})