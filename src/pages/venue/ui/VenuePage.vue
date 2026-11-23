<script setup lang="ts">
import { cityName } from "@entities/city";
import { events, isUpcoming } from "@entities/event";
import { formatName, getVenue } from "@entities/venue";
import { FavoriteButton } from "@features/favorites";
import { BookingRequest } from "@features/book-table";
import { ShareButton } from "@features/share";
import { genreName } from "@shared/config";
import { weekdayIndex } from "@shared/lib";
import { UiIcon, UiPhoto } from "@shared/ui";
import { EventPosters } from "@widgets/event-posters";
import { EventStories } from "@widgets/event-stories";
import VenueAbout from "./VenueAbout.vue";
import VenueGallery from "./VenueGallery.vue";
import VenueMenu from "./VenueMenu.vue";

const route = useRoute();
const foundVenue = getVenue(String(route.params.slug));
if (!foundVenue) throw createError({ statusCode: 404, message: "Заведение не найдено", fatal: true });
const venue = foundVenue;

const tabs = [
  { id: "schedule", name: "Афиша" },
  { id: "about", name: "О заведении" },
  { id: "menu", name: "Меню" },
  { id: "gallery", name: "Галерея" },
  { id: "booking", name: "Бронирование" },
  { id: "rules", name: "Правила" },
] as const;
type VenueTabId = (typeof tabs)[number]["id"];
const tabTrack = ref<HTMLElement>();
const tab = ref<VenueTabId>(tabs.find((t) => t.id === route.query.tab)?.id ?? "schedule");
watch(tab, (t) => {
  if (route.query.tab !== t) navigateTo({ query: { ...route.query, tab: t } }, { replace: true });
});
watch(
  () => route.query.tab,
  (value) => {
    tab.value = tabs.find((t) => t.id === value)?.id ?? "schedule";
  },
);
const onTabKeydown = async (event: KeyboardEvent, index: number) => {
  const directions: Record<string, number> = {
    ArrowRight: (index + 1) % tabs.length,
    ArrowLeft: (index - 1 + tabs.length) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  };
  const next = directions[event.key];
  if (next === undefined) return;
  event.preventDefault();
  tab.value = tabs[next]!.id;
  await nextTick();
  tabTrack.value?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus({ preventScroll: true });
};
watch(
  tab,
  async () => {
    await nextTick();
    const track = tabTrack.value;
    const selected = track?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (track && selected) track.scrollTo({ left: selected.offsetLeft - (track.clientWidth - selected.offsetWidth) / 2, behavior: "smooth" });
  },
  { immediate: true },
);

