<script setup lang="ts">
import { UiPhoto } from '@shared/ui'
import { formatName } from '../model/dictionaries'
import type { Venue } from '../model/types'

/** Строка списка заведений: фото, название, формат и метро */
defineProps<{ venue: Venue }>()
</script>

<template>
  <NuxtLink :to="`/venues/${venue.slug}`" class="group flex items-center gap-3 py-3 sm:gap-5">
    <UiPhoto :src="venue.photo" :alt="venue.name" class="aspect-3/4 w-16 shrink-0 rounded-lg sm:w-20">
      <div class="tile-dim" />
    </UiPhoto>

    <div class="min-w-0 flex-1">
      <h3 class="truncate text-xl font-medium tracking-[-0.03em] sm:text-3xl">{{ venue.name }}</h3>
      <p class="mono-cap mt-1 truncate">{{ formatName(venue.format) }} · {{ venue.metro ? `м. ${venue.metro}` : venue.address }}</p>
    </div>
  </NuxtLink>
</template>
