import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import terser from '@rollup/plugin-terser'

const terserOptions: terser.TerserOptions = {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info'],
  },
  mangle: {
    safari10: true,
  },
  format: {
    comments: false,
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
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-three': ['three'],
          'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
          'vendor-postprocessing': ['@react-three/postprocessing'],
          'vendor-motion': ['framer-motion'],
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
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'react', 'react-dom'],
    exclude: [],
  },
  preview: {
    host: true,
    port: 4173,
    open: false,
  },
})