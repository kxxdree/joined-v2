<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, type EventItem } from '@entities/event'
import { getVenue } from '@entities/venue'
import { ShareButton } from '@features/share'
import { addDays, dayNumber, formatDay, formatWeekday, formatWeekdayLong, todayISO } from '@shared/lib'
import { UiEmpty, UiIcon } from '@shared/ui'

/** Афиша заведения: полоса дней и плитки выбранного дня встык, как галерея (слева афиша, справа её размытые цвета).
 * Клик по афише - событие open (страница открывает её в историях), «Забронировать» - событие book */
const props = defineProps<{ events: EventItem[] }>()
const emit = defineEmits<{ open: [id: string]; book: [] }>()

const sorted = computed(() => [...props.events].sort(byDateTime))
const today = todayISO()

// недели отсчитываем от сегодня; в полосе только те, где есть выступления - стрелки не ведут в пустоту
const weekOf = (iso: string) => Math.floor((Date.parse(iso) - Date.parse(today)) / 864e5 / 7)
const eventDays = computed(() => new Set(sorted.value.map(e => e.date)))
const weeks = computed(() => [...new Set(sorted.value.map(e => weekOf(e.date)))].sort((a, b) => a - b))

const selected = ref(sorted.value[0]?.date ?? today)
const weekIdx = computed(() => weeks.value.indexOf(weekOf(selected.value)))
const days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(today, weekOf(selected.value) * 7 + i)))
const dayEvents = computed(() => sorted.value.filter(e => e.date === selected.value))

const goWeek = (step: number) => {
  const week = weeks.value[weekIdx.value + step]
  const first = sorted.value.find(e => weekOf(e.date) === week)
  if (first) selected.value = first.date
}

const artistNames = (e: EventItem) =>
  e.artists.map(a => getArtist(a)?.name).filter(Boolean).join(', ') || 'Резиденты заведения'

// Файл для календаря: время локальное для заведения; длительности в данных нет, поэтому только начало
const addToCalendar = (e: EventItem) => {
  const esc = (s: string) => s.replace(/[\\,;]/g, '\\$&')
  const address = getVenue(e.venue)?.address ?? ''
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Joined//RU', 'BEGIN:VEVENT',
    `UID:${e.id}@joined`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`,
    `DTSTART:${e.date.replaceAll('-', '')}T${e.time.replace(':', '')}00`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(address)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${e.title}.ics`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="sorted.length">
    <!-- Полоса дней - те же плоские кнопки, что вкладки и жанры; на телефоне с отступами, плитки ниже от края до края -->
    <div class="px-4 sm:px-0">
      <div class="flex items-center gap-1 sm:max-w-xl">
        <button v-if="weeks.length > 1" type="button" class="btn-icon size-9" :disabled="weekIdx <= 0" aria-label="Раньше" @click="goWeek(-1)">
          <UiIcon name="chevron-left" :size="18" />
        </button>
        <div class="grid min-w-0 flex-1 grid-cols-7 gap-1">
          <button
            v-for="d in days"
            :key="d"
            type="button"
            class="pill flex-col gap-0 px-0 py-1 disabled:opacity-30"
            :class="{ 'pill-active': d === selected }"
            :disabled="!eventDays.has(d)"
            :aria-pressed="d === selected"
            :aria-label="formatDay(d)"
            @click="selected = d"
          >
            <span class="font-mono text-[10px] uppercase">{{ formatWeekday(d) }}</span>
            <span class="tabular-nums">{{ dayNumber(d) }}</span>
          </button>
        </div>
        <button v-if="weeks.length > 1" type="button" class="btn-icon size-9" :disabled="weekIdx >= weeks.length - 1" aria-label="Позже" @click="goWeek(1)">
          <UiIcon name="chevron-right" :size="18" />
        </button>
      </div>
      <h2 class="mono-cap mt-5">{{ formatWeekdayLong(selected) }}, {{ formatDay(selected) }}</h2>
    </div>

    <!-- Плитки встык и без скруглений, как галерея и каталог -->
    <div class="mt-3 grid grid-cols-1 gap-0.5">
      <article v-for="e in dayEvents" :key="e.id" class="grid min-h-56 min-w-0 grid-cols-[2fr_3fr] overflow-hidden bg-brown sm:min-h-64 sm:grid-cols-2">
        <!-- Афиша: картинка-постер видна целиком на своём размытом фоне, обычное фото заполняет блок -->
        <a :href="`/events?event=${e.id}`" class="relative block overflow-hidden" :aria-label="`Открыть афишу: ${e.title}`" @click.exact.prevent="emit('open', e.id)">
          <img v-if="e.posters?.length" :src="e.posters[0]" alt="" loading="lazy" class="absolute -inset-1/5 size-[140%] max-w-none object-cover blur-2xl">
          <img :src="e.posters?.[0] ?? e.photo" :alt="e.title" loading="lazy" class="absolute inset-0 size-full" :class="e.posters?.length ? 'object-contain' : 'object-cover'">
        </a>

        <!-- Панель: та же картинка, отражённая и размытая, сверху затемнение - цвета продолжают афишу, но не спорят с текстом -->
        <div class="relative flex min-w-0 flex-col gap-4 overflow-hidden p-3 sm:p-5">
          <img :src="e.posters?.[0] ?? e.photo" alt="" loading="lazy" class="absolute -inset-1/5 size-[140%] max-w-none -scale-x-100 object-cover blur-3xl" aria-hidden="true">
          <div class="absolute inset-0 bg-ink/70" />

          <div class="relative min-w-0">
            <h3 class="font-medium wrap-break-word sm:text-lg">{{ e.title }}</h3>
            <p class="mono-cap mt-1 line-clamp-2">{{ e.time }} · {{ artistNames(e) }}</p>
          </div>

          <div class="relative mt-auto flex flex-wrap items-center gap-1">
            <ShareButton :title="e.title" :url="`/events?event=${e.id}`" class="size-9" />
            <button type="button" class="btn-icon size-9" aria-label="Добавить в календарь" @click="addToCalendar(e)"><UiIcon name="calendar" :size="18" /></button>
            <button type="button" class="btn-dark h-9 flex-1 px-3 sm:ml-auto sm:flex-none" @click="emit('book')">Забронировать</button>
          </div>
        </div>
      </article>
    </div>
  </div>
  <UiEmpty v-else icon="calendar" title="Выступлений пока нет" text="В эти даты бар работает в обычном режиме" />
</template>
