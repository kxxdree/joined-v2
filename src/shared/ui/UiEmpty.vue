<script setup lang="ts">
import UiIcon from './UiIcon.vue'

defineProps<{ icon?: string; title: string; text?: string }>()
</script>

<template>
  <div class="card flex flex-col items-center px-6 py-14 text-center">
    <div class="mb-5 text-white/40">
      <UiIcon :name="icon ?? 'search'" :size="28" class="stroke-[1.25]" />
    </div>
    <h3 class="text-lg font-medium">{{ title }}</h3>
    <p v-if="text" class="mt-1 max-w-sm text-sm text-muted">{{ text }}</p>
    <div class="mt-5 empty:hidden"><slot /></div>
  </div>
</template>
