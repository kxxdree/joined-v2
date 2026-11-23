<script setup lang="ts">
import { plural } from '@shared/lib'
import { UiLightbox, UiPhoto, UiSectionHead } from '@shared/ui'

defineProps<{ photos: string[] }>()

const current = ref<number | null>(null)
</script>

<template>
  <div>
    <UiSectionHead eyebrow="Галерея" title="Интерьер и события" :subtitle="`${photos.length} ${plural(photos.length, ['фото', 'фото', 'фото'])}`" />
    <!-- Сетка как в профиле Instagram: всегда 3 колонки, вертикальные плитки 3:4, тонкие зазоры -->
    <div class="grid grid-cols-3 gap-px">
      <button
        v-for="(src, i) in photos"
        :key="src"
        type="button"
        class="group relative aspect-3/4 overflow-hidden bg-ink"
        :aria-label="`Открыть фото ${i + 1}`"
        @click="current = i"
      >
        <UiPhoto :src="src" :alt="`Фото ${i + 1}`" class="absolute! inset-0" />
        <!-- затемнение при наведении, как в Instagram -->
        <span class="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/40 group-focus-visible:bg-black/40" />
      </button>
    </div>

    <UiLightbox v-model="current" :photos="photos" />
  </div>
</template>
