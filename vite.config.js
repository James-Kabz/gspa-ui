import { fileURLToPath, URL } from "node:url"
import { readdirSync } from "node:fs"
import { dirname, extname, relative, resolve, sep } from "node:path"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import tailwindcss from "@tailwindcss/vite"

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const libraryEntries = {
  index: resolve(__dirname, "src/index.js"),
  "styles/button": resolve(__dirname, "src/styles/button.css"),
  "styles/input": resolve(__dirname, "src/styles/input.css"),
  "styles/form-field": resolve(__dirname, "src/styles/form-field.css"),
  "styles/auth-layout": resolve(__dirname, "src/styles/auth-layout.css"),
  "styles/tokens": resolve(__dirname, "src/styles/tokens.css"),
}

const addLibraryEntries = (sourceDirectory, exportDirectory, extensions) => {
  const sourceRoot = resolve(__dirname, sourceDirectory)

  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = resolve(directory, entry.name)
      if (entry.isDirectory()) {
        visit(entryPath)
        continue
      }

      const extension = extname(entry.name)
      if (!extensions.includes(extension)) continue

      const relativeName = relative(sourceRoot, entryPath)
        .slice(0, -extension.length)
        .split(sep)
        .join("/")
      libraryEntries[`${exportDirectory}/${relativeName}`] = entryPath
    }
  }

  visit(sourceRoot)
}

addLibraryEntries("src/components", "components", [".vue"])
addLibraryEntries("src/layouts", "layouts", [".vue"])
addLibraryEntries("src/lib", "lib", [".js"])
addLibraryEntries("src/directives", "directives", [".js"])
addLibraryEntries("src/utils", "utils", [".js"])

export default defineConfig({
  plugins: [vue(), vueJsx(), tailwindcss()],
  build: {
    // Demo assets live in public/, but library consumers provide their own branding.
    copyPublicDir: false,
    lib: {
      entry: libraryEntries,
      name: "VueUI",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (entryName === "index") {
          return format === "es" ? "index.esm.js" : "index.cjs"
        }
        return `${entryName}.${format === "es" ? "js" : "cjs"}`
      },
    },
    rollupOptions: {
      external: [
        "vue",
        "pinia",
        "vue-router",
        "@fortawesome/fontawesome-svg-core",
        "@fortawesome/vue-fontawesome",
        "@fortawesome/free-brands-svg-icons",
        "@fortawesome/free-regular-svg-icons",
        "@fortawesome/free-solid-svg-icons",
        "class-variance-authority",
        "clsx", 
        "tailwind-merge"
      ],
      output: {
        exports: "named",
        globals: {
          vue: "Vue",
          pinia: "Pinia",
          "vue-router": "VueRouter",
          "@fortawesome/fontawesome-svg-core": "FontAwesome",
          "@fortawesome/vue-fontawesome": "FontAwesomeVue",
          "class-variance-authority": "ClassVarianceAuthority",
          "clsx": "clsx",
          "tailwind-merge": "tailwindMerge"
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0] === 'index.css') return 'gspa-ui.css';
          return assetInfo.names?.[0];
        },
      },
    },
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "vue": "vue/dist/vue.esm-bundler.js"
    },
  },
})
