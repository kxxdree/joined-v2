<script setup lang="ts">
import { type EventItem, minPrice } from '@entities/event'
import { getVenue } from '@entities/venue'
import { formatDay, formatPrice } from '@shared/lib'
import { UiIcon } from '@shared/ui'

/**
 * Афиши события как истории в Instagram: кадр = афиша (нет афиш - обложка события),
 * полоски - какая по счёту афиша; листание вручную и только внутри одного события, после последней - закрытие.
 * v-model - id открытого события; null - закрыто
 */
const props = defineProps<{ events: EventItem[] }>()
const openId = defineModel<string | null>({ required: true })

type Frame = { event: EventItem; src: string; poster: boolean; index: number; count: number }
const frames = computed<Frame[]>(() => {
  const event = props.events.find(e => e.id === openId.value)
  if (!event) return []
  const srcs = event.posters?.length ? event.posters : [event.photo]
  return srcs.map((src, index) => ({ event, src, poster: !!event.posters?.length, index, count: srcs.length }))
})

const pos = ref(0)
const frame = computed(() => frames.value[pos.value])
const venue = computed(() => (frame.value ? getVenue(frame.value.event.venue) : undefined))
const close = () => (openId.value = null)

const go = (p: number) => {
  if (p >= frames.value.length) return close()
  pos.value = Math.max(0, p)
}
const next = () => go(pos.value + 1)
const prev = () => go(pos.value - 1)

// тап по левой трети кадра - назад, по остальному - вперёд
const onTap = (e: MouseEvent) => {
  const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
  if (e.clientX - box.left < box.width / 3) prev()
  else next()
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

// открытие/закрытие: позиция на первой афише события, блок скролла страницы (как в UiModal)
watch(openId, (id) => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKey)
  if (id === null) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    return
  }
  go(0)
  document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKey)
}, { immediate: true }) // сразу: истории могут быть открыты по ссылке ещё при загрузке страницы
onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-[var(--ease-liquid)]" enter-from-class="opacity-0 scale-[0.98]" leave-active-class="transition duration-200" leave-to-class="opacity-0">
      <div v-if="openId !== null && frame" class="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md" role="dialog" aria-modal="true" :aria-label="`Афиша: ${frame.event.title}`" @click.self="close">
        <!-- десктоп: стрелки по бокам кадра (только если у события больше одной афиши) -->
        <template v-if="frames.length > 1">
          <button type="button" class="btn-icon absolute left-6 hidden size-12 sm:grid" :disabled="pos === 0" aria-label="Назад" @click="prev"><UiIcon name="chevron-left" :size="22" /></button>
          <button type="button" class="btn-icon absolute right-6 hidden size-12 sm:grid" :disabled="pos === frames.length - 1" aria-label="Вперёд" @click="next"><UiIcon name="chevron-right" :size="22" /></button>
        </template>

        <!-- Универсальный кадр: всегда 9:16 одного размера (на телефоне - сколько влезает в экран, шире - до 31.5rem).
             Любая картинка вписана целиком, свободное место - размытая копия той же картинки -->
        <div class="relative aspect-9/16 w-[min(100vw,calc(100dvh*9/16))] overflow-hidden bg-ink select-none sm:w-[min(31.5rem,calc(92dvh*9/16))] sm:rounded-3xl">
          <!-- тап-зоны - по всей площади кадра -->
          <div class="absolute inset-0 cursor-pointer" @click="onTap">
            <img :key="`bg-${pos}`" :src="frame.src" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl" draggable="false">
            <img :key="`fg-${pos}`" :src="frame.src" :alt="frame.poster ? `Афиша: ${frame.event.title}` : frame.event.title" class="relative h-full w-full object-contain" draggable="false">
            <!-- нет афиши - обложка с названием, как у карточек -->
            <template v-if="!frame.poster">
              <div class="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-black/40" />
              <h2 class="absolute inset-x-0 bottom-28 px-6 font-display text-4xl leading-[0.95] font-bold wrap-break-word uppercase">{{ frame.event.title }}</h2>
            </template>
            <div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/60 to-transparent" />
            <div class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/70 to-transparent" />
          </div>

          <!-- Полоски: какая по счёту афиша события (пройденные и текущая - белые) + шапка -->
          <div class="pointer-events-none absolute inset-x-0 top-0 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div class="flex gap-1">
              <span v-for="n in frame.count" :key="n" class="h-0.5 flex-1 rounded-full transition-colors" :class="n - 1 <= frame.index ? 'bg-white' : 'bg-white/30'" />
            </div>
            <div class="mt-3 flex items-center justify-between gap-3">
              <div class="min-w-0 text-xs font-semibold tracking-wider uppercase">
                <p class="truncate">{{ venue?.name }}</p>
                <p class="text-accent-text">{{ formatDay(frame.event.date) }} · {{ frame.event.time }}</p>
              </div>
              <button type="button" class="btn-icon pointer-events-auto size-10 bg-black/40" aria-label="Закрыть" @click="close"><UiIcon name="x" :size="20" /></button>
            </div>
          </div>

          <!-- Низ: цена и бронь в заведении (отдельной страницы события нет) -->
          <div class="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <p class="shrink-0 text-xs font-semibold tracking-wider uppercase">от {{ formatPrice(minPrice(frame.event)) }}</p>
            <NuxtLink :to="`/venues/${frame.event.venue}?tab=booking`" class="btn-primary flex-1 py-3.5" @click="close">
              <UiIcon name="calendar" :size="18" /> Забронировать
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
