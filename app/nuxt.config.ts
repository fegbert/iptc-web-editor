import { defineNuxtConfig } from 'nuxt/config'
import { name, version } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-11-30',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      appName: name,
      appVersion: version,
    },
  },
  modules: [
    '@nuxt/ui',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],
  css: ['~/assets/css/main.css'],
  imports: {
    presets: [
      {
        from: 'zod',
        imports: ['z'],
      },
    ],
  },
  colorMode: {
    preference: 'system',
    fallback: 'dark',
  },
})
