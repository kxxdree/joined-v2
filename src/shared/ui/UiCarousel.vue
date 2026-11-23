<script setup lang="ts">
import UiIcon from './UiIcon.vue'

/** Горизонтальная лента со стрелками: стрелки видны, только когда содержимое не влезает. Элементам - snap-start и ширину */
const track = ref<HTMLElement>()
const canPrev = ref(false)
const canNext = ref(false)

let ro: ResizeObserver | undefined

const update = () => {
  const el = track.value
  if (!el) return
  canPrev.value = el.scrollLeft > 1
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}
// листаем на ширину видимой части
const go = (d: number) => track.value?.scrollBy({ left: d * track.value.clientWidth, behavior: 'smooth' })

onMounted(() => {
  ro = new ResizeObserver(update)
  ro.observe(track.value!)
  update()
})
// элементы добавили/удалили - пересчитать
onUpdated(update)
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div class="relative">
    <div ref="track" class="scroll-x snap-x snap-mandatory py-0" @scroll.passive="update">
      <slot />
    </div>
    <button v-show="canPrev" type="button" class="btn-icon absolute top-1/2 left-2 size-9 -translate-y-1/2 bg-black/50" aria-label="Назад" @click="go(-1)">
      <UiIcon name="chevron-left" :size="18" />
    </button>
    <button v-show="canNext" type="button" class="btn-icon absolute top-1/2 right-2 size-9 -translate-y-1/2 bg-black/50" aria-label="Вперёд" @click="go(1)">
      <UiIcon name="chevron-right" :size="18" />
    </button>
  </div>
</template>
