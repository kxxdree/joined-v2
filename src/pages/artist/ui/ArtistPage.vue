<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { cityName } from '@entities/city'
import { byDateTime, events, isUpcoming } from '@entities/event'
import { getVenue } from '@entities/venue'
import { FavoriteButton } from '@features/favorites'
import { genreName } from '@shared/config'
import { formatDay, formatWeekday } from '@shared/lib'
import { UiCarousel, UiEmpty, UiIcon, UiPhoto, UiPhotoViewer } from '@shared/ui'

const route = useRoute()
const found = getArtist(String(route.params.slug))
if (!found) throw createError({ statusCode: 404, message: 'Артист не найден', fatal: true })
const a = found

useHead({ title: `${a.name} - Joined`, meta: [{ name: 'description', content: a.short }] })

const concerts = events.filter(e => e.artists.includes(a.slug) && isUpcoming(e)).sort(byDateTime)

const gallery = a.gallery?.length ? a.gallery : [a.photo]
const viewer = ref<number | null>(null)
</script>

<template>
  <div>
    <!-- Первый экран: фото на всю ширину заезжает под шапку, внизу крупное имя; справа город и жанры -->
    <section class="relative isolate -mt-19 flex min-h-[32rem] flex-col justify-between overflow-hidden pt-19 sm:-mt-20 sm:h-[85svh] sm:pt-20">
      <!-- фото растворяется маской, а не уходит в чёрный: снизу просвечивает общий фон сайта, поэтому стыка нет -->
      <div class="absolute inset-0 -z-10 mask-[linear-gradient(to_bottom,black_45%,transparent)]" aria-hidden="true">
        <img :src="a.photo" alt="" fetchpriority="high" decoding="async" class="size-full object-cover object-[50%_30%]">
        <div class="absolute inset-0 bg-ink/30" />
      </div>

      <div class="container-x mt-2 flex items-center justify-between">
        <NuxtLink to="/artists" class="btn-icon size-10" aria-label="Все артисты"><UiIcon name="chevron-left" :size="20" /></NuxtLink>
        <FavoriteButton kind="artists" :id="a.slug" class="size-10" />
      </div>

      <div class="container-x mt-auto grid items-end gap-5 pb-6 sm:pb-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <h1 class="min-w-0 text-[clamp(3rem,11vw,8.5rem)] leading-[0.95] font-medium tracking-[-0.05em] wrap-break-word">{{ a.name }}</h1>
        <div class="lg:pb-3">
          <p class="mono-cap">{{ cityName(a.city) }} · {{ a.genres.map(genreName).join(', ') }}</p>
        </div>
      </div>
    </section>

    <!-- Об артисте: описание и соцсети иконками; -ml-2 выравнивает значок, а не его область нажатия, по краю текста -->
    <section class="container-x mt-14 sm:mt-24">
      <h2 class="text-4xl font-medium tracking-[-0.03em] sm:text-6xl">Об артисте</h2>
      <p class="mt-6 max-w-3xl text-base leading-relaxed text-soft sm:mt-10 sm:text-lg">{{ a.bio }}</p>
      <div v-if="a.socials?.instagram || a.socials?.telegram" class="mt-3 -ml-2 flex">
        <a v-if="a.socials?.instagram" :href="a.socials.instagram" target="_blank" rel="noopener" class="grid size-10 place-items-center text-white/70 hover:text-white" aria-label="Instagram"><UiIcon name="instagram" :size="22" /></a>
        <a v-if="a.socials?.telegram" :href="a.socials.telegram" target="_blank" rel="noopener" class="grid size-10 place-items-center text-white/70 hover:text-white" aria-label="Telegram"><UiIcon name="telegram" :size="22" /></a>
      </div>
    </section>

    <!-- Галерея: лента со стрелками, по нажатию фото открывается целиком -->
    <section class="mt-14 sm:mt-24">
      <div class="container-x">
        <h2 class="text-4xl font-medium tracking-[-0.03em] sm:text-6xl">Галерея</h2>
        <UiCarousel class="mt-6 sm:mt-10">
          <button
            v-for="(src, i) in gallery"
            :key="src"
            type="button"
            class="group block w-[calc((100%-0.5rem)/2)] shrink-0 snap-start sm:w-[calc((100%-1rem)/3)] lg:w-[calc((100%-2rem)/5)]"
            :aria-label="`Открыть фото ${i + 1}`"
            @click="viewer = i"
          >
            <UiPhoto :src="src" :alt="`${a.name}, фото ${i + 1}`" class="aspect-3/4"><div class="tile-dim" /></UiPhoto>
          </button>
        </UiCarousel>
      </div>
      <UiPhotoViewer v-model="viewer" :photos="gallery" />
    </section>

    <!-- Концерты: простой список -->
    <section class="container-x mt-14 sm:mt-24">
      <h2 class="text-4xl font-medium tracking-[-0.03em] sm:text-6xl">Ближайшие концерты</h2>
      <ul v-if="concerts.length" class="mt-6 sm:mt-10">
        <li v-for="e in concerts" :key="e.id" class="hair-row py-4 first:pt-0">
          <h3 class="text-xl font-medium tracking-[-0.02em] sm:text-2xl">{{ e.title }}</h3>
          <p class="mono-cap mt-2">
            {{ formatWeekday(e.date) }}, {{ formatDay(e.date) }} · {{ e.time }}<template v-if="getVenue(e.venue)"> ·
              <NuxtLink :to="`/venues/${e.venue}`" class="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white">{{ getVenue(e.venue)!.name }}</NuxtLink>, {{ cityName(getVenue(e.venue)!.city) }}</template>
          </p>
        </li>
      </ul>
      <UiEmpty v-else icon="calendar" title="Концертов пока нет" text="Новые даты появятся здесь, как только артист их объявит." />
    </section>
  </div>
</template>
