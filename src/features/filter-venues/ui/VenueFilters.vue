<script setup lang="ts">
import { drinks, formats } from '@entities/venue'
import { UiPills } from '@shared/ui'
import type { VenueFilterState } from '../model/filters'

const model = defineModel<VenueFilterState>({ required: true })

</script>

<template>
  <!-- Нумерованные разделы в стиле афиши -->
  <div class="grid gap-6">
    <div class="grid gap-3 md:grid-cols-[12rem_1fr] md:gap-6">
      <span class="text-xs tracking-widest text-muted uppercase"><span class="text-white tabular-nums">01</span> · Формат</span>
      <UiPills v-model="model.formats" :options="formats" multiple :all-label="false" variant="text" />
    </div>
    <div class="grid gap-3 border-t border-line pt-6 md:grid-cols-[12rem_1fr] md:gap-6">
      <span class="text-xs tracking-widest text-muted uppercase"><span class="text-white tabular-nums">02</span> · Бар и кухня</span>
      <UiPills v-model="model.drinks" :options="drinks" multiple :all-label="false" variant="text" />
    </div>
  </div>
</template>
