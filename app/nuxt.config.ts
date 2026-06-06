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
  clerk: {
    appearance: {
      variables: {
        colorPrimary: 'var(--color-primary)',
        colorBackground: 'var(--ui-bg)',
        colorText: 'var(--ui-text)',
        colorDanger: 'var(--color-error)',
        colorSuccess: 'var(--color-success)',
        colorWarning: 'var(--color-warning)',
        colorModalBackdrop: 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
  modules: [
    '@clerk/nuxt',
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
