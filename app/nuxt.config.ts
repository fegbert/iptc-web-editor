import { defineNuxtConfig } from 'nuxt/config'
import { name, version } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-12',
  app: {
    head: {
      title: 'IPTC Web Editor',
      meta: [
        { name: 'description', content: 'A web-based IPTC metadata editor for images. Currently supports JPEG files with IPTC-IIM metadata.' },
      ],
    },
  },
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
