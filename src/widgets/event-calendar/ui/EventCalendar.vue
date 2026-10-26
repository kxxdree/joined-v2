<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, type EventItem, minPrice } from '@entities/event'
import { addDays, dayNumber, formatPrice, formatWeekdayLong, isWeekend, monthShort, todayISO } from '@shared/lib'
import { UiEmpty, UiPills } from '@shared/ui'

/** Музыкальный календарь заведения в стиле афиши: крупная дата слева, выступления дня справа */
const props = defineProps<{ events: EventItem[]; title?: string }>()

const periods = [
  { id: 'week', name: 'Неделя' },
  { id: 'month', name: 'Месяц' },
] as const
const period = ref<typeof periods[number]['id'] | ''>('')

const grouped = computed(() => {
  const today = todayISO()
  const until = period.value === 'week' ? addDays(today, 7) : period.value === 'month' ? addDays(today, 31) : ''
  const map = new Map<string, EventItem[]>()
  for (const e of [...props.events].sort(byDateTime)) {
    if (until && e.date > until) continue
    map.set(e.date, [...(map.get(e.date) ?? []), e])
  }
  return [...map.entries()]
})

const artistNames = (e: EventItem) =>
  e.artists.map(a => getArtist(a)?.name).filter(Boolean).join(', ') || 'Резиденты заведения'
</script>

<template>
  <div>
    <UiPills v-model="period" :options="periods" all-label="Все даты" class="mb-4" />

    <div v-if="grouped.length" class="card p-5 sm:p-10">
      <div class="mb-6 flex items-start justify-between gap-4 text-xs tracking-widest uppercase sm:mb-8">
        <span class="text-soft">Афиша<br />{{ title }}</span>
        <!-- <span class="text-sm tracking-normal normal-case">Joined™</span> -->
      </div>

      <div v-for="[date, items] in grouped" :key="date" class="grid gap-4 border-t border-line py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-8">
        <h3 class="h-display text-[16vw] leading-[0.85] uppercase sm:text-8xl lg:text-9xl" :class="isWeekend(date) ? 'text-sand' : ''">
          {{ monthShort(date) }} {{ dayNumber(date) }}
        </h3>

        <div class="space-y-4 md:pt-2">
          <p class="text-xs tracking-widest uppercase" :class="isWeekend(date) ? 'text-accent-text' : 'text-muted'">{{ formatWeekdayLong(date) }}</p>
          <NuxtLink v-for="e in items" :key="e.id" :to="`/events/${e.id}`" class="group flex items-baseline justify-between gap-4">
            <div class="min-w-0">
              <p class="font-medium uppercase transition-colors group-hover:text-sand">{{ e.title }}</p>
              <p class="mt-0.5 text-xs tracking-wider text-muted uppercase">{{ artistNames(e) }} · {{ e.time }}</p>
            </div>
            <span class="shrink-0 text-sm tabular-nums">от {{ formatPrice(minPrice(e)) }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
    <UiEmpty v-else icon="calendar" title="Выступлений пока нет" text="В эти даты бар работает в обычном режиме" />
  </div>
</template>
