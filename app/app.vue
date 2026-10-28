<script setup lang="ts">
import { UiGlassDefs, UiPageBackground, UiToaster } from '@shared/ui'
</script>

<template>
  <UiPageBackground />
  <UiGlassDefs />
  <NuxtLoadingIndicator color="linear-gradient(90deg,#ff6d29,#ffc4a3)" :height="2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
</template>