// «Забронировать»: открыть вкладку и доскроллить до условий (отступ сверху - scroll-mt под липкие шапку и вкладки)
const bookingBlock = ref<HTMLElement>();
const openBooking = async () => {
  tab.value = "booking";
  await nextTick();
  bookingBlock.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const venueEvents = events.filter((e) => e.venue === venue.slug && isUpcoming(e));
const storyId = ref<string | null>(null); // выступление из календаря, открытое в историях
const todayWeekdayIndex = weekdayIndex();

useHead({ title: `${venue.name} - Joined`, meta: [{ name: "description", content: venue.short }] });
</script>

<template>
  <div>
    <section class="container-x pt-6">
      <NuxtLink to="/venues" class="btn-dark mb-5 bg-[#222225] pl-3 hover:bg-[#303033]"><UiIcon name="chevron-left" :size="16" /> Все заведения</NuxtLink>

      <!-- Обложка; название и описание - в блоке под фото -->
      <article class="rim relative overflow-hidden rounded-4xl bg-ink">
        <div class="relative aspect-4/5 sm:aspect-video lg:aspect-21/9">
          <UiPhoto :src="venue.photo" :alt="venue.name" class="absolute inset-0 h-full w-full" />
          <div class="pointer-events-none absolute inset-0 bg-black/30" />
          <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-ink" />
        </div>

        <!-- Описание под фото, на чёрном - чтобы не сливалось с изображением -->
        <div class="p-6 sm:px-10 sm:pb-10 lg:px-14">
          <h1 class="h-display mb-4 text-4xl font-bold wrap-break-word lowercase sm:text-6xl lg:text-7xl">{{ venue.name }}</h1>
          <p class="max-w-2xl text-white/85 sm:text-lg">{{ venue.short }}</p>
          <p class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold tracking-wider uppercase">
            <span class="text-accent-text">{{ formatName(venue.format) }}</span>
            <span v-for="g in venue.genres" :key="g">{{ genreName(g) }}</span>
          </p>
        </div>
      </article>

      <!-- Быстрые факты и действия -->
      <div class="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div class="card grid grid-cols-2 gap-4 p-5 sm:flex sm:gap-12 sm:p-6">
          <div>
            <p class="text-xs text-muted">Сегодня</p>
            <p class="mt-1 text-xl font-medium">{{ venue.hours[todayWeekdayIndex]!.time }}</p>
          </div>
          <a :href="`https://yandex.ru/maps/?pt=${venue.lng},${venue.lat}&z=16&l=map`" target="_blank" rel="noopener" class="group col-span-2 sm:col-span-1">
            <p class="text-xs text-muted">Адрес</p>
            <p
              class="mt-1 text-xl font-medium underline decoration-white/30 underline-offset-4 transition-colors group-hover:text-sand group-hover:decoration-current"
            >
              {{ cityName(venue.city) }}, {{ venue.address }}
            </p>
          </a>
        </div>
        <div class="card flex items-center gap-2 p-3">
          <button class="btn-primary flex-1 py-3.5" @click="openBooking">Забронировать</button>
          <FavoriteButton kind="venues" :id="venue.slug" class="size-12" />
          <ShareButton :title="venue.name" />
        </div>
      </div>
    </section>

    <nav class="container-x mt-6" aria-label="Разделы заведения">
      <div class="card overflow-hidden rounded-2xl">
        <div
          ref="tabTrack"
          role="tablist"
          aria-label="Разделы заведения"
          class="relative flex gap-1 overflow-x-auto overscroll-x-contain p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            v-for="(t, index) in tabs"
            :id="`venue-tab-${t.id}`"
            :key="t.id"
            type="button"
            role="tab"
            :aria-selected="tab === t.id"
            aria-controls="venue-tab-panel"
            :tabindex="tab === t.id ? 0 : -1"
            class="relative flex min-h-12 shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-offset-[-3px] motion-reduce:transition-none sm:flex-1 sm:px-4"
            :class="tab === t.id ? 'bg-white/6 text-white' : 'text-white/55 hover:bg-white/4 hover:text-white'"
            @click="tab = t.id"
            @keydown="onTabKeydown($event, index)"
          >
            {{ t.name }}
          </button>
        </div>
      </div>
    </nav>

    <section id="venue-tab-panel" role="tabpanel" :aria-labelledby="`venue-tab-${tab}`" class="container-x pt-8">
      <div v-if="tab === 'schedule'">
        <h2 class="h-display mb-8 text-4xl sm:text-5xl">Мероприятия</h2>
        <EventPosters :events="venueEvents" @open="storyId = $event" />
      </div>

      <VenueAbout v-else-if="tab === 'about'" :venue="venue" />
      <VenueMenu v-else-if="tab === 'menu'" :venue="venue" />
      <VenueGallery v-else-if="tab === 'gallery'" :photos="venue.gallery" />

      <!-- Бронирование: условия и заявка на обратный звонок -->
      <div v-else-if="tab === 'booking'" ref="bookingBlock" class="card scroll-mt-40 p-6 sm:scroll-mt-44 sm:p-10">
        <h2 class="h-display mb-6 text-4xl sm:text-5xl">Условия бронирования</h2>
        <ul>
          <li class="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
            <p class="min-w-0 text-base">Количество гостей</p>
            <span class="shrink-0 text-base tabular-nums">{{ venue.booking.minGuests }}–{{ venue.booking.maxGuests }}</span>
          </li>
          <li v-for="c in venue.booking.conditions" :key="c" class="border-b border-line py-3.5 text-base last:border-b-0">{{ c }}</li>
        </ul>

        <div class="mt-8">
          <BookingRequest :venue="venue" />
        </div>
      </div>

      <!-- Правила: тот же вид, что у меню и условий бронирования -->
      <div v-else-if="tab === 'rules'" class="card p-6 sm:p-10">
        <h2 class="h-display mb-6 text-4xl sm:text-5xl">Правила посещения</h2>
        <ul>
          <li v-for="r in venue.rules" :key="r" class="border-b border-line py-3.5 text-base last:border-b-0">{{ r }}</li>
        </ul>
      </div>
    </section>

    <EventStories v-model="storyId" :events="venueEvents" />
  </div>
</template>
