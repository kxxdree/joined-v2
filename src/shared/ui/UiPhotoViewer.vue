<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import UiModal from './UiModal.vue'

/** Просмотр фото на затемнённом экране: стрелки, точки, ← → и Esc, клик мимо закрывает. v-model - индекс фото, null - закрыто */
const props = defineProps<{ photos: readonly string[]; alt?: string }>()
const current = defineModel<number | null>({ required: true })

const open = computed({ get: () => current.value !== null, set: (v) => { if (!v) current.value = null } })
const step = (d: number) => {
  if (current.value !== null) current.value = Math.min(Math.max(current.value + d, 0), props.photos.length - 1)
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
watch(open, (v) => {
  if (!import.meta.client) return
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <UiModal v-model="open" bare>
    <button type="button" class="absolute top-5 right-5 grid size-10 place-items-center text-white/80 transition-colors hover:text-white" aria-label="Закрыть" @click="open = false">
      <UiIcon name="x" :size="26" />
    </button>
    <div v-if="current !== null" class="relative" role="dialog" aria-modal="true" :aria-label="`${alt ?? 'Фото'} ${current + 1} из ${photos.length}`">
      <img :src="photos[current]" :alt="`${alt ?? 'Фото'} ${current + 1}`" class="block max-h-[calc(100dvh-3rem)] max-w-full object-contain sm:max-w-[calc(100vw-7rem)]">
      <button v-if="current > 0" type="button" class="absolute top-1/2 left-3 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink transition-colors hover:bg-white" aria-label="Предыдущее фото" @click="step(-1)">
        <UiIcon name="chevron-left" :size="20" />
      </button>
      <button v-if="current < photos.length - 1" type="button" class="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink transition-colors hover:bg-white" aria-label="Следующее фото" @click="step(1)">
        <UiIcon name="chevron-right" :size="20" />
      </button>
      <div v-if="photos.length > 1" class="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden="true">
        <span v-for="(_, i) in photos" :key="i" class="size-1.5 rounded-full transition-colors" :class="i === current ? 'bg-white' : 'bg-white/40'" />
      </div>
    </div>
  </UiModal>
</template>
