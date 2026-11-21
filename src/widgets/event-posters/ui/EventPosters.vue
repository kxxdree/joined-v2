<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, EventTextPoster, type EventItem } from '@entities/event'
import { addDays, formatDate, todayISO } from '@shared/lib'
import { UiEmpty, UiIcon, UiPills } from '@shared/ui'

const props = defineProps<{ events: EventItem[] }>()
const emit = defineEmits<{ open: [id: string] }>()
const failedPosters = ref<Record<string, boolean>>({})
const uploadedPoster = (event: EventItem) => {
  const src = event.posters?.[0]
  return src && !failedPosters.value[src] ? src : undefined
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
  if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey || mouse.button !== 0) return
  mouse.preventDefault()
  emit('open', id)
}
</script>

<template>
  <div>
    <UiPills v-model="period" :options="periods" all-label="Все даты" class="mb-7" />

    <div v-if="visibleEvents.length" class="poster-grid">
      <a
        v-for="event in visibleEvents"
        :key="event.id"
        :href="`/events?event=${event.id}`"
        class="event-poster group"
        :aria-label="`${event.title}, ${formatDate(event.date)}, ${event.time}. Открыть афишу`"
        @click="openEvent($event, event.id)"
      >
        <img
          v-if="uploadedPoster(event)"
          :src="uploadedPoster(event)"
          :alt="`Афиша: ${event.title}`"
          loading="lazy"
          decoding="async"
          class="uploaded-poster"
          @error="failedPosters[event.posters![0]!] = true"
        >
        <EventTextPoster v-else :event="event" :artist-names="artistNames(event)" />
        <span class="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/40 group-focus-visible:bg-black/40" aria-hidden="true" />
        <span v-if="event.posters && event.posters.length > 1" class="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md" aria-hidden="true"><UiIcon name="image" :size="14" />{{ event.posters.length }}</span>
      </a>
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
