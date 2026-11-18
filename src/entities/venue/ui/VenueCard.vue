<script setup lang="ts">
import { genreName } from '@shared/config'
import { UiPhoto } from '@shared/ui'
import { formatName } from '../model/dictionaries'
import type { Venue } from '../model/types'

/** Слот actions - для кнопок фич (например, «в избранное») поверх фото */
withDefaults(defineProps<{ venue: Venue; variant?: 'poster' | 'guide' }>(), { variant: 'poster' })
</script>

<template>
  <article v-if="variant === 'guide'" class="venue-guide group min-w-0">
    <div class="relative">
      <NuxtLink :to="`/venues/${venue.slug}`" class="block overflow-hidden rounded-lg" :aria-label="venue.name">
        <UiPhoto :src="venue.photo" :alt="venue.name" class="aspect-16/10" />
      </NuxtLink>
      <div class="absolute top-3 right-3 sm:top-4 sm:right-4"><slot name="actions" /></div>
    </div>

    <div class="pt-5 sm:pt-6">
      <p class="mb-2 text-xs font-medium tracking-widest text-muted uppercase">{{ formatName(venue.format) }}</p>
      <h3 class="font-display text-2xl leading-tight font-semibold tracking-[-0.03em] sm:text-3xl lg:text-[2rem]">
        <NuxtLink :to="`/venues/${venue.slug}`" class="transition-colors group-hover:text-sand group-focus-within:text-sand">{{ venue.name }}</NuxtLink>
      </h3>
      <p class="mt-2 text-sm leading-relaxed text-muted sm:text-base">{{ venue.address }}</p>
      <ul v-if="venue.genres.length" class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-soft" aria-label="Музыкальные жанры">
        <li v-for="g in venue.genres.slice(0, 2)" :key="g" class="flex items-center gap-2">
          <span class="size-1 rounded-full bg-accent" aria-hidden="true" />
          {{ genreName(g) }}
        </li>
      </ul>
    </div>
  </article>

  <!-- Компактная карточка-постер для других разделов. -->
  <NuxtLink v-else :to="`/venues/${venue.slug}`" class="card group flex flex-col overflow-hidden rounded-none">
    <UiPhoto :src="venue.photo" :alt="venue.name" class="aspect-5/4">
      <div class="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
      <div class="absolute top-3 right-3"><slot name="actions" /></div>
      <h3 class="absolute inset-x-0 bottom-0 line-clamp-3 transition-colors group-hover:text-sand p-5 font-display text-2xl leading-[0.95] font-semibold tracking-[-0.02em] wrap-break-word hyphens-auto uppercase sm:text-[1.65rem]" lang="ru">
        {{ venue.name }}
      </h3>
    </UiPhoto>

    <div class="flex flex-1 flex-col justify-end p-5">
      <div class="grid min-w-0 gap-0.5 text-[11px] leading-tight font-semibold tracking-wider uppercase">
        <span class="text-soft">{{ formatName(venue.format) }}</span>
        <span class="truncate text-muted">{{ venue.address }}</span>
        <span class="mt-2 flex flex-wrap gap-x-2">
          <span v-for="g in venue.genres.slice(0, 2)" :key="g">{{ genreName(g) }}</span>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

