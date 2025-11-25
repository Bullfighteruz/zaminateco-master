import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: "mgx",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Allow access from network (mobile devices)
    port: 5173,
    strictPort: false,
    // Prevent server from shutting down on errors
    watch: {
      // Use polling on Windows for better stability
      usePolling: process.platform === 'win32',
      interval: 1000, // Polling interval in ms (only used when usePolling is true)
      // Ignore more patterns to reduce file watching overhead
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.mgx/**',
        '**/.vite/**',
        '**/coverage/**',
        '**/.next/**',
        '**/.nuxt/**',
        '**/.cache/**',
        // Note: Don't ignore public/images/** - Vite needs to serve these files
        '**/*.log',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/desktop.ini',
      ],
      // Follow symlinks (can cause issues, so disable if not needed)
      followSymlinks: false,
    },
    // Optimize server performance
    hmr: {
      overlay: false, // Disable error overlay for faster HMR
      clientPort: 5173, // Explicit port for HMR
      // Add protocol for better HMR stability
      protocol: 'ws',
    },
    // Reduce latency
    fs: {
      strict: false, // Allow serving files outside root for faster dev
      // Allow serving files from workspace root
      allow: ['..'],
    },
    // Prevent crashes on unhandled errors
    middlewareMode: false,
  },
  // Optimize build performance
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and core dependencies
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // i18n
          if (id.includes('node_modules/react-i18next') || id.includes('node_modules/i18next')) {
            return 'i18n-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          // Animation library
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          // Maps and heavy libraries
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'maps-vendor';
          }
          // Charts
          if (id.includes('node_modules/recharts')) {
            return 'charts-vendor';
          }
          // Spline 3D
          if (id.includes('node_modules/@splinetool')) {
            return 'spline-vendor';
          }
          // Other vendor code
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Enable source maps only in development
    sourcemap: mode === 'development',
    // Minify for production
    minify: mode === 'production' ? 'terser' : false,
    // Optimize terser options
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2, // Multiple passes for better compression
      },
      format: {
        comments: false, // Remove comments
      },
    } : undefined,
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096, // 4KB - inline smaller assets
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-i18next',
      'i18next',
      'framer-motion',
      'lucide-react',
      '@tanstack/react-query',
    ],
    // Exclude large dependencies from pre-bundling if needed
    exclude: ['@splinetool/react-spline'], // Load Spline on demand
  },
}));
