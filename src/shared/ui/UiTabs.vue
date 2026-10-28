<script setup lang="ts" generic="T extends string">
import UiIcon from './UiIcon.vue'

/** Разделы кабинета: стеклянное вертикальное меню на десктопе, горизонтальная лента на мобильных */
defineProps<{ tabs: { id: T; name: string; icon: string; badge?: number }[] }>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <nav class="tabs-panel scroll-x -mx-4 px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:p-2" aria-label="Разделы">
    <button
      v-for="t in tabs"
      :key="t.id"
      class="pill gap-3 lg:justify-start lg:py-3"
      :class="model === t.id ? 'pill-active' : 'lg:bg-transparent lg:hover:bg-white/10'"
      :aria-pressed="model === t.id"
      @click="model = t.id"
    >
      <UiIcon :name="t.icon" :size="18" class="hidden lg:block" />
      {{ t.name }}
      <span
        v-if="t.badge"
        class="ml-auto grid min-w-5 place-items-center rounded-md px-1.5 text-xs"
        :class="model === t.id ? 'bg-accent text-white' : 'bg-accent/25 text-[#ffc4a3]'"
      >{{ t.badge }}</span>
    </button>
  </nav>
</template>
