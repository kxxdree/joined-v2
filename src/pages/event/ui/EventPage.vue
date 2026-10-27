<script setup lang="ts">
import { getEvent } from '@entities/event'
import { getVenue } from '@entities/venue'
import { genreName } from '@shared/config'
import { dayNumber, formatWeekdayLong, monthShort } from '@shared/lib'
import { UiIcon, UiPhoto } from '@shared/ui'

const route = useRoute()
const found = getEvent(String(route.params.id))
if (!found) throw createError({ statusCode: 404, message: 'Событие не найдено', fatal: true })
const ev = found
const venue = getVenue(ev.venue)!
const posters = ev.posters ?? []

// Деталка - только афиша. Несколько афиш листаются стрелками, точками, свайпом и клавиатурой
const slide = ref(0)
const track = ref<HTMLElement>()
// листаем прокруткой ленты, а текущую афишу считаем по её положению - так свайп и стрелки не расходятся
const onScroll = () => {
  const el = track.value
  if (el) slide.value = Math.round(el.scrollLeft / el.clientWidth)
}
const go = (i: number) => {
  const el = track.value
  if (el) el.scrollTo({ left: Math.min(Math.max(i, 0), posters.length - 1) * el.clientWidth, behavior: 'smooth' })
}

// Рамка ленты - по пропорциям первой афиши, как в Instagram; остальные вписываются в неё целиком.
// Высота ограничена экраном и шириной вьюпорта, чтобы рамка не теряла пропорции на узких экранах
const ratio = ref(9 / 16)
const frame = computed(() => ({
  aspectRatio: String(ratio.value),
  height: `min(calc(100svh - 11rem), 55rem, calc((100vw - 2rem) / ${ratio.value}))`,
}))
onMounted(() => {
  if (!posters.length) return
  const img = new Image()
  img.onload = () => { if (img.naturalHeight) ratio.value = img.naturalWidth / img.naturalHeight }
  img.src = posters[0]!
})

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') go(slide.value - 1)
  if (e.key === 'ArrowRight') go(slide.value + 1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

useHead({ title: `${ev.title} - Joined`, meta: [{ name: 'description', content: ev.description }] })
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <!-- подложка: та же афиша, сильно размытая - страница окрашивается в её цвета -->
    <Transition enter-active-class="transition-opacity duration-700" leave-active-class="transition-opacity duration-700 absolute inset-0" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <img :key="posters[slide] ?? ev.photo" :src="posters[slide] ?? ev.photo" alt="" aria-hidden="true" class="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-35 blur-3xl">
    </Transition>
    <div class="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-ink/40 via-transparent to-ink" />

    <div class="container-x pt-6 pb-12">
      <NuxtLink to="/events" class="btn-ghost mb-5 pl-3"><UiIcon name="chevron-left" :size="16" /> Афиша</NuxtLink>

      <h1 class="sr-only">{{ ev.title }}</h1>

      <div class="mx-auto flex w-fit flex-col items-center gap-5">
        <!-- Лента как карусель в Instagram: афиши стоят в ряд и перелистываются сдвигом, свайп идёт за пальцем -->
        <div v-if="posters.length" class="relative">
          <div
            ref="track"
            class="scroll-x snap-x snap-mandatory gap-0 rounded-4xl bg-black py-0 shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)]"
            :style="frame"
            @scroll.passive="onScroll"
          >
            <img
              v-for="(src, i) in posters"
              :key="i"
              :src="src"
              :alt="`Афиша ${i + 1}: ${ev.title}`"
              class="h-full w-full shrink-0 snap-center object-contain"
            >
          </div>

          <template v-if="posters.length > 1">
            <span class="glass-chip absolute top-4 right-4 rounded-lg px-2 py-1 text-xs font-semibold tracking-wider tabular-nums">{{ slide + 1 }} / {{ posters.length }}</span>
            <button type="button" class="btn-icon absolute top-1/2 left-3 size-10 -translate-y-1/2 bg-black/50 sm:-left-16" :disabled="!slide" aria-label="Предыдущая афиша" @click="go(slide - 1)"><UiIcon name="chevron-left" :size="20" /></button>
            <button type="button" class="btn-icon absolute top-1/2 right-3 size-10 -translate-y-1/2 bg-black/50 sm:-right-16" :disabled="slide === posters.length - 1" aria-label="Следующая афиша" @click="go(slide + 1)"><UiIcon name="chevron-right" :size="20" /></button>
          </template>
        </div>

        <!-- Афиши нет - собираем её сами в духе лайнапа: тонированное фото, крупное название, дата плашкой -->
        <article v-else class="rim relative aspect-9/16 h-[calc(100svh-11rem)] max-h-220 min-h-120 max-w-[calc(100vw-2rem)] overflow-hidden rounded-4xl bg-black shadow-[0_40px_90px_-30px_rgb(0_0_0/0.95)]">
          <UiPhoto :src="ev.photo" :alt="ev.title" class="absolute inset-0 h-full w-full grayscale" />
          <div class="pointer-events-none absolute inset-0 bg-[#c98a5a] mix-blend-multiply" />
          <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/90" />

          <div class="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
            <div class="flex items-start justify-between gap-4 text-xs leading-tight font-semibold tracking-wider text-[#fff1e0] uppercase">
              <p>{{ venue.name }}<br><span class="text-white/70">{{ venue.address }}</span></p>
              <p class="shrink-0 text-right">{{ formatWeekdayLong(ev.date) }}<br><span class="text-white/70">{{ ev.time }}</span></p>
            </div>

            <div class="grid gap-5">
              <p class="h-display text-5xl font-bold wrap-break-word hyphens-auto text-[#fff1e0] uppercase sm:text-6xl" lang="ru">{{ ev.title }}</p>
              <div class="flex items-end justify-between gap-4">
                <p class="flex flex-wrap gap-x-3 text-xs font-semibold tracking-wider text-[#fff1e0] uppercase">
                  <span v-for="g in ev.genres" :key="g">{{ genreName(g) }}</span>
                </p>
                <div class="shrink-0 bg-accent px-3 py-2 text-right font-display leading-[0.9] font-semibold uppercase">
                  <div class="text-4xl">{{ dayNumber(ev.date) }}</div>
                  <div class="text-base">{{ monthShort(ev.date) }}</div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div v-if="posters.length > 1" class="flex gap-2">
          <button
            v-for="(_, i) in posters"
            :key="i"
            type="button"
            class="h-1.5 rounded-full transition-all duration-500 ease-liquid"
            :class="i === slide ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'"
            :aria-label="`Афиша ${i + 1}`"
            :aria-current="i === slide"
            @click="go(i)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
