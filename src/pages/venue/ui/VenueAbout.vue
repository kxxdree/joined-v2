<script setup lang="ts">
import { drinkName, type Venue } from '@entities/venue'
import { genreName } from '@shared/config'
import { weekdayIndex } from '@shared/lib'
import { UiIcon, UiYandexMap } from '@shared/ui'

defineProps<{ venue: Venue }>()
const todayIdx = weekdayIndex()
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
    <div class="grid h-fit gap-8">
      <p class="text-base leading-relaxed text-soft sm:text-lg">{{ venue.description }}</p>

      <dl class="grid gap-5 sm:grid-cols-2">
        <div>
          <dt class="mono-cap mb-2">Музыка</dt>
          <dd>{{ venue.genres.map(genreName).join(', ') }}</dd>
        </div>
        <div>
          <dt class="mono-cap mb-2">Бар и кухня</dt>
          <dd>{{ venue.drinks.map(drinkName).join(', ') }}</dd>
        </div>
      </dl>

      <div>
        <div class="h-72 overflow-hidden rounded-3xl">
          <UiYandexMap :lat="venue.lat" :lng="venue.lng" :title="venue.name" />
        </div>
        <p class="mt-4 font-medium">{{ venue.address }}</p>
        <p class="mt-1 text-sm text-white/60">{{ venue.directions }}</p>
      </div>
    </div>

    <div class="grid h-fit gap-8">
      <div>
        <h2 class="mono-cap mb-1">График работы</h2>
        <dl>
          <div v-for="(h, i) in venue.hours" :key="h.day" class="hair-row flex items-center justify-between gap-4 py-2.5" :class="{ 'text-sand': i === todayIdx }">
            <dt class="text-sm" :class="i === todayIdx ? 'font-medium' : 'text-white/70'">{{ h.day }}<span v-if="i === todayIdx"> · сегодня</span></dt>
            <dd class="text-sm tabular-nums">{{ h.time }}</dd>
          </div>
        </dl>
      </div>
      <div>
        <h2 class="mono-cap mb-1">Контакты</h2>
        <ul>
          <li class="hair-row py-0"><a :href="`tel:${venue.phone.replace(/[^\d+]/g, '')}`" class="flex items-center gap-3 py-3 text-sm hover:text-sand"><UiIcon name="phone" :size="18" class="text-white/60" />{{ venue.phone }}</a></li>
          <li class="hair-row py-0"><a :href="`https://instagram.com/${venue.instagram.replace('@', '')}`" target="_blank" rel="noopener" class="flex items-center gap-3 py-3 text-sm hover:text-sand"><UiIcon name="instagram" :size="18" class="text-white/60" />{{ venue.instagram }}</a></li>
          <li class="hair-row py-0"><a :href="`https://t.me/${venue.telegram.replace('@', '')}`" target="_blank" rel="noopener" class="flex items-center gap-3 py-3 text-sm hover:text-sand"><UiIcon name="telegram" :size="18" class="text-white/60" />{{ venue.telegram }}</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
