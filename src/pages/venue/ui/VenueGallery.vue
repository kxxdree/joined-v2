<script setup lang="ts">
import { plural } from '@shared/lib'
import { UiIcon, UiModal, UiPhoto, UiSectionHead } from '@shared/ui'

const props = defineProps<{ photos: string[] }>()

const current = ref<number | null>(null)
const open = computed({ get: () => current.value !== null, set: (v) => { if (!v) current.value = null } })
const step = (d: number) => {
  if (current.value !== null) current.value = Math.min(Math.max(current.value + d, 0), props.photos.length - 1)
}

// Сетка встык, все фото одного размера; последнее растягивается, чтобы закрыть неполный ряд
// (2 колонки на телефоне, 3 - с md)
const tile = (i: number) => {
  const n = props.photos.length
  if (i !== n - 1) return { span: '', aspect: 'aspect-square' }
  const oddMobile = n % 2 === 1
  const restDesktop = n % 3
  return {
    span: [oddMobile && 'max-md:col-span-2', restDesktop === 1 && 'md:col-span-3', restDesktop === 2 && 'md:col-span-2'].filter(Boolean).join(' '),
    aspect: [
      oddMobile ? 'aspect-2/1' : 'aspect-square',
      restDesktop === 1 ? 'md:aspect-3/1' : restDesktop === 2 ? 'md:aspect-2/1' : 'md:aspect-square',
    ].join(' '),
  }
}
</script>

<template>
  <div>
    <UiSectionHead eyebrow="Галерея" title="Интерьер и события" :subtitle="`${photos.length} ${plural(photos.length, ['фото', 'фото', 'фото'])}`" />
    <!-- Сетка встык и без скруглений, как карточки мест и событий; рамка - как у обложки заведения -->
    <div class="rim relative grid grid-cols-2 overflow-hidden bg-ink md:grid-cols-3">
      <button
        v-for="(src, i) in photos"
        :key="src"
        type="button"
        class="group relative overflow-hidden"
        :class="tile(i).span"
        :aria-label="`Открыть фото ${i + 1}`"
        @click="current = i"
      >
        <UiPhoto :src="src" :alt="`Фото ${i + 1}`" class="h-full w-full transition-transform duration-700 ease-liquid group-hover:scale-[1.04]" :class="tile(i).aspect" />
        <!-- лёгкое затемнение, снимается при наведении -->
        <span class="pointer-events-none absolute inset-0 bg-black/15 transition-colors duration-500 group-hover:bg-transparent" />
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
