<script setup lang="ts">
import { cityName } from "@entities/city";
import { events, isUpcoming } from "@entities/event";
import { formatName, getVenue } from "@entities/venue";
import { FavoriteButton } from "@features/favorites";
import { ShareButton } from "@features/share";
import { genreName } from "@shared/config";
import { weekdayIndex } from "@shared/lib";
import { UiIcon, UiPhoto } from "@shared/ui";
import { EventCalendar } from "@widgets/event-calendar";
import { EventStories } from "@widgets/event-stories";
import VenueAbout from "./VenueAbout.vue";
import VenueGallery from "./VenueGallery.vue";
import VenueMenu from "./VenueMenu.vue";

const route = useRoute();
const found = getVenue(String(route.params.slug));
if (!found) throw createError({ statusCode: 404, message: "Заведение не найдено", fatal: true });
const v = found;

useHead({ title: `${v.name} - Joined`, meta: [{ name: "description", content: v.short }] });

const tabs = [
  { id: "schedule", name: "Афиша" },
  { id: "about", name: "О заведении" },
  { id: "menu", name: "Меню" },
  { id: "gallery", name: "Галерея" },
  { id: "booking", name: "Бронирование" },
  { id: "rules", name: "Правила" },
] as const;
type TabId = (typeof tabs)[number]["id"];
const tab = ref<TabId>(tabs.find((t) => t.id === route.query.tab)?.id ?? "schedule");
watch(tab, (t) => navigateTo({ query: { ...route.query, tab: t } }, { replace: true }));

// «Забронировать»: открыть вкладку и доскроллить до условий (отступ сверху - scroll-mt под липкие шапку и вкладки)
const bookingBlock = ref<HTMLElement>();
const openBooking = async () => {
  tab.value = "booking";
  await nextTick();
  bookingBlock.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const venueEvents = events.filter((e) => e.venue === v.slug && isUpcoming(e));
const storyId = ref<string | null>(null); // выступление из календаря, открытое в историях
const todayIdx = weekdayIndex();
</script>

<template>
  <div>
    <section class="container-x pt-6">
      <NuxtLink to="/venues" class="btn-ghost mb-5 pl-3"><UiIcon name="chevron-left" :size="16" /> Все заведения</NuxtLink>

      <!-- Обложка: постер с названием по центру, как у артиста; описание - под фото -->
      <article class="rim relative overflow-hidden rounded-4xl bg-black">
        <div class="relative aspect-4/5 sm:aspect-video lg:aspect-21/9">
          <UiPhoto :src="v.photo" :alt="v.name" class="absolute inset-0 h-full w-full" />
          <div class="pointer-events-none absolute inset-0 bg-black/30" />
          <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black" />

          <div class="absolute inset-0 grid place-items-center px-4">
            <h1 class="h-display text-center text-[13vw] font-bold lowercase sm:text-8xl lg:text-9xl">{{ v.name }}</h1>
          </div>
        </div>

        <!-- Описание под фото, на чёрном - чтобы не сливалось с изображением -->
        <div class="p-6 sm:px-10 sm:pb-10 lg:px-14">
          <p class="max-w-2xl text-white/85 sm:text-lg">{{ v.short }}</p>
          <p class="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold tracking-wider uppercase">
            <span class="text-accent-text">{{ formatName(v.format) }}</span>
            <span v-for="g in v.genres" :key="g">{{ genreName(g) }}</span>
          </p>
        </div>
      </article>

      <!-- Быстрые факты и действия -->
      <div class="mt-3 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div class="card grid grid-cols-2 gap-4 p-5 sm:flex sm:gap-12 sm:p-6">
          <div>
            <p class="text-xs text-muted">Сегодня</p>
            <p class="mt-1 text-xl font-medium">{{ v.hours[todayIdx]!.time }}</p>
          </div>
          <a :href="`https://yandex.ru/maps/?pt=${v.lng},${v.lat}&z=16&l=map`" target="_blank" rel="noopener" class="group col-span-2 sm:col-span-1">
            <p class="text-xs text-muted">Адрес</p>
            <p class="mt-1 text-xl font-medium underline decoration-white/30 underline-offset-4 transition-colors group-hover:text-sand group-hover:decoration-current">{{ cityName(v.city) }}, {{ v.address }}</p>
          </a>
        </div>
        <div class="card flex items-center gap-2 p-3">
          <button class="btn-primary flex-1 py-3.5" @click="openBooking"><UiIcon name="calendar" :size="18" /> Забронировать</button>
          <FavoriteButton kind="venues" :id="v.slug" class="size-12" />
          <ShareButton :title="v.name" />
        </div>
      </div>
    </section>

    <!-- Вкладки: стеклянная плавающая лента -->
    <nav class="sticky top-22 z-30 mt-8 px-3 sm:top-24 sm:px-6">
      <div class="glass lg-refract mx-auto max-w-7xl rounded-full p-1.5 [--lg-refract-blur:16px]">
        <div class="scroll-x py-0">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="pill"
            :class="tab === t.id ? 'pill-active' : 'bg-transparent shadow-none backdrop-blur-none before:hidden'"
            @click="tab = t.id"
          >
            {{ t.name }}
          </button>
        </div>
      </div>
    </nav>

    <section class="container-x pt-10">
      <div v-if="tab === 'schedule'">
        <h2 class="h-display mb-8 text-4xl sm:text-5xl">Музыкальный календарь</h2>
        <EventCalendar :events="venueEvents" :title="v.name" @open="storyId = $event" />
      </div>

      <VenueAbout v-else-if="tab === 'about'" :venue="v" />
      <VenueMenu v-else-if="tab === 'menu'" :venue="v" />
      <VenueGallery v-else-if="tab === 'gallery'" :photos="v.gallery" />

      <!-- Бронирование: условия в стиле меню + контакты для брони -->
      <div v-else-if="tab === 'booking'" ref="bookingBlock" class="card scroll-mt-40 p-6 sm:scroll-mt-44 sm:p-10">
        <h2 class="h-display mb-6 text-4xl sm:text-5xl">Условия бронирования</h2>
        <ul>
          <li class="flex items-baseline justify-between gap-6 border-b border-line py-3.5">
            <p class="min-w-0 text-base">Количество гостей</p>
            <span class="shrink-0 text-base tabular-nums">{{ v.booking.minGuests }}–{{ v.booking.maxGuests }}</span>
          </li>
          <li v-for="c in v.booking.conditions" :key="c" class="border-b border-line py-3.5 text-base last:border-b-0">{{ c }}</li>
        </ul>

        <div class="mt-8 flex flex-col gap-2 sm:flex-row">
          <a :href="`https://t.me/${v.telegram.replace('@', '')}`" target="_blank" rel="noopener" class="btn-primary py-3.5">
            <UiIcon name="telegram" :size="18" /> Написать в Telegram
          </a>
          <a :href="`tel:${v.phone.replace(/[^\d+]/g, '')}`" class="btn-dark py-3.5"><UiIcon name="phone" :size="18" /> {{ v.phone }}</a>
        </div>
      </div>

      <!-- Правила: тот же вид, что у меню и условий бронирования -->
      <div v-else-if="tab === 'rules'" class="card p-6 sm:p-10">
        <h2 class="h-display mb-6 text-4xl sm:text-5xl">Правила посещения</h2>
        <ul>
          <li v-for="r in v.rules" :key="r" class="border-b border-line py-3.5 text-base last:border-b-0">{{ r }}</li>
        </ul>
      </div>
    </section>

    <EventStories v-model="storyId" :events="venueEvents" />
  </div>
</template>
