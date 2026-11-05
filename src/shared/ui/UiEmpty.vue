<script setup lang="ts">
import UiIcon from './UiIcon.vue'

defineProps<{ icon?: string; title: string; text?: string }>()
</script>

<template>
  <div class="flex flex-col items-center px-6 py-14 text-center">
    <UiIcon :name="icon ?? 'search'" :size="24" class="mb-3 text-white/50" />
    <h3 class="font-medium">{{ title }}</h3>
    <p v-if="text" class="mt-1 max-w-sm text-sm text-white/60">{{ text }}</p>
    <div class="mt-5 empty:hidden"><slot /></div>
  </div>
</template>
