import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const runtimePackages = [
  '@fontsource-variable/manrope',
  '@fontsource-variable/newsreader',
  'core-util-is',
  'date-fns',
  'dexie',
  'dexie-react-hooks',
  'immediate',
  'inherits',
  'isarray',
  'jszip',
  'lie',
  'lucide-react',
  'pako',
  'process-nextick-args',
  'react',
  'react-dom',
  'readable-stream',
  'safe-buffer',
  'scheduler',
  'setimmediate',
  'string_decoder',
  'util-deprecate',
] as const

function runtimeLicenseBundle(): Plugin {
  return {
    name: 'plaincase-runtime-license-bundle',
    generateBundle() {
      const sections = runtimePackages.map((packageName) => {
        const packageRoot = resolve(process.cwd(), 'node_modules', ...packageName.split('/'))
        const manifest = JSON.parse(
          readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
        ) as { version: string }
        const licenseFiles = readdirSync(packageRoot).filter((filename) =>
          /^(licen[cs]e|notice)(\..*)?$/i.test(filename),
        )
        if (packageName === 'isarray') licenseFiles.push('README.md')
        if (licenseFiles.length === 0) {
          throw new Error(`No license file found for runtime package ${packageName}.`)
        }
        return [
          '================================================================================',
          `${packageName}@${manifest.version}`,
          '================================================================================',
          ...licenseFiles.flatMap((filename) => [
            `--- ${filename} ---`,
            readFileSync(resolve(packageRoot, filename), 'utf8').trim(),
          ]),
        ].join('\n')
      })
      this.emitFile({
        type: 'asset',
        fileName: 'third-party-licenses.txt',
        source: `Plaincase runtime third-party licenses\nGenerated from the release dependency tree.\n\n${sections.join(
          '\n\n',
        )}\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), runtimeLicenseBundle()],
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 700,
  },
})
