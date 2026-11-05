<script setup lang="ts">
import { getArtist } from "@entities/artist";
import { useCurrentCity } from "@entities/city";
import { byDateTime, type EventItem, EventRows, events, isUpcoming } from "@entities/event";
import { getVenue } from "@entities/venue";
import { CitySelect } from "@features/select-city";
import { type GenreId, genres } from "@shared/config";
import { addDays, isWeekend, plural, todayISO } from "@shared/lib";
import { UiEmpty, UiIcon, UiPageHead, UiPills } from "@shared/ui";

useHead({ title: "Афиша - Joined" });

const route = useRoute();
const { cityId, city } = useCurrentCity();
const genre = ref<GenreId | "">((route.query.genre as GenreId) ?? "");
const q = ref("");

// поиск по названию события, заведению и артистам лайнапа
const matches = (e: EventItem, needle: string) =>
  [e.title, getVenue(e.venue)?.name ?? "", ...e.artists.map((a) => getArtist(a)?.name ?? "")].some((s) => s.toLowerCase().includes(needle));

const periods = [
  { id: "today", name: "Сегодня" },
  { id: "tomorrow", name: "Завтра" },
  { id: "weekend", name: "Выходные" },
  { id: "week", name: "Неделя" },
  { id: "month", name: "Месяц" },
] as const;
type Period = (typeof periods)[number]["id"];
const period = ref<Period | "">("");

const inPeriod = (date: string) => {
  const today = todayISO();
  switch (period.value) {
    case "today":
      return date === today;
    case "tomorrow":
      return date === addDays(today, 1);
    case "weekend":
      return date <= addDays(today, 7) && isWeekend(date);
    case "week":
      return date <= addDays(today, 7);
    case "month":
      return date <= addDays(today, 31);
    default:
      return true;
  }
};

const grouped = computed(() => {
  const needle = q.value.trim().toLowerCase();
  const list = events
    .filter((e) => isUpcoming(e) && getVenue(e.venue)?.city === cityId.value)
    .filter((e) => !genre.value || e.genres.includes(genre.value))
    .filter((e) => inPeriod(e.date))
    .filter((e) => !needle || matches(e, needle))
    .sort(byDateTime);
  const map = new Map<string, EventItem[]>();
  for (const e of list) map.set(e.date, [...(map.get(e.date) ?? []), e]);
  return [...map.entries()];
});

const total = computed(() => grouped.value.reduce((n, [, items]) => n + items.length, 0));

// Длинная афиша: дни подгружаются порциями, а длинный день свёрнут до первых событий (в EventRows)
const DAYS_STEP = 7;
const PER_DAY = 5;
const daysShown = ref(DAYS_STEP);
const visible = computed(() => grouped.value.slice(0, daysShown.value));
watch([genre, period, cityId, q], () => {
  daysShown.value = DAYS_STEP;
});

const venueName = (e: EventItem) => getVenue(e.venue)?.name ?? "";
</script>

<template>
  <div>
    <section class="container-x">
      <div class="max-w-3xl">
        <UiPageHead title="Афиша" :caption="`${total} ${plural(total, ['событие', 'события', 'событий'])} ${city.where}`" />

        <!-- Поиск одной плашкой: поле и город внутри; ниже фильтры лентами -->
        <div class="search-bar mt-4 flex flex-col gap-1 p-2 sm:flex-row">
          <label class="flex min-w-0 flex-1 items-center gap-3 px-3">
          <UiIcon name="search" class="shrink-0 text-white/60" :size="18" />
          <input v-model="q" type="search" placeholder="Событие, артист или заведение" class="w-full bg-transparent py-2.5 text-sm placeholder:text-white/50" aria-label="Поиск по афише" />
        </label>
          <CitySelect modal class="[&>button]:h-full [&>button]:w-full" />
        </div>
        <div class="mt-3"><UiPills v-model="period" :options="periods" all-label="Любая дата" /></div>
        <div class="mt-1"><UiPills v-model="genre" :options="genres" all-label="Все жанры" /></div>

        <div class="mt-6">
          <template v-if="grouped.length">
            <EventRows :groups="visible" :subtitle="venueName" :per-day="PER_DAY" />
            <div v-if="daysShown < grouped.length" class="mt-6 text-center">
              <button type="button" class="btn-dark" @click="daysShown += DAYS_STEP">Показать ещё</button>
            </div>
          </template>
          <UiEmpty v-else icon="calendar" title="Событий не найдено" text="Попробуйте изменить запрос, жанр, дату или город.">
            <button
              type="button"
              class="btn-dark"
              @click="
                q = '';
                genre = '';
                period = '';
              "
            >
              Сбросить фильтры
            </button>
          </UiEmpty>
        </div>
      </div>
    </section>
  </div>
</template>
