<script setup lang="ts">
import type { Venue } from '@entities/venue'
import { UiEmpty, UiIcon, UiPhoto, UiPhotoViewer } from '@shared/ui'

const props = defineProps<{ venue: Venue }>()
const tab = ref<'bar' | 'kitchen'>('bar')
const photos = computed(() => props.venue.menu[tab.value])
const current = ref<number | null>(null)
</script>

<template>
  <div>
    <div class="segmented mb-4 max-sm:ml-4">
      <button type="button" :aria-pressed="tab === 'bar'" @click="tab = 'bar'"><UiIcon name="glass" :size="16" /> Бар</button>
      <button type="button" :aria-pressed="tab === 'kitchen'" @click="tab = 'kitchen'"><UiIcon name="utensils" :size="16" /> Кухня</button>
    </div>
    <!-- Страницы меню - фото, загруженные заведением; сетка как у галереи, по нажатию - целиком -->
    <div v-if="photos.length" class="grid grid-cols-3 gap-0.5 lg:grid-cols-5">
      <button v-for="(src, i) in photos" :key="src" type="button" class="block" :aria-label="`Открыть страницу меню ${i + 1}`" @click="current = i">
        <UiPhoto :src="src" :alt="`Меню, страница ${i + 1}`" class="aspect-3/4" />
      </button>
    </div>
    <UiEmpty v-else icon="utensils" title="Меню пока не загружено" :text="`Заведение ещё не добавило меню ${tab === 'bar' ? 'бара' : 'кухни'}`" />

    <UiPhotoViewer v-model="current" :photos="photos" alt="Страница меню" />
  </div>
</template>
