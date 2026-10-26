<script setup lang="ts">
import { getArtist } from "@entities/artist";
import { useCurrentCity } from "@entities/city";
import { byDateTime, type EventItem, events, isUpcoming, minPrice } from "@entities/event";
import { getVenue } from "@entities/venue";
import { CitySelect } from "@features/select-city";
import { type GenreId, genres } from "@shared/config";
import { addDays, dayNumber, formatPrice, formatWeekdayLong, isWeekend, monthShort, plural, todayISO } from "@shared/lib";
import { UiEmpty, UiIcon, UiPills } from "@shared/ui";

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

// Длинная афиша: дни подгружаются порциями, а длинный день свёрнут до первых событий
const DAYS_STEP = 7;
const PER_DAY = 5;
const daysShown = ref(DAYS_STEP);
const expanded = ref(new Set<string>());
const visible = computed(() => grouped.value.slice(0, daysShown.value));
const expand = (date: string) => (expanded.value = new Set(expanded.value).add(date));
watch([genre, period, cityId, q], () => {
  daysShown.value = DAYS_STEP;
  expanded.value = new Set();
});
</script>

<template>
  <div>
    <section class="container-x pt-12 pb-12 text-center sm:pt-20">
      <h1 class="h-display text-[17vw] sm:text-8xl lg:text-[9rem]">Афиша</h1>
      <p class="mt-4 text-white/80">Концерты и вечеринки твоего города</p>
      <!-- Строка поиска, как на странице мест: поле + город -->
      <div class="search-bar relative z-30 mx-auto mt-8 flex max-w-2xl flex-col gap-1 p-2 sm:flex-row">
        <label class="flex flex-1 items-center gap-3 px-3">
          <UiIcon name="search" class="text-white/60" :size="18" />
          <input
            v-model="q"
            type="search"
            placeholder="Событие, артист или заведение"
            class="w-full bg-transparent py-2.5 text-sm placeholder:text-white/50"
            aria-label="Поиск по афише"
          />
        </label>
        <CitySelect class="[&>button]:h-full [&>button]:w-full" />
      </div>
      <div class="mt-6"><UiPills v-model="genre" :options="genres" center /></div>
      <div class="mt-3"><UiPills v-model="period" :options="periods" all-label="Любая дата" center /></div>
    </section>

    <section class="container-x">
      <!-- Афиша-постер: крупная дата слева, события дня справа -->
      <div v-if="grouped.length" class="card p-5 sm:p-10">
        <div class="mb-6 flex items-start justify-between gap-4 text-xs tracking-widest uppercase sm:mb-8">
          <span class="text-soft">Афиша<br />{{ city.name }}</span>
        </div>

        <div v-for="[date, items] in visible" :key="date" class="grid gap-4 border-t border-line py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-8">
          <h2 class="h-display text-[16vw] leading-[0.85] uppercase sm:text-8xl lg:text-9xl" :class="isWeekend(date) ? 'text-sand' : ''">
            {{ monthShort(date) }} {{ dayNumber(date) }}
          </h2>

          <div class="space-y-4 md:pt-2">
            <p class="text-xs tracking-widest uppercase" :class="isWeekend(date) ? 'text-accent-text' : 'text-muted'">{{ formatWeekdayLong(date) }}</p>
            <NuxtLink v-for="e in expanded.has(date) ? items : items.slice(0, PER_DAY)" :key="e.id" :to="`/events/${e.id}`" class="group flex items-baseline justify-between gap-4">
              <div class="min-w-0">
                <p class="font-medium uppercase transition-colors group-hover:text-sand">{{ e.title }}</p>
                <p class="mt-0.5 text-xs tracking-wider text-muted uppercase">{{ getVenue(e.venue)?.name }} · {{ e.time }}</p>
              </div>
              <span class="shrink-0 text-sm tabular-nums">от {{ formatPrice(minPrice(e)) }}</span>
            </NuxtLink>
            <button v-if="!expanded.has(date) && items.length > PER_DAY" class="text-xs tracking-widest text-accent-text uppercase transition-colors hover:text-sand" @click="expand(date)">
              Ещё {{ items.length - PER_DAY }} {{ plural(items.length - PER_DAY, ["событие", "события", "событий"]) }}
            </button>
          </div>
        </div>

        <div v-if="daysShown < grouped.length" class="border-t border-line pt-6 text-center">
          <button class="btn-dark" @click="daysShown += DAYS_STEP">Показать ещё</button>
        </div>
      </div>
      <UiEmpty v-else icon="calendar" title="Событий не найдено" text="Попробуйте изменить запрос, жанр, дату или город.">
        <button
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
    </section>
  </div>
</template>
