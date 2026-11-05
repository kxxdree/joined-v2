<script setup lang="ts">
import { drinks, formats } from '@entities/venue'
import { UiPills, UiSelect } from '@shared/ui'
import type { VenueFilterState } from '../model/filters'

const model = defineModel<VenueFilterState>({ required: true })

const times = [
  { id: 'evening' as const, name: 'Вечер, до 22:00' },
  { id: 'night' as const, name: 'Ночь, после 22:00' },
]
const sorts = [
  { id: 'popular' as const, name: 'Сначала популярные' },
  { id: 'name' as const, name: 'По алфавиту' },
]
</script>

<template>
  <!-- Разделы: подпись над вариантами - компонент живёт в модалке -->
  <div class="grid gap-5">
    <div class="grid gap-3">
      <span class="mono-cap">Формат</span>
      <UiPills v-model="model.formats" :options="formats" multiple :all-label="false" variant="text" />
    </div>
    <div class="grid gap-3 border-t border-white/10 pt-5">
      <span class="mono-cap">Бар и кухня</span>
      <UiPills v-model="model.drinks" :options="drinks" multiple :all-label="false" variant="text" />
    </div>
    <div class="grid gap-3 border-t border-white/10 pt-5">
      <span class="mono-cap">Когда</span>
      <!-- дата - на всю ширину, время и сортировка - в две колонки под ней -->
      <div class="grid grid-cols-2 gap-3">
        <label class="col-span-2">
          <span class="label">Дата выступления</span>
          <input v-model="model.date" type="date" class="field py-2.5">
        </label>
        <div>
          <span class="label">Время</span>
          <UiSelect v-model="model.time" :options="times" all-label="Любое" label="Время" />
        </div>
        <div>
          <span class="label">Сортировка</span>
          <UiSelect v-model="model.sort" :options="sorts" :all-label="false" label="Сортировка" />
        </div>
      </div>
    </div>
  </div>
</template>
