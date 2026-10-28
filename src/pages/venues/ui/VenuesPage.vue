<script setup lang="ts">
import { useCurrentCity } from "@entities/city";
import { events } from "@entities/event";
import { VenueCard, venues } from "@entities/venue";
import { FavoriteButton } from "@features/favorites";
import { applyVenueFilters, countExtra, emptyFilters, VenueFilters, type VenueFilterState } from "@features/filter-venues";
import { CitySelect } from "@features/select-city";
import { type GenreId, genres } from "@shared/config";
import { plural } from "@shared/lib";
import { UiEmpty, UiIcon, UiModal, UiPills } from "@shared/ui";

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

const panelOpen = ref(false);
const sheetOpen = ref(false);
const toggleFilters = () => {
  if (window.matchMedia("(min-width: 768px)").matches) panelOpen.value = !panelOpen.value;
  else sheetOpen.value = true;
};

// сброс сразу закрывает фильтры - и панель на десктопе, и лист на мобайле
const reset = () => {
  filters.value = emptyFilters();
  panelOpen.value = false;
  sheetOpen.value = false;
};
</script>

<template>
  <div>
    <section class="container-x pt-12 pb-10 text-center sm:pt-20">
      <h1 class="h-display text-[14vw] sm:text-8xl lg:text-[8.5rem]">Бары и сцены</h1>
      <p class="mt-4 text-white/80">{{ results.length }} {{ plural(results.length, ["место", "места", "мест"]) }} {{ city.where }}</p>

      <div class="search-bar relative z-30 mx-auto mt-8 flex max-w-2xl flex-col gap-1 p-2 sm:flex-row">
        <label class="flex flex-1 items-center gap-3 px-3">
          <UiIcon name="search" class="text-white/60" :size="18" />
          <input
            v-model="filters.q"
            type="search"
            placeholder="Название, улица или метро"
            class="w-full bg-transparent py-2.5 text-sm placeholder:text-white/50"
            aria-label="Поиск по заведениям"
          />
        </label>
        <div class="flex gap-1">
          <CitySelect class="flex-1 [&>button]:h-full [&>button]:w-full" />
          <button class="pill" :class="{ 'pill-active': panelOpen }" :aria-expanded="panelOpen" @click="toggleFilters">
            <UiIcon name="filter" :size="16" /> Фильтры
            <span v-if="extraCount" class="grid size-5 place-items-center rounded-md bg-accent text-[11px] text-white">{{ extraCount }}</span>
          </button>
        </div>
      </div>
      <div class="mt-6"><UiPills v-model="filters.genres" :options="genres" multiple center /></div>
    </section>

    <section class="container-x">
      <!-- Десктоп: раскрывающаяся панель доп. фильтров -->
      <Transition
        enter-active-class="transition duration-400 ease-[var(--ease-liquid)]"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition duration-200"
        leave-to-class="opacity-0"
      >
        <div v-if="panelOpen" class="card mb-8 hidden p-6 md:block">
          <VenueFilters v-model="filters" />
          <div class="mt-6 flex justify-end">
            <button class="btn-ghost" @click="reset">Сбросить всё</button>
          </div>
        </div>
      </Transition>

      <!-- Мобайл: стеклянный лист -->
      <UiModal v-model="sheetOpen" title="Фильтры" panel-class="max-sm:[--lg-tint:rgb(26_21_22/0.92)]">
        <VenueFilters v-model="filters" />
        <div class="mt-8 grid grid-cols-2 gap-2">
          <button class="btn-dark py-3.5" @click="reset">Сбросить</button>
          <button class="btn-primary py-3.5" @click="sheetOpen = false">Показать {{ results.length }}</button>
        </div>
      </UiModal>
    </section>

    <!-- Результаты: сетка карточек -->
    <section class="container-x">
      <div v-if="results.length" class="grid sm:grid-cols-2 lg:grid-cols-3">
        <VenueCard v-for="v in results" :key="v.slug" :venue="v">
          <template #actions><FavoriteButton kind="venues" :id="v.slug" /></template>
        </VenueCard>
      </div>
      <UiEmpty v-else icon="glass" title="Ничего не нашлось">
        <button class="btn-dark" @click="reset">Сбросить фильтры</button>
      </UiEmpty>
    </section>
  </div>
</template>
