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
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'i18n-vendor': ['react-i18next', 'i18next'],
        },
      },
    },
    // Enable source maps only in development
    sourcemap: mode === 'development',
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
    ],
    // Exclude large dependencies from pre-bundling if needed
    exclude: [],
  },
}));
