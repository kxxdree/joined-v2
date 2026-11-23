<script setup lang="ts">
import { useCurrentCity } from "@entities/city";
import { VenueCard, venues } from "@entities/venue";
import { FavoriteButton } from "@features/favorites";
import { applyVenueFilters, countExtra, emptyFilters, VenueFilters, type VenueFilterState } from "@features/filter-venues";
import { CitySelect } from "@features/select-city";
import { type GenreId, genres } from "@shared/config";
import { plural } from "@shared/lib";
import { UiEmpty, UiIcon, UiModal, UiPills, UiSelect } from "@shared/ui";

const route = useRoute();
const { cityId } = useCurrentCity();

const pageSize = 24;
const filters = useState<VenueFilterState>("venues-filters", () => ({
  ...emptyFilters(),
  q: String(route.query.q ?? ""),
  genres: route.query.genre ? [route.query.genre as GenreId] : [],
}));
const visibleCount = useState("venues-visible-count", () => pageSize);
const sort = useState<"popular" | "name" | "">("venues-sort", () => "popular");
const sortOptions = [
  { id: "popular" as const, name: "Сначала популярные" },
  { id: "name" as const, name: "По названию" },
];
const filterContext = useState("venues-filter-context", () => ({
  city: cityId.value,
  query: JSON.stringify([route.query.q ?? "", route.query.genre ?? ""]),
}));

const filteredVenues = computed(() => {
  const matchingVenues = applyVenueFilters(
    venues.filter((venue) => venue.city === cityId.value),
    filters.value,
  );
  return sort.value === "name"
    ? matchingVenues.sort((a, b) => a.name.localeCompare(b.name, "ru") || a.slug.localeCompare(b.slug))
    : matchingVenues;
});
const visibleVenues = computed(() => filteredVenues.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleVenues.value.length < filteredVenues.value.length);
const extraCount = computed(() => countExtra(filters.value));

// Состояние переживает переход в карточку. Новые параметры URL и город начинают выдачу заново.
watch(
  () => [cityId.value, route.query.q, route.query.genre],
  () => {
    if (route.path !== "/venues") return;
    const serializedSearchParams = JSON.stringify([route.query.q ?? "", route.query.genre ?? ""]);
    if (serializedSearchParams !== filterContext.value.query) {
      filters.value = {
        ...emptyFilters(),
        q: String(route.query.q ?? ""),
        genres: route.query.genre ? [route.query.genre as GenreId] : [],
      };
    }
    if (serializedSearchParams !== filterContext.value.query || cityId.value !== filterContext.value.city) {
      visibleCount.value = pageSize;
    }
    filterContext.value = { city: cityId.value, query: serializedSearchParams };
  },
  { immediate: true },
);

watch([filters, sort], () => { visibleCount.value = pageSize; }, { deep: true, flush: "sync" });

const showMore = () => { visibleCount.value = Math.min(visibleCount.value + pageSize, filteredVenues.value.length); };
const panelOpen = ref(false);
const sheetOpen = ref(false);

const toggleFilters = () => {
  if (window.matchMedia("(min-width: 768px)").matches) panelOpen.value = !panelOpen.value;
  else sheetOpen.value = true;
};

// сброс сразу закрывает фильтры - и панель на десктопе, и лист на мобайле
const reset = () => {
  filters.value = emptyFilters();
  visibleCount.value = pageSize;
  panelOpen.value = false;
  sheetOpen.value = false;
};

useHead({ title: "Бары и площадки - Joined" });
</script>

<template>
  <div>
    <!-- Шапка как на афише: компактный заголовок, стеклянная строка поиска, текстовые фильтры с подписью -->
    <section class="container-x pt-10 pb-8 sm:pt-16 sm:pb-10">
      <h1 class="h-display text-6xl sm:text-7xl">Бары и сцены</h1>

      <div class="search-bar relative z-30 mt-6 flex flex-col gap-1 p-2 sm:flex-row">
        <label class="flex flex-1 items-center gap-3 px-3">
          <UiIcon name="search" class="text-white/60" :size="18" />
          <input
            v-model="filters.q"
            type="search"
            placeholder="Название заведения"
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
      <dl class="mt-5 grid gap-y-3 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-6">
        <dt class="text-[0.65rem] tracking-widest text-soft uppercase sm:pt-1.5">Жанр</dt>
        <dd><UiPills v-model="filters.genres" :options="genres" multiple variant="text" /></dd>
      </dl>
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
          <button class="btn-primary py-3.5" @click="sheetOpen = false">Показать</button>
        </div>
      </UiModal>
    </section>

    <!-- Результаты: сетка карточек -->
    <section class="container-x">
      <template v-if="filteredVenues.length">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted">Найдено {{ filteredVenues.length }} {{ plural(filteredVenues.length, ["место", "места", "мест"]) }}</p>
          <UiSelect v-model="sort" :options="sortOptions" :all-label="false" label="Сортировка заведений" class="venues-sort w-full sm:w-60" />
        </div>
        <div id="venues-results" class="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:gap-x-8 lg:gap-y-14">
          <VenueCard v-for="venue in visibleVenues" :key="venue.slug" :venue="venue" variant="guide">
            <template #actions><FavoriteButton kind="venues" :id="venue.slug" /></template>
          </VenueCard>
        </div>
        <div class="mt-10 flex flex-col items-center gap-4 sm:mt-14">
          <p class="text-sm text-muted tabular-nums" role="status">Показано {{ visibleVenues.length }} из {{ filteredVenues.length }}</p>
          <button v-if="hasMore" type="button" class="btn-dark btn-load-more" aria-controls="venues-results" @click="showMore">
            Показать ещё
          </button>
        </div>
      </template>
      <UiEmpty v-else icon="glass" title="Ничего не нашлось">
        <button class="btn-dark" @click="reset">Сбросить фильтры</button>
      </UiEmpty>
    </section>
  </div>
</template>

<style scoped>
.venues-sort :deep(> button) {
  height: 2.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  background: #4a4a4a;
}

.venues-sort :deep(> button:hover) {
  background: #555;
}

</style>
