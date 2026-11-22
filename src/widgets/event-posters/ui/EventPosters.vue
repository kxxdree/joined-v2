<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, EventTextPoster, type EventItem } from '@entities/event'
import { addDays, formatDate, todayISO } from '@shared/lib'
import { UiEmpty, UiIcon, UiPills } from '@shared/ui'

const props = defineProps<{ events: EventItem[] }>()
const emit = defineEmits<{ open: [id: string] }>()
const failedPosters = ref<Record<string, boolean>>({})
const photoIndexes = ref<Record<string, number>>({})
const posters = (event: EventItem) => event.posters?.length ? event.posters : ['']
let gesture: { x: number; y: number; moved: boolean } | undefined
const onPointerDown = (pointer: PointerEvent) => {
  gesture = { x: pointer.clientX, y: pointer.clientY, moved: false }
}
const onPointerMove = (pointer: PointerEvent) => {
  if (gesture && Math.hypot(pointer.clientX - gesture.x, pointer.clientY - gesture.y) > 10) gesture.moved = true
}
const onScroll = (scroll: Event, id: string) => {
  const track = scroll.currentTarget as HTMLElement
  if (gesture) gesture.moved = true
  photoIndexes.value[id] = Math.round(track.scrollLeft / Math.max(1, track.clientWidth))
}

const periods = [
  { id: 'week', name: 'Неделя' },
  { id: 'month', name: 'Месяц' },
] as const
const period = ref<typeof periods[number]['id'] | ''>('')
const visibleEvents = computed(() => {
  const today = todayISO()
  const until = period.value === 'week' ? addDays(today, 7) : period.value === 'month' ? addDays(today, 31) : ''
  return props.events.filter(event => !until || event.date <= until).sort(byDateTime)
})

const artistNames = (event: EventItem) =>
  event.artists.map(id => getArtist(id)?.name).filter((name): name is string => !!name)

const openEvent = (mouse: MouseEvent, id: string) => {
  if (mouse.detail > 0 && gesture?.moved) {
    mouse.preventDefault()
    return
  }
  if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey || mouse.button !== 0) return
  mouse.preventDefault()
  emit('open', id)
}
</script>

<template>
  <div>
    <UiPills v-model="period" :options="periods" all-label="Все даты" class="mb-7" />

    <div v-if="visibleEvents.length" class="poster-grid">
      <div
        v-for="event in visibleEvents"
        :key="event.id"
        class="event-poster group"
      >
        <a
          :href="`/events?event=${event.id}`"
          class="poster-track"
          :aria-label="`${event.title}, ${formatDate(event.date)}, ${event.time}. Открыть афишу`"
          @click="openEvent($event, event.id)"
          @pointerdown.passive="onPointerDown"
          @pointermove.passive="onPointerMove"
          @pointercancel="gesture && (gesture.moved = true)"
          @scroll.passive="onScroll($event, event.id)"
          @dragstart.prevent
        >
          <div v-for="(src, index) in posters(event)" :key="index" class="poster-slide">
            <img
              v-if="src && !failedPosters[src]"
              :src="src"
              :alt="`Афиша: ${event.title} — фото ${index + 1} из ${posters(event).length}`"
              loading="lazy"
              decoding="async"
              draggable="false"
              class="uploaded-poster"
              @error="failedPosters[src] = true"
            >
            <EventTextPoster v-else :event="event" :artist-names="artistNames(event)" />
          </div>
        </a>
        <span class="poster-shade pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/40 group-focus-within:bg-black/40" aria-hidden="true" />
        <span v-if="event.posters && event.posters.length > 1" class="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md" aria-hidden="true"><UiIcon name="image" :size="14" />{{ (photoIndexes[event.id] ?? 0) + 1 }} / {{ event.posters.length }}</span>
      </div>
    </div>
    <UiEmpty v-else icon="calendar" title="Мероприятий пока нет" text="В эти даты заведение работает в обычном режиме" />
  </div>
</template>

<style scoped>
.poster-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.event-poster {
  position: relative;
  isolation: isolate;
  display: flex;
  aspect-ratio: 3 / 5;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: 0.5rem;
  background: var(--color-ink);
}

.uploaded-poster {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.poster-track {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.poster-track::-webkit-scrollbar {
  display: none;
}

.poster-track:focus-visible {
  outline-offset: -3px;
}

.poster-slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

@media (hover: none) {
  .poster-shade {
    display: none;
  }
}

@media (min-width: 768px) {
  .poster-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .poster-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2.5rem 2rem;
  }
}

@media (max-width: 479px) {
  .poster-grid {
    grid-template-columns: minmax(0, 1fr);
  }

}

</style>
