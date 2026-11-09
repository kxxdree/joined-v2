<script setup lang="ts">
import { genreName } from '@shared/config'
import { UiPhoto } from '@shared/ui'
import { formatName } from '../model/dictionaries'
import type { Venue } from '../model/types'

/** Слот actions - для кнопок фич (например, «в избранное») поверх фото */
defineProps<{ venue: Venue }>()
</script>

<template>
  <!-- Карточка-постер, как у событий: фото с крупным названием + плашка с адресом и жанрами -->
  <NuxtLink :to="`/venues/${venue.slug}`" class="card group flex flex-col overflow-hidden rounded-none">
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
