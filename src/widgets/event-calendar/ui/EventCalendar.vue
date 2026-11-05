<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, type EventItem, EventRows } from '@entities/event'
import { addDays, todayISO } from '@shared/lib'
import { UiEmpty, UiPills } from '@shared/ui'

/** Музыкальный календарь заведения: компактный список выступлений по дням.
 * Клик по выступлению - событие open (страница открывает афишу в историях) */
const props = defineProps<{ events: EventItem[] }>()
const emit = defineEmits<{ open: [id: string] }>()

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
  <div class="max-w-3xl">
    <UiPills v-model="period" :options="periods" all-label="Все даты" variant="text" class="mb-5" />
    <EventRows v-if="grouped.length" :groups="grouped" :subtitle="artistNames" @open="emit('open', $event)" />
    <UiEmpty v-else icon="calendar" title="Выступлений пока нет" text="В эти даты бар работает в обычном режиме" />
  </div>
</template>
