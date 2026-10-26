<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { cityName } from '@entities/city'
import { getEvent } from '@entities/event'
import { getVenue } from '@entities/venue'
import { genreName } from '@shared/config'
import { formatDay, formatWeekdayLong } from '@shared/lib'
import { UiIcon, UiModal, UiPhoto } from '@shared/ui'

const route = useRoute()
const found = getEvent(String(route.params.id))
if (!found) throw createError({ statusCode: 404, message: 'Событие не найдено', fatal: true })
const ev = found
const venue = getVenue(ev.venue)!
const lineup = ev.artists.map(getArtist).filter(a => !!a)
const posters = ev.posters ?? []

// Афиши вместо обложки-фото: текущая афиша листается стрелками прямо в обложке
const slide = ref(0)

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

    <!-- одна колонка по центру: блок покупки билетов убран -->
    <div class="mx-auto grid max-w-4xl gap-4">
      <div class="grid gap-4">
        <!-- Обложка: есть афиши лайнапа - показываем их целиком (текст уже на них) на размытой подложке из той же афиши;
             нет - постер-фото с названием по центру, как у заведения. Описание - под обложкой -->
        <article class="rim relative overflow-hidden rounded-4xl bg-black">
          <div v-if="posters.length" class="relative grid place-items-center overflow-hidden p-4 sm:p-8">
            <img :src="posters[slide]" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl">
            <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black" />
            <button type="button" class="relative" :aria-label="`Открыть афишу ${slide + 1}`" @click="current = slide">
              <img :src="posters[slide]" :alt="`Афиша ${slide + 1}: ${ev.title}`" class="max-h-[75vh] w-auto rounded-3xl object-contain shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)]">
            </button>
            <template v-if="posters.length > 1">
              <span class="glass-chip absolute top-4 right-4 rounded-lg px-2 py-1 text-xs font-semibold tracking-wider tabular-nums sm:top-6 sm:right-6">{{ slide + 1 }} / {{ posters.length }}</span>
              <button type="button" class="btn-icon absolute top-1/2 left-4 size-10 -translate-y-1/2 bg-black/50 sm:left-6" :disabled="!slide" aria-label="Предыдущая афиша" @click="slide--"><UiIcon name="chevron-left" :size="20" /></button>
              <button type="button" class="btn-icon absolute top-1/2 right-4 size-10 -translate-y-1/2 bg-black/50 sm:right-6" :disabled="slide === posters.length - 1" aria-label="Следующая афиша" @click="slide++"><UiIcon name="chevron-right" :size="20" /></button>
            </template>
          </div>
          <div v-else class="relative aspect-4/5 sm:aspect-video">
            <UiPhoto :src="ev.photo" :alt="ev.title" class="absolute inset-0 h-full w-full" />
            <div class="pointer-events-none absolute inset-0 bg-black/30" />
            <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black" />

            <div class="absolute inset-0 grid place-items-center px-4">
              <h1 class="h-display text-center text-[11vw] font-bold text-balance lowercase sm:text-6xl xl:text-7xl">{{ ev.title }}</h1>
            </div>
          </div>

          <!-- Описание под фото, на чёрном - чтобы не сливалось с изображением -->
          <div class="p-6 sm:px-10 sm:pb-10">
            <h1 v-if="posters.length" class="h-display mb-4 text-3xl font-bold text-balance lowercase sm:text-5xl">{{ ev.title }}</h1>
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

        <!-- Лайнап полосами, как недельный календарь на клубных афишах: слева акцентная плашка с именем,
             справа тонированное фото артиста с жанрами. Афиши события - в обложке выше -->
        <div v-if="lineup.length" class="card p-6 sm:p-8">
          <h2 class="h-display mb-6 text-4xl uppercase sm:text-5xl">Лайнап</h2>
          <div class="grid gap-3">
            <NuxtLink
              v-for="(a, i) in lineup"
              :key="a!.slug"
              :to="`/artists/${a!.slug}`"
              class="group grid min-h-32 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] overflow-hidden bg-black sm:min-h-40"
            >
              <div class="flex flex-col justify-between gap-4 bg-accent p-4 transition-colors group-hover:bg-accent-hover sm:p-5">
                <p class="text-xs leading-tight font-semibold tracking-wider uppercase">
                  Сет {{ String(i + 1).padStart(2, '0') }}<br>
                  <span class="text-white/75">{{ cityName(a!.city) }}</span>
                </p>
                <div class="min-w-0">
                  <p class="text-[10px] font-semibold tracking-widest text-white/75 uppercase">feat.</p>
                  <p class="font-display text-lg leading-[0.95] font-bold wrap-break-word uppercase sm:text-2xl">{{ a!.name }}</p>
                </div>
              </div>
              <!-- фото в тёплом сепийном тоне, справа затемнение под текст -->
              <div class="relative">
                <UiPhoto :src="a!.photo" :alt="a!.name" class="absolute inset-0 h-full w-full grayscale transition-transform duration-700 ease-liquid group-hover:scale-[1.03]" />
                <div class="pointer-events-none absolute inset-0 bg-[#c98a5a] mix-blend-multiply" />
                <div class="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-transparent to-black/65" />
                <p class="absolute inset-y-0 right-0 flex w-3/5 items-center justify-end p-4 text-right font-display text-base leading-[0.95] font-bold text-[#fff1e0] uppercase sm:p-5 sm:text-2xl">
                  {{ a!.genres.map(genreName).join(' · ') }}
                </p>
              </div>
            </NuxtLink>
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
    </div>
  </section>
</template>
