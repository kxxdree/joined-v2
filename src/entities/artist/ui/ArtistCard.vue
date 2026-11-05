<script setup lang="ts">
import { UiPhoto } from '@shared/ui'
import type { Artist } from '../model/types'

defineProps<{ artist: Artist; cityLabel?: string }>()
</script>

<template>
  <!-- Плитка сетки, как фото в галерее заведения: вертикальное фото, поверх имя и город -->
  <NuxtLink :to="`/artists/${artist.slug}`" class="group block">
    <UiPhoto :src="artist.photo" :alt="artist.name" class="aspect-3/4">
      <div class="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
      <div class="tile-dim" />
      <div class="absolute inset-x-0 bottom-0 p-2 sm:p-3">
        <h3 class="truncate text-sm font-medium tracking-[-0.02em] sm:text-lg">{{ artist.name }}</h3>
        <p v-if="cityLabel" class="mono-cap mt-0.5 truncate">{{ cityLabel }}</p>
      </div>
    </UiPhoto>
  </NuxtLink>
</template>
