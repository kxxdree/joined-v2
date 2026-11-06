<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, type EventItem } from '@entities/event'
import { formatDay, formatWeekday } from '@shared/lib'
import { UiEmpty } from '@shared/ui'

/** Афиша заведения: простой список, как «Ближайшие концерты» у артиста. Длинная афиша подгружается порциями */
const props = defineProps<{ events: EventItem[] }>()

const STEP = 15
const shown = ref(STEP)
const sorted = computed(() => [...props.events].sort(byDateTime))
const visible = computed(() => sorted.value.slice(0, shown.value))

const lineup = (e: EventItem) => e.artists.map(getArtist).filter(a => !!a)
</script>

<template>
  <div v-if="sorted.length">
    <ul>
      <li v-for="e in visible" :key="e.id" class="hair-row py-4 first:pt-0">
        <h3 class="text-xl font-medium tracking-[-0.02em] sm:text-2xl">{{ e.title }}</h3>
        <p class="mono-cap mt-2">
          {{ formatWeekday(e.date) }}, {{ formatDay(e.date) }} · {{ e.time }}<template v-for="(a, i) in lineup(e)" :key="a.slug">{{ i ? ', ' : ' · ' }}<NuxtLink :to="`/artists/${a.slug}`" class="underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white">{{ a.name }}</NuxtLink></template>
        </p>
      </li>
    </ul>
    <div v-if="shown < sorted.length" class="mt-6 text-center">
      <button type="button" class="btn-dark" @click="shown += STEP">Показать ещё</button>
    </div>
  </div>
  <UiEmpty v-else icon="calendar" title="Выступлений пока нет" text="В эти даты бар работает в обычном режиме" />
</template>
