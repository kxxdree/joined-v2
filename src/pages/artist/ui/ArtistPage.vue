<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { cityName } from '@entities/city'
import { byDateTime, type EventItem, EventRows, events, isUpcoming } from '@entities/event'
import { getVenue } from '@entities/venue'
import { FavoriteButton } from '@features/favorites'
import { genreName } from '@shared/config'
import { UiEmpty, UiIcon, UiPageHead, UiPhoto, UiTabs } from '@shared/ui'
import { EventStories } from '@widgets/event-stories'

const route = useRoute()
const found = getArtist(String(route.params.slug))
if (!found) throw createError({ statusCode: 404, message: 'Артист не найден', fatal: true })
const a = found

useHead({ title: `${a.name} - Joined`, meta: [{ name: 'description', content: a.short }] })

const tabs = [
  { id: 'concerts', name: 'Концерты', icon: 'calendar' },
  { id: 'about', name: 'Об артисте', icon: 'info' },
] as const
const tab = ref<(typeof tabs)[number]['id']>('concerts')

const own = events.filter(e => e.artists.includes(a.slug))
// концерты по датам, как на странице афиши
const grouped = (() => {
  const map = new Map<string, EventItem[]>()
  for (const e of own.filter(isUpcoming).sort(byDateTime)) map.set(e.date, [...(map.get(e.date) ?? []), e])
  return [...map.entries()]
})()
const where = (e: EventItem) => {
  const v = getVenue(e.venue)
  return v ? `${v.name} · ${cityName(v.city)}` : ''
}
const storyId = ref<string | null>(null) // концерт, открытый в историях
</script>

<template>
  <div>
    <div class="container-x">
      <UiPageHead :title="a.name" :photo="a.photo" back="/artists" back-label="Все артисты" :caption="`${cityName(a.city)} · ${a.genres.map(genreName).join(', ')}`">
        <template #actions>
          <a v-if="a.socials?.instagram" :href="a.socials.instagram" target="_blank" rel="noopener" class="btn-icon size-10 max-sm:hidden" aria-label="Instagram"><UiIcon name="instagram" :size="18" /></a>
          <a v-if="a.socials?.telegram" :href="a.socials.telegram" target="_blank" rel="noopener" class="btn-icon size-10 max-sm:hidden" aria-label="Telegram"><UiIcon name="telegram" :size="18" /></a>
          <FavoriteButton kind="artists" :id="a.slug" class="size-10" />
        </template>
      </UiPageHead>
    </div>
    <UiTabs v-model="tab" :tabs="tabs" class="container-x" />

    <section class="container-x pt-3">
      <div v-if="tab === 'concerts'" class="max-w-3xl">
        <EventRows v-if="grouped.length" :groups="grouped" :subtitle="where" @open="storyId = $event" />
        <UiEmpty v-else icon="calendar" title="Концертов пока нет" text="Новые даты появятся здесь, как только артист их объявит." />
      </div>

      <div v-else class="grid gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-10">
        <UiPhoto :src="a.photo" :alt="a.name" class="aspect-3/4 rounded-3xl" />
        <div>
          <p class="text-base leading-relaxed text-soft sm:text-lg">{{ a.bio }}</p>
          <div v-if="a.socials?.instagram || a.socials?.telegram" class="mt-6 flex gap-2 sm:hidden">
            <a v-if="a.socials?.instagram" :href="a.socials.instagram" target="_blank" rel="noopener" class="btn-dark h-11"><UiIcon name="instagram" :size="18" /> Instagram</a>
            <a v-if="a.socials?.telegram" :href="a.socials.telegram" target="_blank" rel="noopener" class="btn-dark h-11"><UiIcon name="telegram" :size="18" /> Telegram</a>
          </div>
        </div>
      </div>
    </section>

    <EventStories v-model="storyId" :events="own" />
  </div>
</template>
