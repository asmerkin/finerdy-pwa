import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

// Configuración simple - solo iconos
// Los splash screens tienen bugs en el CLI, se generarán vía @vite-pwa/nuxt
const customPreset = {
  ...minimal2023Preset,
  transparent: {
    sizes: [64, 192, 512],
    favicons: [[48, 'favicon.ico']],
  },
  maskable: {
    sizes: [512],
  },
  apple: {
    sizes: [180],
  },
}

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: customPreset,
  images: ['public/favicon.svg'],
})
