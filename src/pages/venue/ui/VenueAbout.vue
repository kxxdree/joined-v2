<script setup lang="ts">
import { drinkName, type Venue } from '@entities/venue'
import { genreName } from '@shared/config'
import { weekdayIndex } from '@shared/lib'
import { UiIcon, UiYandexMap } from '@shared/ui'

defineProps<{ venue: Venue }>()
const todayIdx = weekdayIndex()
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
    <div class="grid gap-4">
      <div class="card p-6 sm:p-8">
        <h2 class="mb-4 text-2xl font-medium">О заведении</h2>
        <p class="leading-relaxed text-soft">{{ venue.description }}</p>
        <h3 class="mt-8 mb-3 text-sm text-muted">Музыка</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="g in venue.genres" :key="g" class="pill pointer-events-none">{{ genreName(g) }}</span>
        </div>
        <h3 class="mt-8 mb-3 text-sm text-muted">Бар и кухня</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="d in venue.drinks" :key="d" class="pill pointer-events-none">{{ drinkName(d) }}</span>
        </div>
      </div>
      <div class="card overflow-hidden p-1.5">
        <div class="h-72 overflow-hidden rounded-[1.4rem]">
          <UiYandexMap :lat="venue.lat" :lng="venue.lng" :title="venue.name" />
        </div>
        <div class="p-5">
          <h3 class="mb-2 flex items-center gap-2 font-medium"><UiIcon name="pin" class="text-accent-text" :size="18" /> Как добраться</h3>
          <p class="text-sm text-soft">{{ venue.address }}</p>
          <p class="mt-2 text-sm text-muted">{{ venue.directions }}</p>
        </div>
      </div>
    </div>
    <div class="grid h-fit gap-4">
      <!-- График работы в стиле афиши: крупный день слева, часы справа -->
      <div class="card p-6">
        <div class="mb-5 flex items-start justify-between gap-4 text-xs tracking-widest uppercase">
          <span class="text-soft">График<br />работы</span>
          <span class="text-right text-sm tracking-normal normal-case">{{ venue.name }}</span>
        </div>
        <dl>
          <div v-for="(h, i) in venue.hours" :key="h.day" class="flex items-center justify-between gap-4 border-t border-line py-2.5">
            <dt class="h-display text-4xl leading-[0.85] uppercase" :class="i === todayIdx ? 'text-sand' : ''">{{ h.day }}</dt>
            <dd class="text-right">
              <span v-if="i === todayIdx" class="block text-xs tracking-widest text-accent-text uppercase">сегодня</span>
              <span class="text-sm tracking-wider uppercase tabular-nums" :class="i === todayIdx ? '' : 'text-soft'">{{ h.time }}</span>
            </dd>
          </div>
        </dl>
      </div>
      <div class="card p-6">
        <h3 class="mb-4 font-medium">Контакты</h3>
        <ul class="space-y-3 text-sm">
          <li><a :href="`tel:${venue.phone.replace(/[^\d+]/g, '')}`" class="flex items-center gap-3 hover:text-sand"><span class="btn-icon size-9"><UiIcon name="phone" :size="16" /></span>{{ venue.phone }}</a></li>
          <li><a href="#" class="flex items-center gap-3 hover:text-sand"><span class="btn-icon size-9"><UiIcon name="instagram" :size="16" /></span>{{ venue.instagram }}</a></li>
          <li><a href="#" class="flex items-center gap-3 hover:text-sand"><span class="btn-icon size-9"><UiIcon name="telegram" :size="16" /></span>{{ venue.telegram }}</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
