import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
import path from "path";
import { componentTagger } from "lovable-tagger";

// vite.config.js

export default defineConfig(({ mode }) => ({
  server: {
    proxy: mode === 'development' && {
      '/api': {
        target: 'https://tarefas-banco-estruturado.onrender.com', // Backend URL
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
