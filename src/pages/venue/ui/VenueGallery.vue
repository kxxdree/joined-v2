<script setup lang="ts">
import { plural } from '@shared/lib'
import { UiIcon, UiModal, UiPhoto, UiSectionHead } from '@shared/ui'

const props = defineProps<{ photos: string[] }>()

const current = ref<number | null>(null)
const open = computed({ get: () => current.value !== null, set: (v) => { if (!v) current.value = null } })
const step = (d: number) => {
  if (current.value !== null) current.value = Math.min(Math.max(current.value + d, 0), props.photos.length - 1)
}
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

    <UiModal v-model="open" :title="`${(current ?? 0) + 1} / ${photos.length}`" wide>
      <UiPhoto v-if="current !== null" :src="photos[current]!" class="aspect-4/3 rounded-3xl" />
      <div class="mt-4 flex justify-between">
        <button class="btn-icon" :disabled="!current" aria-label="Предыдущее фото" @click="step(-1)"><UiIcon name="chevron-left" :size="20" /></button>
        <button class="btn-icon" :disabled="current === photos.length - 1" aria-label="Следующее фото" @click="step(1)"><UiIcon name="chevron-right" :size="20" /></button>
      </div>
    </UiModal>
  </div>
</template>
