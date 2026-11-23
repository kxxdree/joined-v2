<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { cityName } from '@entities/city'
import { byDateTime, type EventItem, useEventCatalog, isUpcoming, minPrice } from '@entities/event'
import { useVenueCatalog } from '@entities/venue'
import { FavoriteButton } from '@features/favorites'
import { genreName } from '@shared/config'
import { dayNumber, formatPrice, formatWeekdayLong, isWeekend, monthShort } from '@shared/lib'
import { UiEmpty, UiIcon, UiPhoto, UiSectionHead } from '@shared/ui'
import { EventStories } from '@widgets/event-stories'

const { getVenue } = useVenueCatalog()
const { events } = useEventCatalog()
const route = useRoute()
const foundArtist = getArtist(String(route.params.slug))
if (!foundArtist) throw createError({ statusCode: 404, message: 'Артист не найден', fatal: true })
const artist = foundArtist

const artistEvents = computed(() => events.value.filter(e => e.artists.includes(artist.slug)))
// концерты по датам, как на странице афиши
const eventsByDate = computed(() => {
  const eventsByDateMap = new Map<string, EventItem[]>()
  for (const e of artistEvents.value.filter(isUpcoming).sort(byDateTime)) eventsByDateMap.set(e.date, [...(eventsByDateMap.get(e.date) ?? []), e])
  return [...eventsByDateMap.entries()]
})
const formatVenueLocation = (venueSlug: string) => {
  const venue = getVenue(venueSlug)
  return venue ? `${venue.name} · ${cityName(venue.city)}` : ''
}

// концерт - афиша в историях; с модификаторами (новая вкладка и т.п.) ссылка работает как обычно
const storyId = ref<string | null>(null)
const openStory = (e: MouseEvent, id: string) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  storyId.value = id
}

useHead({ title: `${artist.name} - Joined`, meta: [{ name: 'description', content: artist.short }] })
</script>

<template>
  <div>
    <!-- Карточка артиста: постер с именем + «паспорт» на чёрном -->
    <section class="container-x pt-6">
      <NuxtLink to="/artists" class="btn-ghost mb-5 pl-3"><UiIcon name="chevron-left" :size="16" /> Все артисты</NuxtLink>

      <article class="rim relative overflow-hidden rounded-4xl bg-ink">
        <!-- Постер -->
        <div class="relative aspect-4/5 sm:aspect-video lg:aspect-21/9">
          <UiPhoto :src="artist.photo" :alt="artist.name" class="absolute inset-0 h-full w-full" />
          <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-ink" />

          <div class="absolute inset-0 grid place-items-center px-4">
            <h1 class="h-display text-center text-[13vw] font-bold lowercase sm:text-8xl lg:text-9xl">{{ artist.name }}</h1>
          </div>
        </div>

        <!-- Об артисте -->
        <div class="grid gap-10 p-6 sm:p-10 md:grid-cols-[1fr_1.4fr] lg:p-14">
          <div class="flex flex-col justify-between gap-8">
            <h2 class="h-display text-3xl font-bold uppercase sm:text-4xl">Об артисте</h2>
            <p class="text-xs leading-relaxed text-muted">
              Город<br />
              <span class="text-white">{{ cityName(artist.city) }}</span>
            </p>
          </div>

          <div>
            <p class="text-sm leading-relaxed text-soft">{{ artist.bio }}</p>
            <p class="mt-4 flex flex-wrap gap-x-3 text-xs font-semibold tracking-wider uppercase">
              <span v-for="genreId in artist.genres" :key="genreId">{{ genreName(genreId) }}</span>
            </p>

            <div class="mt-10 flex items-center gap-2">
              <FavoriteButton kind="artists" :id="artist.slug" variant="label" />
              <a v-if="artist.socials?.instagram" :href="artist.socials.instagram" target="_blank" rel="noopener" class="btn-icon size-12" aria-label="Instagram">
                <UiIcon name="instagram" :size="20" />
              </a>
              <a v-if="artist.socials?.telegram" :href="artist.socials.telegram" target="_blank" rel="noopener" class="btn-icon size-12" aria-label="Telegram">
                <UiIcon name="telegram" :size="20" />
              </a>
            </div>
          </div>
        </div>
      </article>
    </section>

    <!-- Ближайшие выступления -->
    <section class="container-x mt-24">
      <UiSectionHead eyebrow="Туры" title="Ближайшие выступления" />
      <!-- В стиле афиши: крупная дата слева, концерты дня справа -->
      <div v-if="eventsByDate.length" class="card p-5 sm:p-10">
        <div class="mb-6 flex items-start justify-between gap-4 text-xs tracking-widest uppercase sm:mb-8">
          <span class="text-soft">Концерты<br />{{ artist.name }}</span>
        </div>

        <div v-for="[date, dayEvents] in eventsByDate" :key="date" class="grid gap-4 border-t border-line py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-8">
          <h2 class="h-display text-[16vw] leading-[0.85] uppercase sm:text-8xl md:text-7xl lg:text-9xl" :class="isWeekend(date) ? 'text-sand' : ''">
            {{ monthShort(date) }} {{ dayNumber(date) }}
          </h2>

          <div class="space-y-4 md:pt-2">
            <p class="text-xs tracking-widest uppercase" :class="isWeekend(date) ? 'text-accent-text' : 'text-muted'">{{ formatWeekdayLong(date) }}</p>
            <a v-for="eventItem in dayEvents" :key="eventItem.id" :href="`/events?event=${eventItem.id}`" class="group flex items-baseline justify-between gap-4" @click="openStory($event, eventItem.id)">
              <div class="min-w-0">
                <p class="font-medium uppercase transition-colors group-hover:text-sand">{{ eventItem.title }}</p>
                <p class="mt-0.5 text-xs tracking-wider text-muted uppercase">{{ formatVenueLocation(eventItem.venue) }} · {{ eventItem.time }}</p>
              </div>
              <span class="shrink-0 text-sm tabular-nums">от {{ formatPrice(minPrice(eventItem)) }}</span>
            </a>
          </div>
        </div>
      </div>
      <UiEmpty v-else icon="calendar" title="Концертов пока нет" text="Новые даты появятся здесь, как только артист их объявит." />
    </section>

    <EventStories v-model="storyId" :events="artistEvents" />
  </div>
</template>
