// vite.config.ts
import { defineConfig } from "file:///E:/zaminateco-master-main/node_modules/vite/dist/node/index.js";
import react from "file:///E:/zaminateco-master-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { viteSourceLocator } from "file:///E:/zaminateco-master-main/node_modules/@metagptx/vite-plugin-source-locator/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\zaminateco-master-main";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: "mgx"
    }),
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    // Ensure proper module resolution
    dedupe: ["react", "react-dom"]
  },
  server: {
    host: "0.0.0.0",
    // Allow access from network (mobile devices)
    port: 5173,
    strictPort: false,
    // Prevent server from shutting down on errors
    watch: {
      // Use polling on Windows for better stability
      usePolling: process.platform === "win32",
      interval: 1e3,
      // Polling interval in ms (only used when usePolling is true)
      // Ignore more patterns to reduce file watching overhead
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/.mgx/**",
        "**/.vite/**",
        "**/coverage/**",
        "**/.next/**",
        "**/.nuxt/**",
        "**/.cache/**",
        // Note: Don't ignore public/images/** - Vite needs to serve these files
        "**/*.log",
        "**/.DS_Store",
        "**/Thumbs.db",
        "**/desktop.ini"
      ],
      // Follow symlinks (can cause issues, so disable if not needed)
      followSymlinks: false
    },
    // Optimize server performance
    hmr: {
      overlay: false,
      // Disable error overlay for faster HMR
      clientPort: 5173,
      // Explicit port for HMR
      // Add protocol for better HMR stability
      protocol: "ws"
    },
    // Reduce latency
    fs: {
      strict: false,
      // Allow serving files outside root for faster dev
      // Allow serving files from workspace root
      allow: [".."]
    },
    // Prevent crashes on unhandled errors
    middlewareMode: false
  },
  // Optimize build performance
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1e3,
    // Ensure proper module format
    target: "es2020",
    // Use esbuild for faster builds
    minify: mode === "production" ? "esbuild" : false,
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Let Vite decide chunking to avoid missing React runtime in production
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
      }
    },
    // Enable source maps only in development
    sourcemap: mode === "development",
    // CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096
    // 4KB - inline smaller assets
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "react-i18next",
      "i18next",
      "framer-motion",
      "lucide-react",
      "@tanstack/react-query"
    ],
    // Exclude large dependencies from pre-bundling if needed
    exclude: ["@splinetool/react-spline"],
    // Load Spline on demand
    // Force React to be pre-bundled together
    esbuildOptions: {
      target: "es2020"
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx6YW1pbmF0ZWNvLW1hc3Rlci1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFx6YW1pbmF0ZWNvLW1hc3Rlci1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi96YW1pbmF0ZWNvLW1hc3Rlci1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgdml0ZVNvdXJjZUxvY2F0b3IgfSBmcm9tIFwiQG1ldGFncHR4L3ZpdGUtcGx1Z2luLXNvdXJjZS1sb2NhdG9yXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgdml0ZVNvdXJjZUxvY2F0b3Ioe1xuICAgICAgcHJlZml4OiBcIm1neFwiLFxuICAgIH0pLFxuICAgIHJlYWN0KCksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgICAvLyBFbnN1cmUgcHJvcGVyIG1vZHVsZSByZXNvbHV0aW9uXG4gICAgZGVkdXBlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiAnMC4wLjAuMCcsIC8vIEFsbG93IGFjY2VzcyBmcm9tIG5ldHdvcmsgKG1vYmlsZSBkZXZpY2VzKVxuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsXG4gICAgLy8gUHJldmVudCBzZXJ2ZXIgZnJvbSBzaHV0dGluZyBkb3duIG9uIGVycm9yc1xuICAgIHdhdGNoOiB7XG4gICAgICAvLyBVc2UgcG9sbGluZyBvbiBXaW5kb3dzIGZvciBiZXR0ZXIgc3RhYmlsaXR5XG4gICAgICB1c2VQb2xsaW5nOiBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInLFxuICAgICAgaW50ZXJ2YWw6IDEwMDAsIC8vIFBvbGxpbmcgaW50ZXJ2YWwgaW4gbXMgKG9ubHkgdXNlZCB3aGVuIHVzZVBvbGxpbmcgaXMgdHJ1ZSlcbiAgICAgIC8vIElnbm9yZSBtb3JlIHBhdHRlcm5zIHRvIHJlZHVjZSBmaWxlIHdhdGNoaW5nIG92ZXJoZWFkXG4gICAgICBpZ25vcmVkOiBbXG4gICAgICAgICcqKi9ub2RlX21vZHVsZXMvKionLFxuICAgICAgICAnKiovLmdpdC8qKicsXG4gICAgICAgICcqKi9kaXN0LyoqJyxcbiAgICAgICAgJyoqL2J1aWxkLyoqJyxcbiAgICAgICAgJyoqLy5tZ3gvKionLFxuICAgICAgICAnKiovLnZpdGUvKionLFxuICAgICAgICAnKiovY292ZXJhZ2UvKionLFxuICAgICAgICAnKiovLm5leHQvKionLFxuICAgICAgICAnKiovLm51eHQvKionLFxuICAgICAgICAnKiovLmNhY2hlLyoqJyxcbiAgICAgICAgLy8gTm90ZTogRG9uJ3QgaWdub3JlIHB1YmxpYy9pbWFnZXMvKiogLSBWaXRlIG5lZWRzIHRvIHNlcnZlIHRoZXNlIGZpbGVzXG4gICAgICAgICcqKi8qLmxvZycsXG4gICAgICAgICcqKi8uRFNfU3RvcmUnLFxuICAgICAgICAnKiovVGh1bWJzLmRiJyxcbiAgICAgICAgJyoqL2Rlc2t0b3AuaW5pJyxcbiAgICAgIF0sXG4gICAgICAvLyBGb2xsb3cgc3ltbGlua3MgKGNhbiBjYXVzZSBpc3N1ZXMsIHNvIGRpc2FibGUgaWYgbm90IG5lZWRlZClcbiAgICAgIGZvbGxvd1N5bWxpbmtzOiBmYWxzZSxcbiAgICB9LFxuICAgIC8vIE9wdGltaXplIHNlcnZlciBwZXJmb3JtYW5jZVxuICAgIGhtcjoge1xuICAgICAgb3ZlcmxheTogZmFsc2UsIC8vIERpc2FibGUgZXJyb3Igb3ZlcmxheSBmb3IgZmFzdGVyIEhNUlxuICAgICAgY2xpZW50UG9ydDogNTE3MywgLy8gRXhwbGljaXQgcG9ydCBmb3IgSE1SXG4gICAgICAvLyBBZGQgcHJvdG9jb2wgZm9yIGJldHRlciBITVIgc3RhYmlsaXR5XG4gICAgICBwcm90b2NvbDogJ3dzJyxcbiAgICB9LFxuICAgIC8vIFJlZHVjZSBsYXRlbmN5XG4gICAgZnM6IHtcbiAgICAgIHN0cmljdDogZmFsc2UsIC8vIEFsbG93IHNlcnZpbmcgZmlsZXMgb3V0c2lkZSByb290IGZvciBmYXN0ZXIgZGV2XG4gICAgICAvLyBBbGxvdyBzZXJ2aW5nIGZpbGVzIGZyb20gd29ya3NwYWNlIHJvb3RcbiAgICAgIGFsbG93OiBbJy4uJ10sXG4gICAgfSxcbiAgICAvLyBQcmV2ZW50IGNyYXNoZXMgb24gdW5oYW5kbGVkIGVycm9yc1xuICAgIG1pZGRsZXdhcmVNb2RlOiBmYWxzZSxcbiAgfSxcbiAgLy8gT3B0aW1pemUgYnVpbGQgcGVyZm9ybWFuY2VcbiAgYnVpbGQ6IHtcbiAgICAvLyBJbmNyZWFzZSBjaHVuayBzaXplIHdhcm5pbmcgbGltaXRcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgLy8gRW5zdXJlIHByb3BlciBtb2R1bGUgZm9ybWF0XG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICAvLyBVc2UgZXNidWlsZCBmb3IgZmFzdGVyIGJ1aWxkc1xuICAgIG1pbmlmeTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gJ2VzYnVpbGQnIDogZmFsc2UsXG4gICAgLy8gT3B0aW1pemUgY2h1bmsgc3BsaXR0aW5nIGZvciBiZXR0ZXIgY2FjaGluZ1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBMZXQgVml0ZSBkZWNpZGUgY2h1bmtpbmcgdG8gYXZvaWQgbWlzc2luZyBSZWFjdCBydW50aW1lIGluIHByb2R1Y3Rpb25cbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bZXh0XS9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAvLyBFbmFibGUgc291cmNlIG1hcHMgb25seSBpbiBkZXZlbG9wbWVudFxuICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICAvLyBDU1MgY29kZSBzcGxpdHRpbmdcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgLy8gT3B0aW1pemUgYXNzZXQgaW5saW5pbmcgdGhyZXNob2xkXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsIC8vIDRLQiAtIGlubGluZSBzbWFsbGVyIGFzc2V0c1xuICB9LFxuICAvLyBPcHRpbWl6ZSBkZXBlbmRlbmNpZXNcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1xuICAgICAgJ3JlYWN0JyxcbiAgICAgICdyZWFjdC9qc3gtcnVudGltZScsXG4gICAgICAncmVhY3QvanN4LWRldi1ydW50aW1lJyxcbiAgICAgICdyZWFjdC1kb20nLFxuICAgICAgJ3JlYWN0LWRvbS9jbGllbnQnLFxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxuICAgICAgJ3JlYWN0LWkxOG5leHQnLFxuICAgICAgJ2kxOG5leHQnLFxuICAgICAgJ2ZyYW1lci1tb3Rpb24nLFxuICAgICAgJ2x1Y2lkZS1yZWFjdCcsXG4gICAgICAnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5JyxcbiAgICBdLFxuICAgIC8vIEV4Y2x1ZGUgbGFyZ2UgZGVwZW5kZW5jaWVzIGZyb20gcHJlLWJ1bmRsaW5nIGlmIG5lZWRlZFxuICAgIGV4Y2x1ZGU6IFsnQHNwbGluZXRvb2wvcmVhY3Qtc3BsaW5lJ10sIC8vIExvYWQgU3BsaW5lIG9uIGRlbWFuZFxuICAgIC8vIEZvcmNlIFJlYWN0IHRvIGJlIHByZS1idW5kbGVkIHRvZ2V0aGVyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIHRhcmdldDogJ2VzMjAyMCcsXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVEsU0FBUyxvQkFBb0I7QUFDOVIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHlCQUF5QjtBQUhsQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFNBQVM7QUFBQSxJQUNQLGtCQUFrQjtBQUFBLE1BQ2hCLFFBQVE7QUFBQSxJQUNWLENBQUM7QUFBQSxJQUNELE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQTtBQUFBLElBRUEsUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLEVBQy9CO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQTtBQUFBLElBRVosT0FBTztBQUFBO0FBQUEsTUFFTCxZQUFZLFFBQVEsYUFBYTtBQUFBLE1BQ2pDLFVBQVU7QUFBQTtBQUFBO0FBQUEsTUFFVixTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBO0FBQUEsUUFFQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQTtBQUFBLE1BRUEsZ0JBQWdCO0FBQUEsSUFDbEI7QUFBQTtBQUFBLElBRUEsS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBO0FBQUEsTUFDVCxZQUFZO0FBQUE7QUFBQTtBQUFBLE1BRVosVUFBVTtBQUFBLElBQ1o7QUFBQTtBQUFBLElBRUEsSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBO0FBQUE7QUFBQSxNQUVSLE9BQU8sQ0FBQyxJQUFJO0FBQUEsSUFDZDtBQUFBO0FBQUEsSUFFQSxnQkFBZ0I7QUFBQSxFQUNsQjtBQUFBO0FBQUEsRUFFQSxPQUFPO0FBQUE7QUFBQSxJQUVMLHVCQUF1QjtBQUFBO0FBQUEsSUFFdkIsUUFBUTtBQUFBO0FBQUEsSUFFUixRQUFRLFNBQVMsZUFBZSxZQUFZO0FBQUE7QUFBQSxJQUU1QyxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQSxRQUVOLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxXQUFXLFNBQVM7QUFBQTtBQUFBLElBRXBCLGNBQWM7QUFBQTtBQUFBLElBRWQsbUJBQW1CO0FBQUE7QUFBQSxFQUNyQjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLFNBQVMsQ0FBQywwQkFBMEI7QUFBQTtBQUFBO0FBQUEsSUFFcEMsZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
