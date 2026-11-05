<script setup lang="ts">
import { events, isUpcoming } from "@entities/event";
import { formatName, getVenue } from "@entities/venue";
import { FavoriteButton } from "@features/favorites";
import { ShareButton } from "@features/share";
import { weekdayIndex } from "@shared/lib";
import { UiIcon, UiPageHead, UiTabs } from "@shared/ui";
import { EventCalendar } from "@widgets/event-calendar";
import VenueAbout from "./VenueAbout.vue";
import VenueGallery from "./VenueGallery.vue";
import VenueMenu from "./VenueMenu.vue";

const route = useRoute();
const found = getVenue(String(route.params.slug));
if (!found) throw createError({ statusCode: 404, message: "Заведение не найдено", fatal: true });
const v = found;

useHead({ title: `${v.name} - Joined`, meta: [{ name: "description", content: v.short }] });

const tabs = [
  { id: "gallery", name: "Галерея" },
  { id: "schedule", name: "Афиша" },
  { id: "menu", name: "Меню" },
  { id: "about", name: "О месте" },
  { id: "booking", name: "Бронь" },
  { id: "rules", name: "Правила" },
] as const;
type TabId = (typeof tabs)[number]["id"];
const tab = ref<TabId>(tabs.find((t) => t.id === route.query.tab)?.id ?? "gallery");
watch(tab, (t) => {
  const { feed: _, ...query } = route.query; // лента фото относится только к галерее
  navigateTo({ query: { ...query, tab: t } }, { replace: true });
});

const venueEvents = events.filter((e) => e.venue === v.slug && isUpcoming(e));
const todayIdx = weekdayIndex();

// из карточки афиши: вкладка брони короче, поэтому возвращаемся к началу страницы
const openBooking = () => {
  tab.value = "booking";
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>

<template>
  <div>
    <!-- Шапка как в профиле и вкладки - ничего лишнего над содержимым -->
    <div class="container-x">
      <UiPageHead :title="v.name" back="/venues" back-label="Все заведения">
        <template #caption>
          {{ formatName(v.format) }} · {{ v.metro ? `м. ${v.metro}` : v.address }} · <span class="whitespace-nowrap">{{ v.hours[todayIdx]!.time }}</span>
        </template>
        <template #actions>
          <FavoriteButton kind="venues" :id="v.slug" class="size-10" />
          <ShareButton :title="v.name" class="size-10" />
        </template>
      </UiPageHead>
    </div>
    <UiTabs v-model="tab" :tabs="tabs" class="container-x" />

    <!-- Галерея, меню и афиша на телефоне - от края до края, остальные вкладки с обычными отступами -->
    <section class="mx-auto w-full max-w-7xl pt-3 sm:px-6 lg:px-12" :class="{ 'px-4': tab !== 'gallery' && tab !== 'menu' && tab !== 'schedule' }">
      <VenueGallery v-if="tab === 'gallery'" :photos="v.gallery" />
      <EventCalendar v-else-if="tab === 'schedule'" :events="venueEvents" @book="openBooking" />
      <VenueAbout v-else-if="tab === 'about'" :venue="v" />
      <VenueMenu v-else-if="tab === 'menu'" :venue="v" />

      <!-- Бронирование: условия строками и способы связаться -->
      <div v-else-if="tab === 'booking'" class="max-w-3xl">
        <ul>
          <li class="hair-row flex items-baseline justify-between gap-6">
            <p class="min-w-0">Количество гостей</p>
            <span class="shrink-0 tabular-nums">{{ v.booking.minGuests }}–{{ v.booking.maxGuests }}</span>
          </li>
          <li v-for="c in v.booking.conditions" :key="c" class="hair-row">{{ c }}</li>
        </ul>
        <div class="mt-6 flex flex-col gap-2 sm:flex-row">
          <a :href="`https://t.me/${v.telegram.replace('@', '')}`" target="_blank" rel="noopener" class="btn-primary h-12"><UiIcon name="telegram" :size="18" /> Написать в Telegram</a>
          <a :href="`tel:${v.phone.replace(/[^\d+]/g, '')}`" class="btn-dark h-12"><UiIcon name="phone" :size="18" /> {{ v.phone }}</a>
        </div>
      </div>

      <!-- Правила: нумерованные строки -->
      <ol v-else-if="tab === 'rules'" class="max-w-3xl">
        <li v-for="(r, i) in v.rules" :key="r" class="hair-row flex items-baseline gap-4">
          <span class="mono-cap shrink-0 tabular-nums">{{ String(i + 1).padStart(2, "0") }}</span>
          <p class="min-w-0">{{ r }}</p>
        </li>
      </ol>
    </section>
  </div>
</template>
