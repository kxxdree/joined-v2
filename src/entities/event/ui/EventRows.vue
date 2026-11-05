<script setup lang="ts">
import { dayNumber, formatPrice, formatWeekdayLong, isWeekend, monthShort, plural } from '@shared/lib'
import { UiPhoto } from '@shared/ui'
import { minPrice } from '../lib/event'
import type { EventItem } from '../model/types'

/** Компактный список событий по дням: дата подписью, строка - миниатюра, название, подпись, время и цена.
 * Клик - событие open (страница открывает афишу в историях); со слотом actions строка не кликается, справа действия */
const props = defineProps<{ groups: [string, EventItem[]][]; subtitle: (e: EventItem) => string; perDay?: number }>()
const emit = defineEmits<{ open: [id: string] }>()

// с модификаторами (новая вкладка и т.п.) ссылка работает как обычно
const onClick = (e: MouseEvent, id: string) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  emit('open', id)
}

// длинный день свёрнут до первых событий
const expanded = ref(new Set<string>())
const expand = (date: string) => (expanded.value = new Set(expanded.value).add(date))
const shown = (date: string, items: EventItem[]) => (props.perDay && !expanded.value.has(date) ? items.slice(0, props.perDay) : items)
</script>

<template>
  <div class="grid gap-7">
    <section v-for="[date, items] in groups" :key="date">
      <h2 class="mono-cap" :class="{ 'text-accent-text': isWeekend(date) }">{{ formatWeekdayLong(date) }}, {{ dayNumber(date) }} {{ monthShort(date) }}</h2>
      <ul class="mt-1">
        <li v-for="e in shown(date, items)" :key="e.id" class="border-b border-white/10 last:border-b-0">
          <!-- с действиями - просто строка -->
          <div v-if="$slots.actions" class="flex items-center gap-3 py-3">
            <UiPhoto :src="e.posters?.[0] ?? e.photo" :alt="e.title" class="aspect-3/4 w-11 shrink-0 rounded-lg" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ e.title }}</p>
              <p class="mono-cap mt-1 truncate">{{ subtitle(e) }}</p>
            </div>
            <slot name="actions" :event="e" />
          </div>
          <a v-else :href="`/events?event=${e.id}`" class="group flex items-center gap-3 py-3" @click="onClick($event, e.id)">
            <UiPhoto :src="e.posters?.[0] ?? e.photo" :alt="e.title" class="aspect-3/4 w-11 shrink-0 rounded-lg" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium transition-colors group-hover:text-sand">{{ e.title }}</p>
              <p class="mono-cap mt-1 truncate">{{ subtitle(e) }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-sm font-medium tabular-nums">{{ e.time }}</p>
              <p class="mt-0.5 text-xs text-white/60 tabular-nums">от {{ formatPrice(minPrice(e)) }}</p>
            </div>
          </a>
        </li>
      </ul>
      <button v-if="perDay && !expanded.has(date) && items.length > perDay" type="button" class="mono-cap mt-3 transition-colors hover:text-white" @click="expand(date)">
        Ещё {{ items.length - perDay }} {{ plural(items.length - perDay, ['событие', 'события', 'событий']) }}
      </button>
    </section>
  </div>
</template>
