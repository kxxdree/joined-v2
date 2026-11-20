<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, type EventItem } from '@entities/event'
import { genreName } from '@shared/config'
import { addDays, formatDate, formatDay, todayISO } from '@shared/lib'
import { UiEmpty, UiPhoto, UiPills } from '@shared/ui'

const props = defineProps<{ events: EventItem[] }>()
const emit = defineEmits<{ open: [id: string] }>()

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
        class="event-poster"
        :aria-label="`${event.title}, ${formatDate(event.date)}, ${event.time}. Открыть афишу`"
        @click="openEvent($event, event.id)"
      >
        <UiPhoto :src="event.photo" alt="" class="poster-photo" />
        <div class="poster-shade" aria-hidden="true" />

        <div class="poster-content">
          <div class="poster-main">
            <h3 class="poster-title">{{ event.title }}</h3>
            <p class="poster-date"><time :datetime="`${event.date}T${event.time}`">{{ formatDay(event.date) }}</time></p>
            <p class="poster-time">{{ event.time }}</p>
            <ul v-if="event.artists.length" class="poster-artists">
              <li v-for="name in artistNames(event)" :key="name">{{ name }}</li>
            </ul>
            <p v-else class="poster-genres">{{ event.genres.map(genreName).join(' / ') }}</p>
          </div>
        </div>
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
  transition: border-color 220ms, transform 220ms;
}

.poster-photo,
.poster-shade {
  position: absolute;
  z-index: -1;
  inset: 0;
}

.poster-photo {
  transition: transform 600ms var(--ease-liquid);
}

.poster-shade {
  background: linear-gradient(180deg, rgb(10 8 10 / 0.4), rgb(10 8 10 / 0.62) 40%, rgb(10 8 10 / 0.48) 70%, rgb(10 8 10 / 0.85));
}

.poster-content {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: 1.5rem 1.1rem;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0 2px 16px rgb(0 0 0 / 0.45);
}

.poster-main {
  padding-block: 2rem;
}

.poster-title {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2.1vw, 1.6rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.035em;
  overflow-wrap: anywhere;
}

.poster-date {
  margin-top: 1.25rem;
  color: var(--color-white);
  font-size: 1rem;
  font-weight: 700;
}

.poster-artists,
.poster-genres {
  margin-top: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.poster-time {
  margin-top: 0.35rem;
  font-size: 1.125rem;
  font-weight: 500;
}

.event-poster:hover,
.event-poster:focus-visible {
  border-color: var(--color-accent-text);
}

.event-poster:hover .poster-photo {
  transform: scale(1.04);
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

  .poster-content {
    padding: 1.75rem;
  }

  .poster-title {
    font-size: 1.75rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .event-poster,
  .poster-photo {
    transition: none;
  }
}
</style>
