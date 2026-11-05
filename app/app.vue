<script setup lang="ts">
import { UiGlassDefs, UiPageBackground, UiToaster } from '@shared/ui'
</script>

<template>
  <UiPageBackground />
  <UiGlassDefs />
  <NuxtLoadingIndicator color="#ff6d29" :height="2" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UiToaster />
</template>
