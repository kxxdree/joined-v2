<script setup lang="ts">
import { useCurrentCity } from "@entities/city";
import { events } from "@entities/event";
import { VenueCard, venues } from "@entities/venue";
import { applyVenueFilters, countExtra, emptyFilters, VenueFilters, type VenueFilterState } from "@features/filter-venues";
import { CitySelect } from "@features/select-city";
import { type GenreId, genres } from "@shared/config";
import { plural } from "@shared/lib";
import { UiEmpty, UiIcon, UiModal, UiPageHead, UiPills } from "@shared/ui";

useHead({ title: "Бары и площадки - Joined" });

const route = useRoute();
const { cityId, city } = useCurrentCity();

const filters = ref<VenueFilterState>({
  ...emptyFilters(),
  q: String(route.query.q ?? ""),
  genres: route.query.genre ? [route.query.genre as GenreId] : [],
});
const results = computed(() =>
  applyVenueFilters(
    venues.filter((v) => v.city === cityId.value),
    events,
    filters.value,
  ),
);
const extraCount = computed(() => countExtra(filters.value));

const filtersOpen = ref(false);

// сброс сразу закрывает фильтры
const reset = () => {
  filters.value = emptyFilters();
  filtersOpen.value = false;
};
</script>

<template>
  <div>
    <section class="container-x">
      <UiPageHead title="Бары и сцены" :caption="`${results.length} ${plural(results.length, ['место', 'места', 'мест'])} ${city.where}`" />

      <!-- Поиск одной плашкой: поле и кнопки внутри; на телефоне кнопки строкой под полем -->
      <div class="search-bar mt-4 flex flex-col gap-1 p-2 sm:flex-row">
        <label class="flex min-w-0 flex-1 items-center gap-3 px-3">
          <UiIcon name="search" class="shrink-0 text-white/60" :size="18" />
          <input v-model="filters.q" type="search" placeholder="Название, улица или метро" class="w-full bg-transparent py-2.5 text-sm placeholder:text-white/50" aria-label="Поиск по заведениям" />
        </label>
        <div class="flex gap-1">
          <!-- под окном яркие фото: тонировка плотнее, чем на главной -->
          <CitySelect modal clear panel-class="[--lg-tint:rgb(22_19_22/0.28)]" class="min-w-0 flex-1 [&>button]:h-full [&>button]:w-full" />
          <button type="button" class="pill" aria-haspopup="dialog" @click="filtersOpen = true">
            <UiIcon name="filter" :size="16" /> Фильтры
            <span v-if="extraCount" class="grid size-5 place-items-center rounded-md bg-accent text-[11px] text-white">{{ extraCount }}</span>
          </button>
        </div>
      </div>
      <div class="mt-3"><UiPills v-model="filters.genres" :options="genres" multiple /></div>
    </section>

    <!-- Сетка как у артистов: три колонки, на больших экранах пять; на телефоне от края до края -->
    <section class="mx-auto w-full max-w-7xl pt-3 sm:px-6 lg:px-12">
      <div v-if="results.length" class="grid grid-cols-3 gap-0.5 lg:grid-cols-5">
        <VenueCard v-for="v in results" :key="v.slug" :venue="v" />
      </div>
      <UiEmpty v-else icon="glass" title="Ничего не нашлось">
        <button type="button" class="btn-dark" @click="reset">Сбросить фильтры</button>
      </UiEmpty>
    </section>

    <UiModal v-model="filtersOpen" title="Фильтры" glass>
      <VenueFilters v-model="filters" />
      <div class="mt-8 grid grid-cols-2 gap-2">
        <button type="button" class="btn-dark h-12" @click="reset">Сбросить</button>
        <button type="button" class="btn-primary h-12" @click="filtersOpen = false">Показать {{ results.length }}</button>
      </div>
    </UiModal>
  </div>
</template>
