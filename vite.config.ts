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
    // Ensure proper module resolution
    dedupe: ['react', 'react-dom'],
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
    // Ensure proper module format
    target: 'es2020',
    // Use esbuild for faster builds
    minify: mode === 'production' ? 'esbuild' : false,
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Let Vite decide chunking to avoid missing React runtime in production
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Disable source maps in production build
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096, // 4KB - inline smaller assets
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react-i18next',
      'i18next',
      'framer-motion',
      'lucide-react',
      '@tanstack/react-query',
    ],
    // Exclude large dependencies from pre-bundling if needed
    exclude: ['@splinetool/react-spline'], // Load Spline on demand
    // Force React to be pre-bundled together
    esbuildOptions: {
      target: 'es2020',
    },
  },
}));
