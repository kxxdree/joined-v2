<script setup lang="ts">
import { events, isUpcoming } from "@entities/event";
import { formatName, getVenue } from "@entities/venue";
import { FavoriteButton } from "@features/favorites";
import { ShareButton } from "@features/share";
import { weekdayIndex } from "@shared/lib";
import { UiIcon } from "@shared/ui";
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
  { id: "gallery", name: "Галерея", icon: "image" },
  { id: "schedule", name: "Афиша", icon: "calendar" },
  { id: "menu", name: "Меню", icon: "utensils" },
  { id: "about", name: "О месте", icon: "info" },
  { id: "booking", name: "Бронь", icon: "users" },
  { id: "rules", name: "Правила", icon: "list" },
] as const;
type TabId = (typeof tabs)[number]["id"];
const tab = ref<TabId>(tabs.find((t) => t.id === route.query.tab)?.id ?? "gallery");
watch(tab, (t) => {
  const { feed: _, ...query } = route.query; // лента фото относится только к галерее
  navigateTo({ query: { ...query, tab: t } }, { replace: true });
});

// активная вкладка всегда на виду: лента сама прокручивается к ней (на телефоне вкладки не влезают в экран)
const tabsEl = ref<HTMLElement>();
const revealTab = () => {
  const el = tabsEl.value;
  const btn = el?.querySelector<HTMLElement>("[aria-pressed=true]");
  if (el && btn) el.scrollTo({ left: btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
};
watch(tab, () => nextTick(revealTab));
onMounted(revealTab);

const venueEvents = events.filter((e) => e.venue === v.slug && isUpcoming(e));
const storyId = ref<string | null>(null); // выступление из календаря, открытое в историях
const todayIdx = weekdayIndex();

// круглая стеклянная кнопка в шапке заведения (size-10! - перебивает размер внутри ShareButton)
const glassIcon = "grid size-10! shrink-0 place-items-center rounded-full bg-black/35 text-white ring-1 ring-white/15 backdrop-blur-md transition-colors hover:bg-black/50";
</script>

<template>
  <div>
    <!-- Шапка как в профиле: назад, название с короткой подписью, действия - ничего лишнего над галереей -->
    <section class="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-2 sm:px-6">
      <NuxtLink to="/venues" :class="glassIcon" aria-label="Все заведения"><UiIcon name="chevron-left" :size="20" /></NuxtLink>
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-2xl font-medium tracking-[-0.04em] sm:text-3xl">{{ v.name }}</h1>
        <p class="mt-1 font-mono text-[10px] leading-snug tracking-[0.14em] text-white/70 uppercase sm:text-xs">
          {{ formatName(v.format) }} · {{ v.metro ? `м. ${v.metro}` : v.address }} · <span class="whitespace-nowrap">{{ v.hours[todayIdx]!.time }}</span>
        </p>
      </div>
      <FavoriteButton kind="venues" :id="v.slug" :class="glassIcon" />
      <ShareButton :title="v.name" :class="glassIcon" />
    </section>

    <!-- Вкладки: стеклянные пилюли с иконками, прилипают под шапкой сайта; активная - светлая -->
    <nav class="sticky top-19 z-30 mx-auto mt-3 max-w-7xl sm:top-20 sm:px-6" aria-label="Разделы заведения">
      <div ref="tabsEl" class="scroll-x px-4 sm:px-0">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          class="flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors"
          :class="tab === t.id ? 'bg-[#ffe3d6] text-ink' : 'bg-black/35 text-white/85 ring-1 ring-white/15 backdrop-blur-md hover:bg-black/50'"
          :aria-pressed="tab === t.id"
          @click="tab = t.id"
        >
          <UiIcon :name="t.icon" :size="18" /> {{ t.name }}
        </button>
      </div>
    </nav>

    <!-- Галерея на телефоне - от края до края, остальные вкладки с обычными отступами -->
    <section class="mx-auto max-w-7xl pt-3 sm:px-6" :class="{ 'px-4': tab !== 'gallery' }">
      <VenueGallery v-if="tab === 'gallery'" :photos="v.gallery" />
      <EventCalendar v-else-if="tab === 'schedule'" :events="venueEvents" :title="v.name" @open="storyId = $event" />
      <VenueAbout v-else-if="tab === 'about'" :venue="v" />
      <VenueMenu v-else-if="tab === 'menu'" :venue="v" />

      <!-- Бронирование: условия в стиле меню + контакты для брони -->
      <div v-else-if="tab === 'booking'" class="card p-6 sm:p-10">
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
        <ul>
          <li v-for="r in v.rules" :key="r" class="border-b border-line py-3.5 text-base last:border-b-0">{{ r }}</li>
        </ul>
      </div>
    </section>

    <EventStories v-model="storyId" :events="venueEvents" />
  </div>
</template>
