<script setup lang="ts">
import { artists } from '@entities/artist'
import { useBookings } from '@entities/booking'
import { events } from '@entities/event'
import { roleNames, useSession } from '@entities/session'
import { getVenue, VenueCard, venues } from '@entities/venue'
import { FavoriteButton, useFavorites } from '@features/favorites'
import { formatDate, formatDay, formatPrice, plural, todayISO, useToast } from '@shared/lib'
import { UiEmpty, UiIcon, UiPhoto, UiTabs } from '@shared/ui'

useHead({ title: 'Личный кабинет - Joined' })

const route = useRoute()
const { user, logout } = useSession()
const { bookings, confirmed, cancel } = useBookings()
const { favs, toggle } = useFavorites()
const { push } = useToast()

type Tab = 'bookings' | 'history' | 'favorites'
const tabs = computed(() => [
  { id: 'bookings' as Tab, name: 'Бронирования', icon: 'calendar', badge: confirmed.value.length },
  { id: 'history' as Tab, name: 'История посещений', icon: 'clock' },
  { id: 'favorites' as Tab, name: 'Избранное', icon: 'heart' },
])
const tab = ref<Tab>(tabs.value.some(t => t.id === route.query.tab) ? (route.query.tab as Tab) : 'bookings')
watch(tab, t => navigateTo({ query: { tab: t } }, { replace: true }))

// --- История (демо: прошедшие события + наши брони в прошлом)
const history = computed(() => [
  ...events.filter(e => e.id.startsWith('p')).map(e => ({ id: e.id, title: e.title, date: e.date, venue: e.venue, kind: 'Концерт' })),
  ...bookings.value.filter(b => b.date < todayISO()).map(b => ({ id: b.id, title: `Бронь на ${b.guests}`, date: b.date, venue: b.venue, kind: 'Бронь' })),
].sort((a, b) => b.date.localeCompare(a.date)))

// --- Избранное
const favVenues = computed(() => venues.filter(v => favs.value.venues.includes(v.slug)))
const favArtists = computed(() => artists.filter(a => favs.value.artists.includes(a.slug)))
</script>

<template>
  <section class="container-x pt-10">
    <!-- Шапка профиля -->
    <div class="card mb-8 flex flex-wrap items-center gap-5 p-5 sm:p-8">
      <div class="grid size-14 place-items-center rounded-full bg-accent text-2xl font-semibold uppercase sm:size-20 sm:text-3xl">{{ user?.name[0] }}</div>
      <div class="min-w-0 flex-1">
        <h1 class="h-display truncate text-2xl sm:text-6xl">{{ user?.name }}</h1>
        <p class="mt-1 text-muted wrap-anywhere">{{ user?.email }} · {{ user ? roleNames[user.role] : '' }}</p>
      </div>
      <button class="btn-dark" @click="logout()"><UiIcon name="logout" :size="18" /> Выйти</button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <aside class="min-w-0 lg:sticky lg:top-28 lg:h-fit"><UiTabs v-model="tab" :tabs="tabs" /></aside>

      <div class="min-w-0">
        <!-- БРОНИРОВАНИЯ -->
        <div v-if="tab === 'bookings'" class="grid gap-4">
          <template v-if="bookings.length">
            <article v-for="b in bookings" :key="b.id" class="card flex flex-col gap-4 p-3 pr-5 sm:flex-row sm:items-center" :class="b.status === 'cancelled' ? 'opacity-50' : ''">
              <UiPhoto :src="getVenue(b.venue)!.photo" class="size-16 shrink-0 rounded-2xl" />
              <div class="min-w-0 flex-1">
                <NuxtLink :to="`/venues/${b.venue}`" class="text-lg font-medium hover:text-sand">{{ getVenue(b.venue)!.name }}</NuxtLink>
                <p class="text-sm text-muted">{{ formatDay(b.date) }}, {{ b.time }} · {{ b.guests }} {{ plural(b.guests, ['гость', 'гостя', 'гостей']) }} · депозит {{ formatPrice(b.deposit) }}</p>
                <p class="mt-1 text-xs" :class="b.status === 'confirmed' ? 'text-accent-text' : 'text-muted'">
                  {{ b.status === 'confirmed' ? 'Подтверждено' : 'Отменено' }} · № {{ b.id }}
                </p>
              </div>
              <button v-if="b.status === 'confirmed'" class="btn-dark" @click="cancel(b.id); push('Бронь отменена, депозит будет возвращён')">Отменить</button>
            </article>
          </template>
          <UiEmpty v-else icon="calendar" title="Нет бронирований">
            <NuxtLink to="/venues" class="btn-primary">Выбрать бар</NuxtLink>
          </UiEmpty>
        </div>

        <!-- ИСТОРИЯ -->
        <div v-else-if="tab === 'history'" class="card p-6 sm:p-8">
          <ol class="relative border-l border-white/15 pl-7">
            <li v-for="h in history" :key="h.id" class="relative pb-8 last:pb-0">
              <span class="absolute top-1 -left-8.5 size-3 rounded-full bg-accent shadow-[0_0_0_4px_rgb(255_77_0/0.25),0_0_12px_#ff4d00]" />
              <p class="text-xs text-muted">{{ formatDate(h.date) }} · {{ h.kind }}</p>
              <p class="mt-1 text-lg font-medium">{{ h.title }}</p>
              <NuxtLink :to="`/venues/${h.venue}`" class="mt-1 inline-flex items-center gap-1 text-sm text-soft hover:text-sand">
                {{ getVenue(h.venue)?.name }} <UiIcon name="arrow-right" :size="14" />
              </NuxtLink>
            </li>
          </ol>
        </div>

        <!-- ИЗБРАННОЕ -->
        <div v-else-if="tab === 'favorites'" class="grid gap-10">
          <div>
            <h2 class="mb-4 text-2xl font-medium">Заведения</h2>
            <div v-if="favVenues.length" class="grid sm:grid-cols-2 xl:grid-cols-3">
              <VenueCard v-for="v in favVenues" :key="v.slug" :venue="v">
                <template #actions><FavoriteButton kind="venues" :id="v.slug" /></template>
              </VenueCard>
            </div>
            <p v-else class="flex items-start gap-2 text-sm text-muted">
              <UiIcon name="heart" :size="16" class="mt-0.5 shrink-0 text-accent-text" />
              <span>Нажмите ♥ на карточке бара, чтобы сохранить его здесь.</span>
            </p>
          </div>
          <div>
            <h2 class="mb-4 text-2xl font-medium">Артисты</h2>
            <div v-if="favArtists.length" class="grid gap-3">
              <div v-for="a in favArtists" :key="a.slug" class="card flex items-center gap-4 p-2 pr-4">
                <UiPhoto :src="a.photo" class="size-14 shrink-0 rounded-2xl" />
                <NuxtLink :to="`/artists/${a.slug}`" class="min-w-0 flex-1">
                  <p class="truncate font-medium hover:text-sand">{{ a.name }}</p>
                  <p class="text-xs text-muted">В избранном</p>
                </NuxtLink>
                <button class="btn-dark" @click="toggle('artists', a.slug)">Убрать</button>
              </div>
            </div>
            <p v-else class="flex items-start gap-2 text-sm text-muted">
              <UiIcon name="heart" :size="16" class="mt-0.5 shrink-0 text-accent-text" />
              <span>Добавьте артиста в избранное на его странице, чтобы сохранить его здесь.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
