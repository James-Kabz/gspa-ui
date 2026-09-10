import { stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { rollup } from 'rollup'

const projectRoot = resolve(import.meta.dirname, '..')
const virtualEntry = '\0gspa-ui-size-check'

const bundleSize = async (source) => {
  const bundle = await rollup({
    input: virtualEntry,
    external: (id) => id !== virtualEntry && !id.startsWith('.') && !id.startsWith('/'),
    plugins: [{
      name: 'gspa-ui-size-check',
      resolveId(id, importer) {
        if (id === virtualEntry) return id
        if (importer === virtualEntry && id.startsWith('.')) {
          return resolve(projectRoot, id)
        }
      },
      load(id) {
        if (id === virtualEntry) return source
      }
    }]
  })

  try {
    const { output } = await bundle.generate({ format: 'es' })
    return output.reduce((total, item) => {
      return total + ('code' in item ? Buffer.byteLength(item.code) : item.source.length)
    }, 0)
  } finally {
    await bundle.close()
  }
}

const rootEntryBytes = (await stat(resolve(projectRoot, 'dist/index.esm.js'))).size
const rootNamedImportBytes = await bundleSize(`
  import { Button } from './dist/index.esm.js'
  console.log(Button)
`)
const granularImportBytes = await bundleSize(`
  import Button from './dist/components/Button.js'
  console.log(Button)
`)
const cssBytes = (await stat(resolve(projectRoot, 'dist/gspa-ui.css'))).size
const buttonCssBytes = (await stat(resolve(projectRoot, 'dist/styles/button.css'))).size

const limits = {
  rootEntryBytes: 20_000,
  rootNamedImportBytes: 20_000,
  granularImportBytes: 15_000,
  cssBytes: 100_000,
  buttonCssBytes: 30_000
}
const measurements = { rootEntryBytes, rootNamedImportBytes, granularImportBytes, cssBytes, buttonCssBytes }
const failures = Object.entries(measurements)
  .filter(([name, size]) => size > limits[name])

console.log('Bundle size regression check:', measurements)

if (failures.length) {
  for (const [name, size] of failures) {
    console.error(`${name} is ${size} bytes; limit is ${limits[name]} bytes`)
  }
  process.exitCode = 1
}
