import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Netlify deployment configuration
    base: '/',
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
        babel: {
          plugins: []
        }
      }),
      mode === 'development' &&
      componentTagger(),
      mode === 'development' && 
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks: {
            // Split vendor libraries
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            'chart-vendor': ['recharts'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'date-vendor': ['date-fns', 'react-day-picker'],
            'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          },
        },
      },
      // Production build optimizations
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true, // Remove console logs in production
          drop_debugger: true,
        },
      } : undefined,
      // Optimize chunk sizes
      chunkSizeWarningLimit: 1000,
      // Enable source maps in production for debugging
      sourcemap: mode === 'production' ? 'hidden' : true,
    },
    // Development and preview server configuration
    server: {
      host: "::",
      port: 5173,
      cors: true,
      headers: {
        'Cross-Origin-Embedder-Policy': 'credentialless',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    // Preview server configuration (for production testing)
    preview: {
      port: 4173,
      host: "::",
    },
  };
});
