<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { cityName } from '@entities/city'
import { getEvent } from '@entities/event'
import { getVenue } from '@entities/venue'
import { TicketPurchase } from '@features/buy-ticket'
import { genreName } from '@shared/config'
import { formatDay, formatWeekdayLong } from '@shared/lib'
import { UiCarousel, UiIcon, UiModal, UiPhoto } from '@shared/ui'

const route = useRoute()
const found = getEvent(String(route.params.id))
if (!found) throw createError({ statusCode: 404, message: 'Событие не найдено', fatal: true })
const ev = found
const venue = getVenue(ev.venue)!
const lineup = ev.artists.map(getArtist).filter(a => !!a)
const posters = ev.posters ?? []

// Просмотр афиши крупно, с листанием - как в галерее заведения
const current = ref<number | null>(null)
const open = computed({ get: () => current.value !== null, set: (v) => { if (!v) current.value = null } })
const step = (d: number) => {
  if (current.value !== null) current.value = Math.min(Math.max(current.value + d, 0), posters.length - 1)
}

useHead({ title: `${ev.title} - Joined`, meta: [{ name: 'description', content: ev.description }] })
</script>

<template>
  <section class="container-x pt-6">
    <NuxtLink to="/events" class="btn-ghost mb-5 pl-3"><UiIcon name="chevron-left" :size="16" /> Афиша</NuxtLink>

    <div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div class="grid gap-4">
        <!-- Обложка: постер с названием по центру, как у заведения; описание - под фото -->
        <article class="rim relative overflow-hidden rounded-4xl bg-black">
          <div class="relative aspect-4/5 sm:aspect-video">
            <UiPhoto :src="ev.photo" :alt="ev.title" class="absolute inset-0 h-full w-full" />
            <div class="pointer-events-none absolute inset-0 bg-black/30" />
            <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black" />

            <div class="absolute inset-0 grid place-items-center px-4">
              <h1 class="h-display text-center text-[11vw] font-bold text-balance lowercase sm:text-6xl xl:text-7xl">{{ ev.title }}</h1>
            </div>
          </div>

          <!-- Описание под фото, на чёрном - чтобы не сливалось с изображением -->
          <div class="p-6 sm:px-10 sm:pb-10">
            <p class="max-w-2xl text-white/85 sm:text-lg">{{ ev.description }}</p>
            <p class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold tracking-wider uppercase">
              <span class="text-accent-text">{{ formatDay(ev.date) }} · {{ ev.time }}</span>
              <span v-for="g in ev.genres" :key="g">{{ genreName(g) }}</span>
            </p>
          </div>
        </article>

        <div class="card grid grid-cols-1 gap-5 p-6 sm:grid-cols-3">
          <div class="flex items-start gap-3">
            <UiIcon name="calendar" :size="20" class="mt-0.5 shrink-0 text-accent-text" />
            <div>
              <p class="font-medium">{{ formatDay(ev.date) }}</p>
              <p class="text-sm text-muted capitalize">{{ formatWeekdayLong(ev.date) }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <UiIcon name="clock" :size="20" class="mt-0.5 shrink-0 text-accent-text" />
            <div>
              <p class="font-medium">Начало в {{ ev.time }}</p>
              <p class="text-sm text-muted">открытие дверей за час</p>
            </div>
          </div>
          <NuxtLink :to="`/venues/${venue.slug}`" class="group flex items-start gap-3">
            <UiIcon name="pin" :size="20" class="mt-0.5 shrink-0 text-accent-text" />
            <div>
              <p class="font-medium group-hover:text-sand">{{ venue.name }}</p>
              <p class="text-sm text-muted">{{ venue.address }}</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Лайнап списком, как события на странице «Афиша»; ниже - афиши события галереей -->
        <div v-if="lineup.length || posters.length" class="card p-6 sm:p-8">
          <h2 class="mb-5 text-2xl font-medium">Лайнап</h2>
          <NuxtLink v-for="a in lineup" :key="a!.slug" :to="`/artists/${a!.slug}`" class="group flex items-center gap-4 border-t border-line py-4 last:pb-0">
            <UiPhoto :src="a!.photo" :alt="a!.name" class="size-14 shrink-0 rounded-lg" />
            <div class="min-w-0 flex-1">
              <p class="font-medium uppercase transition-colors group-hover:text-sand">{{ a!.name }}</p>
              <p class="mt-0.5 text-xs tracking-wider text-muted uppercase">{{ cityName(a!.city) }} · {{ a!.genres.map(genreName).join(', ') }}</p>
            </div>
          </NuxtLink>

          <!-- Афиши: вертикальные картинки, как истории; не влезают - листаются стрелками -->
          <div v-if="posters.length" :class="lineup.length ? 'mt-6 border-t border-line pt-6' : ''">
            <p class="mb-4 text-xs tracking-widest text-muted uppercase">Афиши</p>
            <UiCarousel>
              <button
                v-for="(src, i) in posters"
                :key="src"
                type="button"
                class="group w-[calc((100%-1rem)/3)] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-44"
                :aria-label="`Открыть афишу ${i + 1}`"
                @click="current = i"
              >
                <UiPhoto :src="src" :alt="`Афиша ${i + 1}: ${ev.title}`" class="aspect-9/16 transition-transform duration-700 ease-liquid group-hover:scale-[1.03]" />
              </button>
            </UiCarousel>
          </div>
        </div>

        <UiModal v-model="open" :title="`Афиша · ${(current ?? 0) + 1} / ${posters.length}`">
          <!-- целиком, без обрезки: текст на афише бывает у самых краёв -->
          <img v-if="current !== null" :src="posters[current]" :alt="`Афиша ${current + 1}: ${ev.title}`" class="mx-auto max-h-[70vh] w-auto rounded-3xl object-contain">
          <div class="mt-4 flex justify-between">
            <button class="btn-icon" :disabled="!current" aria-label="Предыдущая афиша" @click="step(-1)"><UiIcon name="chevron-left" :size="20" /></button>
            <button class="btn-icon" :disabled="current === posters.length - 1" aria-label="Следующая афиша" @click="step(1)"><UiIcon name="chevron-right" :size="20" /></button>
          </div>
        </UiModal>
      </div>

      <aside class="lg:sticky lg:top-28 lg:h-fit">
        <TicketPurchase :event="ev" :venue-name="venue.name" />
      </aside>
    </div>
  </section>
</template>
