<script setup lang="ts">
import type { ToasterProps } from '@nuxt/ui'

const toaster: ToasterProps = { position: 'top-center' }
</script>

<template>
  <UApp :toaster="toaster">
    <LayoutHeader />
    <div class="pt-[var(--u-header-height)]">
      <slot />
    </div>
  </UApp>
</template>
