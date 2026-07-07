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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx6YW1pbmF0ZWNvLW1hc3Rlci1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFx6YW1pbmF0ZWNvLW1hc3Rlci1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi96YW1pbmF0ZWNvLW1hc3Rlci1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgdml0ZVNvdXJjZUxvY2F0b3IgfSBmcm9tIFwiQG1ldGFncHR4L3ZpdGUtcGx1Z2luLXNvdXJjZS1sb2NhdG9yXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZpdGVTb3VyY2VMb2NhdG9yKHtcclxuICAgICAgcHJlZml4OiBcIm1neFwiLFxyXG4gICAgfSksXHJcbiAgICByZWFjdCgpLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gICAgLy8gRW5zdXJlIHByb3BlciBtb2R1bGUgcmVzb2x1dGlvblxyXG4gICAgZGVkdXBlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiAnMC4wLjAuMCcsIC8vIEFsbG93IGFjY2VzcyBmcm9tIG5ldHdvcmsgKG1vYmlsZSBkZXZpY2VzKVxyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxyXG4gICAgLy8gUHJldmVudCBzZXJ2ZXIgZnJvbSBzaHV0dGluZyBkb3duIG9uIGVycm9yc1xyXG4gICAgd2F0Y2g6IHtcclxuICAgICAgLy8gVXNlIHBvbGxpbmcgb24gV2luZG93cyBmb3IgYmV0dGVyIHN0YWJpbGl0eVxyXG4gICAgICB1c2VQb2xsaW5nOiBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInLFxyXG4gICAgICBpbnRlcnZhbDogMTAwMCwgLy8gUG9sbGluZyBpbnRlcnZhbCBpbiBtcyAob25seSB1c2VkIHdoZW4gdXNlUG9sbGluZyBpcyB0cnVlKVxyXG4gICAgICAvLyBJZ25vcmUgbW9yZSBwYXR0ZXJucyB0byByZWR1Y2UgZmlsZSB3YXRjaGluZyBvdmVyaGVhZFxyXG4gICAgICBpZ25vcmVkOiBbXHJcbiAgICAgICAgJyoqL25vZGVfbW9kdWxlcy8qKicsXHJcbiAgICAgICAgJyoqLy5naXQvKionLFxyXG4gICAgICAgICcqKi9kaXN0LyoqJyxcclxuICAgICAgICAnKiovYnVpbGQvKionLFxyXG4gICAgICAgICcqKi8ubWd4LyoqJyxcclxuICAgICAgICAnKiovLnZpdGUvKionLFxyXG4gICAgICAgICcqKi9jb3ZlcmFnZS8qKicsXHJcbiAgICAgICAgJyoqLy5uZXh0LyoqJyxcclxuICAgICAgICAnKiovLm51eHQvKionLFxyXG4gICAgICAgICcqKi8uY2FjaGUvKionLFxyXG4gICAgICAgIC8vIE5vdGU6IERvbid0IGlnbm9yZSBwdWJsaWMvaW1hZ2VzLyoqIC0gVml0ZSBuZWVkcyB0byBzZXJ2ZSB0aGVzZSBmaWxlc1xyXG4gICAgICAgICcqKi8qLmxvZycsXHJcbiAgICAgICAgJyoqLy5EU19TdG9yZScsXHJcbiAgICAgICAgJyoqL1RodW1icy5kYicsXHJcbiAgICAgICAgJyoqL2Rlc2t0b3AuaW5pJyxcclxuICAgICAgXSxcclxuICAgICAgLy8gRm9sbG93IHN5bWxpbmtzIChjYW4gY2F1c2UgaXNzdWVzLCBzbyBkaXNhYmxlIGlmIG5vdCBuZWVkZWQpXHJcbiAgICAgIGZvbGxvd1N5bWxpbmtzOiBmYWxzZSxcclxuICAgIH0sXHJcbiAgICAvLyBPcHRpbWl6ZSBzZXJ2ZXIgcGVyZm9ybWFuY2VcclxuICAgIGhtcjoge1xyXG4gICAgICBvdmVybGF5OiBmYWxzZSwgLy8gRGlzYWJsZSBlcnJvciBvdmVybGF5IGZvciBmYXN0ZXIgSE1SXHJcbiAgICAgIGNsaWVudFBvcnQ6IDUxNzMsIC8vIEV4cGxpY2l0IHBvcnQgZm9yIEhNUlxyXG4gICAgICAvLyBBZGQgcHJvdG9jb2wgZm9yIGJldHRlciBITVIgc3RhYmlsaXR5XHJcbiAgICAgIHByb3RvY29sOiAnd3MnLFxyXG4gICAgfSxcclxuICAgIC8vIFJlZHVjZSBsYXRlbmN5XHJcbiAgICBmczoge1xyXG4gICAgICBzdHJpY3Q6IGZhbHNlLCAvLyBBbGxvdyBzZXJ2aW5nIGZpbGVzIG91dHNpZGUgcm9vdCBmb3IgZmFzdGVyIGRldlxyXG4gICAgICAvLyBBbGxvdyBzZXJ2aW5nIGZpbGVzIGZyb20gd29ya3NwYWNlIHJvb3RcclxuICAgICAgYWxsb3c6IFsnLi4nXSxcclxuICAgIH0sXHJcbiAgICAvLyBQcmV2ZW50IGNyYXNoZXMgb24gdW5oYW5kbGVkIGVycm9yc1xyXG4gICAgbWlkZGxld2FyZU1vZGU6IGZhbHNlLFxyXG4gIH0sXHJcbiAgLy8gT3B0aW1pemUgYnVpbGQgcGVyZm9ybWFuY2VcclxuICBidWlsZDoge1xyXG4gICAgLy8gSW5jcmVhc2UgY2h1bmsgc2l6ZSB3YXJuaW5nIGxpbWl0XHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICAvLyBFbnN1cmUgcHJvcGVyIG1vZHVsZSBmb3JtYXRcclxuICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICAvLyBVc2UgZXNidWlsZCBmb3IgZmFzdGVyIGJ1aWxkc1xyXG4gICAgbWluaWZ5OiBtb2RlID09PSAncHJvZHVjdGlvbicgPyAnZXNidWlsZCcgOiBmYWxzZSxcclxuICAgIC8vIE9wdGltaXplIGNodW5rIHNwbGl0dGluZyBmb3IgYmV0dGVyIGNhY2hpbmdcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgLy8gTGV0IFZpdGUgZGVjaWRlIGNodW5raW5nIHRvIGF2b2lkIG1pc3NpbmcgUmVhY3QgcnVudGltZSBpbiBwcm9kdWN0aW9uXHJcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW2V4dF0vW25hbWVdLVtoYXNoXS5bZXh0XScsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIG9ubHkgaW4gZGV2ZWxvcG1lbnRcclxuICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyxcclxuICAgIC8vIENTUyBjb2RlIHNwbGl0dGluZ1xyXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgLy8gT3B0aW1pemUgYXNzZXQgaW5saW5pbmcgdGhyZXNob2xkXHJcbiAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NiwgLy8gNEtCIC0gaW5saW5lIHNtYWxsZXIgYXNzZXRzXHJcbiAgfSxcclxuICAvLyBPcHRpbWl6ZSBkZXBlbmRlbmNpZXNcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcclxuICAgICAgJ3JlYWN0JyxcclxuICAgICAgJ3JlYWN0L2pzeC1ydW50aW1lJyxcclxuICAgICAgJ3JlYWN0L2pzeC1kZXYtcnVudGltZScsXHJcbiAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAncmVhY3QtZG9tL2NsaWVudCcsXHJcbiAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcclxuICAgICAgJ3JlYWN0LWkxOG5leHQnLFxyXG4gICAgICAnaTE4bmV4dCcsXHJcbiAgICAgICdmcmFtZXItbW90aW9uJyxcclxuICAgICAgJ2x1Y2lkZS1yZWFjdCcsXHJcbiAgICAgICdAdGFuc3RhY2svcmVhY3QtcXVlcnknLFxyXG4gICAgXSxcclxuICAgIC8vIEV4Y2x1ZGUgbGFyZ2UgZGVwZW5kZW5jaWVzIGZyb20gcHJlLWJ1bmRsaW5nIGlmIG5lZWRlZFxyXG4gICAgZXhjbHVkZTogWydAc3BsaW5ldG9vbC9yZWFjdC1zcGxpbmUnXSwgLy8gTG9hZCBTcGxpbmUgb24gZGVtYW5kXHJcbiAgICAvLyBGb3JjZSBSZWFjdCB0byBiZSBwcmUtYnVuZGxlZCB0b2dldGhlclxyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlRLFNBQVMsb0JBQW9CO0FBQzlSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx5QkFBeUI7QUFIbEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxrQkFBa0I7QUFBQSxNQUNoQixRQUFRO0FBQUEsSUFDVixDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUE7QUFBQSxJQUVBLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxFQUMvQjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUE7QUFBQSxJQUVaLE9BQU87QUFBQTtBQUFBLE1BRUwsWUFBWSxRQUFRLGFBQWE7QUFBQSxNQUNqQyxVQUFVO0FBQUE7QUFBQTtBQUFBLE1BRVYsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBRUE7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLGdCQUFnQjtBQUFBLElBQ2xCO0FBQUE7QUFBQSxJQUVBLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQTtBQUFBLE1BQ1QsWUFBWTtBQUFBO0FBQUE7QUFBQSxNQUVaLFVBQVU7QUFBQSxJQUNaO0FBQUE7QUFBQSxJQUVBLElBQUk7QUFBQSxNQUNGLFFBQVE7QUFBQTtBQUFBO0FBQUEsTUFFUixPQUFPLENBQUMsSUFBSTtBQUFBLElBQ2Q7QUFBQTtBQUFBLElBRUEsZ0JBQWdCO0FBQUEsRUFDbEI7QUFBQTtBQUFBLEVBRUEsT0FBTztBQUFBO0FBQUEsSUFFTCx1QkFBdUI7QUFBQTtBQUFBLElBRXZCLFFBQVE7QUFBQTtBQUFBLElBRVIsUUFBUSxTQUFTLGVBQWUsWUFBWTtBQUFBO0FBQUEsSUFFNUMsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsUUFFTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsV0FBVyxTQUFTO0FBQUE7QUFBQSxJQUVwQixjQUFjO0FBQUE7QUFBQSxJQUVkLG1CQUFtQjtBQUFBO0FBQUEsRUFDckI7QUFBQTtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxTQUFTLENBQUMsMEJBQTBCO0FBQUE7QUFBQTtBQUFBLElBRXBDLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
