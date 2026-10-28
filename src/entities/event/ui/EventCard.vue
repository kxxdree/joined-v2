<script setup lang="ts">
import { genreName } from '@shared/config'
import { dayNumber, formatWeekday, monthShort } from '@shared/lib'
import { UiPhoto } from '@shared/ui'
import type { EventItem } from '../model/types'

defineProps<{ event: EventItem; venueName?: string }>()
</script>

<template>
  <!-- Карточка-постер: фото с крупным заголовком + плашка с датой -->
  <NuxtLink :to="`/events?event=${event.id}`" class="card group flex flex-col overflow-hidden rounded-none">
    <UiPhoto :src="event.photo" :alt="event.title" class="aspect-5/4">
      <div class="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />
      <h3 class="absolute inset-x-0 bottom-0 line-clamp-3 transition-colors group-hover:text-sand p-5 font-display text-2xl leading-[0.95] font-semibold tracking-[-0.02em] wrap-break-word hyphens-auto uppercase sm:text-[1.65rem]" lang="ru">
        {{ event.title }}
      </h3>
    </UiPhoto>

    <div class="flex flex-1 flex-col justify-end p-5">
      <div class="flex items-end justify-between gap-4">
        <div class="grid min-w-0 gap-0.5 text-[11px] leading-tight font-semibold tracking-wider uppercase">
          <span class="text-soft">{{ formatWeekday(event.date) }}, {{ event.time }}</span>
          <span v-if="venueName" class="truncate text-muted">{{ venueName }}</span>
          <span class="mt-2 flex flex-wrap gap-x-2">
            <span v-for="g in event.genres" :key="g">{{ genreName(g) }}</span>
          </span>
        </div>
        <div class="shrink-0 text-right font-display leading-[0.9] font-semibold uppercase">
          <div class="text-5xl">{{ dayNumber(event.date) }}</div>
          <div class="text-xl">{{ monthShort(event.date) }}</div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
