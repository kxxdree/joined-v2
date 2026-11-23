<script setup lang="ts">
import { useToast } from '../lib/toast'
import UiIcon from './UiIcon.vue'

const { toasts } = useToast()
const route = useRoute()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 z-[200] flex flex-col items-center gap-2 px-4"
    :class="route.path.startsWith('/partner/') ? 'bottom-[calc(10rem+env(safe-area-inset-bottom))] sm:bottom-[calc(6rem+env(safe-area-inset-bottom))]' : 'bottom-[max(1rem,env(safe-area-inset-bottom))]'" aria-live="polite">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-[var(--ease-liquid)]"
      enter-from-class="opacity-0 translate-y-3 scale-95"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-for="t in toasts" :key="t.id" class="glass-strong flex items-center gap-2 rounded-full px-5 py-3 text-sm">
        <UiIcon name="check" :size="16" class="text-accent-text" />
        {{ t.text }}
      </div>
    </TransitionGroup>
  </div>
</template>
