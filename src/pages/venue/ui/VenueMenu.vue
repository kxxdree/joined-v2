<script setup lang="ts">
import type { Venue } from '@entities/venue'
import { UiEmpty, UiIcon, UiLightbox, UiPhoto } from '@shared/ui'

const props = defineProps<{ venue: Venue }>()
const tab = ref<'bar' | 'kitchen'>('bar')
const photos = computed(() => props.venue.menu[tab.value])

// Просмотр страниц меню - тот же слайдер, что в галерее
const current = ref<number | null>(null)
const menuAlt = (i: number) => `Меню, страница ${i + 1}`
</script>

<template>
  <div class="card p-6 sm:p-10">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h2 class="h-display text-4xl sm:text-5xl">Меню</h2>
      <div class="segmented">
        <button :aria-pressed="tab === 'bar'" @click="tab = 'bar'"><UiIcon name="glass" :size="16" /> Бар</button>
        <button :aria-pressed="tab === 'kitchen'" @click="tab = 'kitchen'"><UiIcon name="utensils" :size="16" /> Кухня</button>
      </div>
    </div>
    <!-- Страницы меню - фото, загруженные заведением -->
    <!-- Сетка как в галерее: всегда 3 колонки, вертикальные плитки 3:4, тонкие зазоры -->
    <div v-if="photos.length" class="grid grid-cols-3 gap-px">
      <button
        v-for="(src, i) in photos"
        :key="src"
        type="button"
        class="group relative aspect-3/4 overflow-hidden bg-ink"
        :aria-label="`Открыть страницу меню ${i + 1}`"
        @click="current = i"
      >
        <UiPhoto :src="src" :alt="menuAlt(i)" class="absolute! inset-0" />
        <!-- затемнение при наведении, как в галерее -->
        <span class="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/40 group-focus-visible:bg-black/40" />
      </button>
    </div>
    <UiEmpty v-else icon="utensils" title="Меню пока не загружено" :text="`Заведение ещё не добавило меню ${tab === 'bar' ? 'бара' : 'кухни'}`" />

    <!-- contain: страницы меню бывают любых пропорций - показываем целиком, без обрезки -->
    <UiLightbox v-model="current" :photos="photos" :alt="menuAlt" contain />
  </div>
</template>
