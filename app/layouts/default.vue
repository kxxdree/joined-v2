<script setup lang="ts">
import { AppFooter } from '@widgets/footer'
import { AppHeader } from '@widgets/header'

const route = useRoute()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter v-if="!route.meta.hideFooter" />
  </div>
</template>
