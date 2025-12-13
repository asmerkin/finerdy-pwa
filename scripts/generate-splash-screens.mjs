import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

// Tamaños de splash screens para iOS
// Basado en: https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/
const SPLASH_SCREENS = [
  // iPhone SE, iPhone 8
  { width: 750, height: 1334, name: 'apple-splash-750-1334' },
  // iPhone 8 Plus, iPhone 7 Plus, iPhone 6s Plus
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208' },
  // iPhone 11 Pro, iPhone X, iPhone XS
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },
  // iPhone 11, iPhone XR
  { width: 828, height: 1792, name: 'apple-splash-828-1792' },
  // iPhone 11 Pro Max, iPhone XS Max
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },
  // iPhone 12 mini, iPhone 13 mini
  { width: 1080, height: 2340, name: 'apple-splash-1080-2340' },
  // iPhone 12, iPhone 12 Pro, iPhone 13, iPhone 13 Pro, iPhone 14
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532' },
  // iPhone 12 Pro Max, iPhone 13 Pro Max, iPhone 14 Plus
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778' },
  // iPhone 14 Pro
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556' },
  // iPhone 14 Pro Max
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796' },
  // iPad Mini, iPad Air
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048' },
  // iPad Pro 10.5"
  { width: 1668, height: 2224, name: 'apple-splash-1668-2224' },
  // iPad Pro 11"
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388' },
  // iPad Pro 12.9"
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732' },
]

const BACKGROUND_COLOR = '#f9fafb' // Mismo que manifest.webmanifest background_color
const ICON_SIZE_RATIO = 0.25 // El logo ocupará el 25% del ancho de la pantalla

async function generateSplashScreens() {
  console.log('🎨 Generando splash screens para iOS...\n')

  // Leer el SVG fuente
  const svgPath = resolve(publicDir, 'favicon.svg')
  const svgBuffer = readFileSync(svgPath)

  let generated = 0
  let failed = 0

  for (const screen of SPLASH_SCREENS) {
    try {
      const { width, height, name } = screen
      const iconSize = Math.round(width * ICON_SIZE_RATIO)
      const outputPath = resolve(publicDir, `${name}.png`)

      // Crear el splash screen:
      // 1. Fondo con color sólido
      // 2. Logo centrado con el tamaño apropiado
      await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: BACKGROUND_COLOR,
        },
      })
        .composite([
          {
            input: await sharp(svgBuffer)
              .resize(iconSize, iconSize, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 },
              })
              .png()
              .toBuffer(),
            gravity: 'center',
          },
        ])
        .png()
        .toFile(outputPath)

      console.log(`✅ ${name}.png (${width}x${height})`)
      generated++
    } catch (error) {
      console.error(`❌ Error generando ${name}:`, error.message)
      failed++
    }
  }

  console.log(`\n✨ Generación completada: ${generated} exitosos, ${failed} fallidos`)
}

generateSplashScreens().catch((error) => {
  console.error('Error fatal:', error)
  process.exit(1)
})
