import { fileURLToPath, URL } from "node:url"
import { dirname, resolve } from "node:path"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import tailwindcss from "@tailwindcss/vite"

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [vue(), vueJsx(), tailwindcss()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "VueUI",
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "es") return "index.esm.js"
        if (format === "cjs") return "index.js"
        return `index.${format}.js`
      },
    },
    rollupOptions: {
      external: [
        "vue",
        "class-variance-authority",
        "clsx", 
        "tailwind-merge"
      ],
      output: {
        exports: "named",
        globals: {
          vue: "Vue",
          "class-variance-authority": "ClassVarianceAuthority",
          "clsx": "clsx",
          "tailwind-merge": "tailwindMerge"
        },
        // Preserve CSS
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) return 'gspa-ui.css';
          return assetInfo.names?.[0];
        },
      },
    },
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "vue": "vue/dist/vue.esm-bundler.js"
    },
  },
})
