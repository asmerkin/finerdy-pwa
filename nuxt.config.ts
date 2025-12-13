// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-12-01',
  devtools: { enabled: true },

  // SPA mode via routeRules (avoids unhead bug with ssr:false)
  ssr: false,

  // Generate static routes for SPA fallback
  nitro: {
    prerender: {
      failOnError: false,
      crawlLinks: false,
      routes: ['/'],
    },
    static: true,
  },

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxtjs/i18n', '@sentry/nuxt/module'],

  // i18n configuration
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'es', file: 'es.json', name: 'Español' },
    ],
    defaultLocale: 'es',
    lazy: true,
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'es',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // Runtime config for API
  runtimeConfig: {
    public: {
      // Direct call to Laravel backend
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost',
      // PWA Client Authentication - API Key to access backend
      pwaApiKey: process.env.NUXT_PUBLIC_PWA_API_KEY || '',
    },
  },

  // PWA configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      name: 'Finerdy',
      short_name: 'Finerdy',
      description: 'Personal finance management',
      theme_color: '#ef4444',
      background_color: '#f9fafb',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
    },
    pwaAssets: {
      disabled: false,
      config: true,
      integration: {
        baseUrl: '/',
        publicDir: 'public',
      },
    },
    includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
    workbox: {
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//, /^\/_nuxt\//],
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,json}'],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.finerdy\.app\/api\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 24 hours
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            networkTimeoutSeconds: 10,
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  // Global CSS (after Tailwind)
  css: ['~/assets/css/main.css'],

  // App configuration
  app: {
    baseURL: '/',
    head: {
      title: 'Finerdy',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: 'Personal finance management' },
        { name: 'theme-color', content: '#ef4444' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Finerdy' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png', sizes: '180x180' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  sentry: {
    org: 'andres-smerkin',
    project: 'finerdy-pwa',
  },

  sourcemap: {
    client: 'hidden',
  },
})