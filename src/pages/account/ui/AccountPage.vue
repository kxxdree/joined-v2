<script setup lang="ts">
import { artists } from '@entities/artist'
import { useBookings } from '@entities/booking'
import { events } from '@entities/event'
import { roleNames, useSession } from '@entities/session'
import { formatName, getVenue, venues } from '@entities/venue'
import { FavoriteButton, useFavorites } from '@features/favorites'
import { formatDate, formatDay, formatPrice, plural, todayISO, useToast } from '@shared/lib'
import { UiEmpty, UiIcon, UiPageHead, UiPhoto, UiTabs } from '@shared/ui'

useHead({ title: 'Профиль - Joined' })

const route = useRoute()
const { user, logout } = useSession()
const { bookings, confirmed, cancel } = useBookings()
const { favs } = useFavorites()
const { push } = useToast()

type Tab = 'bookings' | 'history' | 'favorites'
const tabs = computed(() => [
  { id: 'bookings' as Tab, name: 'Бронирования', icon: 'calendar', badge: confirmed.value.length },
  { id: 'history' as Tab, name: 'История', icon: 'clock' },
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
  <div>
    <div class="container-x">
      <UiPageHead :title="user?.name ?? ''" :initial="user?.name[0]" :caption="`${user?.email} · ${user ? roleNames[user.role] : ''}`">
        <template #actions>
          <button type="button" class="btn-icon size-10" aria-label="Выйти" @click="logout()"><UiIcon name="logout" :size="18" /></button>
        </template>
      </UiPageHead>
    </div>
    <UiTabs v-model="tab" :tabs="tabs" class="container-x" />

    <section class="container-x pt-3">
      <div class="max-w-3xl">
        <!-- БРОНИРОВАНИЯ -->
        <template v-if="tab === 'bookings'">
          <ul v-if="bookings.length">
            <li v-for="b in bookings" :key="b.id" class="hair-row flex items-center gap-3" :class="{ 'opacity-50': b.status === 'cancelled' }">
              <UiPhoto :src="getVenue(b.venue)!.photo" class="aspect-3/4 w-11 shrink-0 rounded-lg" />
              <div class="min-w-0 flex-1">
                <NuxtLink :to="`/venues/${b.venue}`" class="block truncate font-medium hover:text-sand">{{ getVenue(b.venue)!.name }}</NuxtLink>
                <p class="mono-cap mt-1">{{ formatDay(b.date) }}, {{ b.time }} · {{ b.guests }} {{ plural(b.guests, ['гость', 'гостя', 'гостей']) }} · депозит {{ formatPrice(b.deposit) }}</p>
                <p class="mono-cap mt-0.5" :class="{ 'text-accent-text': b.status === 'confirmed' }">{{ b.status === 'confirmed' ? 'Подтверждено' : 'Отменено' }} · № {{ b.id }}</p>
              </div>
              <button v-if="b.status === 'confirmed'" type="button" class="btn-dark" @click="cancel(b.id); push('Бронь отменена, депозит будет возвращён')">Отменить</button>
            </li>
          </ul>
          <UiEmpty v-else icon="calendar" title="Нет бронирований">
            <NuxtLink to="/venues" class="btn-primary">Выбрать бар</NuxtLink>
          </UiEmpty>
        </template>

        <!-- ИСТОРИЯ -->
        <template v-else-if="tab === 'history'">
          <ul v-if="history.length">
            <li v-for="h in history" :key="h.id" class="hair-row">
              <p class="mono-cap">{{ formatDate(h.date) }} · {{ h.kind }}</p>
              <p class="mt-1 font-medium">{{ h.title }}</p>
              <NuxtLink :to="`/venues/${h.venue}`" class="mt-0.5 inline-block text-sm text-white/70 hover:text-sand">{{ getVenue(h.venue)?.name }}</NuxtLink>
            </li>
          </ul>
          <UiEmpty v-else icon="clock" title="История пока пуста" />
        </template>

        <!-- ИЗБРАННОЕ -->
        <div v-else class="grid gap-8">
          <div>
            <h2 class="mono-cap mb-1">Заведения</h2>
            <ul v-if="favVenues.length">
              <li v-for="v in favVenues" :key="v.slug" class="hair-row flex items-center gap-3">
                <NuxtLink :to="`/venues/${v.slug}`" class="group flex min-w-0 flex-1 items-center gap-3">
                  <UiPhoto :src="v.photo" :alt="v.name" class="aspect-3/4 w-11 shrink-0 rounded-lg" />
                  <div class="min-w-0">
                    <p class="truncate font-medium group-hover:text-sand">{{ v.name }}</p>
                    <p class="mono-cap mt-1 truncate">{{ formatName(v.format) }} · {{ v.metro ? `м. ${v.metro}` : v.address }}</p>
                  </div>
                </NuxtLink>
                <FavoriteButton kind="venues" :id="v.slug" class="size-10" />
              </li>
            </ul>
            <p v-else class="py-3 text-sm text-white/60">Нажмите ♥ на странице бара, чтобы сохранить его здесь.</p>
          </div>
          <div>
            <h2 class="mono-cap mb-1">Артисты</h2>
            <ul v-if="favArtists.length">
              <li v-for="a in favArtists" :key="a.slug" class="hair-row flex items-center gap-3">
                <NuxtLink :to="`/artists/${a.slug}`" class="group flex min-w-0 flex-1 items-center gap-3">
                  <UiPhoto :src="a.photo" :alt="a.name" class="size-11 shrink-0 rounded-full" />
                  <p class="truncate font-medium group-hover:text-sand">{{ a.name }}</p>
                </NuxtLink>
                <FavoriteButton kind="artists" :id="a.slug" class="size-10" />
              </li>
            </ul>
            <p v-else class="py-3 text-sm text-white/60">Добавьте артиста в избранное на его странице, чтобы сохранить его здесь.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
