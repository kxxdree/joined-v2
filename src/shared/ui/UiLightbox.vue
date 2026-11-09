<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import UiPhoto from './UiPhoto.vue'

/** Просмотр фото как в Instagram: кадр 3:4, свайп со снапом, круглые стрелки поверх фото, счётчик.
 * v-model - индекс открытого фото (null - закрыт); contain - показывать фото целиком, без обрезки (меню) */
const props = withDefaults(defineProps<{ photos: string[]; alt?: (i: number) => string; contain?: boolean }>(), {
  alt: (i: number) => `Фото ${i + 1}`,
  contain: false,
})
const current = defineModel<number | null>({ required: true })
const track = ref<HTMLElement>()

// Индекс по позиции прокрутки: листается свайпом/тачпадом, стрелками и клавиатурой
const onScroll = () => {
  const el = track.value
  if (el && current.value !== null) current.value = Math.round(el.scrollLeft / el.clientWidth)
}
const go = (i: number) => {
  const el = track.value
  if (!el) return
  const to = Math.min(Math.max(i, 0), props.photos.length - 1)
  el.scrollTo({ left: to * el.clientWidth, behavior: 'smooth' })
}
const close = () => { current.value = null }

const onKey = (e: KeyboardEvent) => {
  if (current.value === null) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') go(current.value - 1)
  else if (e.key === 'ArrowRight') go(current.value + 1)
}

const unlock = () => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  window.removeEventListener('keydown', onKey)
}
// Открытие: блокируем прокрутку страницы и сразу (без анимации) встаём на нужное фото
watch(() => current.value !== null, async (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    await nextTick()
    if (track.value) track.value.scrollLeft = current.value! * track.value.clientWidth
  } else unlock()
})
onBeforeUnmount(() => { if (import.meta.client && current.value !== null) unlock() })
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0">
      <div v-if="current !== null" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85" role="dialog" aria-modal="true" @click.self="close">
        <button type="button" class="absolute top-3 right-3 z-10 grid size-10 place-items-center text-white/90 hover:text-white" aria-label="Закрыть" @click="close">
          <UiIcon name="x" :size="26" />
        </button>

        <div class="relative aspect-3/4 w-[min(100vw,calc(92dvh*3/4))] overflow-hidden bg-ink sm:rounded-md">
          <div
            ref="track"
            class="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            @scroll.passive="onScroll"
          >
            <div v-for="(src, i) in photos" :key="src" class="relative h-full w-full shrink-0 snap-center snap-always">
              <img v-if="contain" :src="src" :alt="alt(i)" loading="lazy" class="absolute inset-0 h-full w-full object-contain">
              <UiPhoto v-else :src="src" :alt="alt(i)" class="absolute! inset-0" />
            </div>
          </div>

          <button
            v-show="current > 0"
            type="button"
            class="absolute top-1/2 left-3 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-black shadow transition-colors hover:bg-white max-sm:hidden"
            aria-label="Предыдущее фото"
            @click="go(current - 1)"
          >
            <UiIcon name="chevron-left" :size="16" />
          </button>
          <button
            v-show="current < photos.length - 1"
            type="button"
            class="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-black shadow transition-colors hover:bg-white max-sm:hidden"
            aria-label="Следующее фото"
            @click="go(current + 1)"
          >
            <UiIcon name="chevron-right" :size="16" />
          </button>

          <span v-if="photos.length > 1" class="pointer-events-none absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            {{ current + 1 }}/{{ photos.length }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
