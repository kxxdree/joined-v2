<script setup lang="ts">
import { UiPhoto } from '@shared/ui'
import type { Venue } from '../model/types'

defineProps<{ venue: Venue }>()
</script>

<template>
  <!-- Плитка сетки, как у артистов: вертикальное фото, поверх название и метро -->
  <NuxtLink :to="`/venues/${venue.slug}`" class="group block">
    <UiPhoto :src="venue.photo" :alt="venue.name" class="aspect-3/4">
      <div class="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
      <div class="tile-dim" />
      <div class="absolute inset-x-0 bottom-0 p-2 sm:p-3">
        <h3 class="truncate text-sm font-medium tracking-[-0.02em] sm:text-lg">{{ venue.name }}</h3>
        <p class="mono-cap mt-0.5 truncate">{{ venue.metro ? `м. ${venue.metro}` : venue.address }}</p>
      </div>
    </UiPhoto>
  </NuxtLink>
</template>
