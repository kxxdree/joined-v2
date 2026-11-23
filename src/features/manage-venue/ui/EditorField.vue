<script setup lang="ts">
defineProps<{ label: string; hint?: string; required?: boolean }>()
</script>

<template>
  <label class="block min-w-0">
    <span class="mb-2 block text-sm font-medium">{{ label }} <span v-if="required" class="text-accent-text" aria-label="обязательное поле">*</span></span>
    <slot />
    <span v-if="hint" class="mt-2 block text-sm leading-relaxed text-muted">{{ hint }}</span>
  </label>
</template>
