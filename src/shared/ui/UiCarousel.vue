<script setup lang="ts">
import UiIcon from './UiIcon.vue'

/** Горизонтальная лента со стрелками: стрелки видны, только когда содержимое не влезает. Элементам - snap-start и ширину */
const track = ref<HTMLElement>()
const canPrev = ref(false)
const canNext = ref(false)

let resizeObserver: ResizeObserver | undefined

const updateScrollAvailability = () => {
  const trackElement = track.value
  if (!trackElement) return
  canPrev.value = trackElement.scrollLeft > 1
  canNext.value = trackElement.scrollLeft + trackElement.clientWidth < trackElement.scrollWidth - 1
}
// листаем на ширину видимой части
const scrollByPage = (direction: number) => track.value?.scrollBy({ left: direction * track.value.clientWidth, behavior: 'smooth' })

onMounted(() => {
  resizeObserver = new ResizeObserver(updateScrollAvailability)
  resizeObserver.observe(track.value!)
  updateScrollAvailability()
})
// элементы добавили/удалили - пересчитать
onUpdated(updateScrollAvailability)
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <div class="relative">
    <div ref="track" class="scroll-x snap-x snap-mandatory py-0" @scroll.passive="updateScrollAvailability">
      <slot />
    </div>
    <button v-show="canPrev" type="button" class="btn-icon absolute top-1/2 left-2 size-9 -translate-y-1/2 bg-black/50" aria-label="Назад" @click="scrollByPage(-1)">
      <UiIcon name="chevron-left" :size="18" />
    </button>
    <button v-show="canNext" type="button" class="btn-icon absolute top-1/2 right-2 size-9 -translate-y-1/2 bg-black/50" aria-label="Вперёд" @click="scrollByPage(1)">
      <UiIcon name="chevron-right" :size="18" />
    </button>
  </div>
</template>
