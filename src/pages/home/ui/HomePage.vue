<script setup lang="ts">
import { artists } from "@entities/artist";
import { events } from "@entities/event";
import { venues } from "@entities/venue";
import { CitySelect } from "@features/select-city";
import { type GenreId, genres } from "@shared/config";
import { UiBackdrop, UiSelect } from "@shared/ui";

useHead({ title: "JOINED" });

const genre = ref<GenreId | "">("");

const search = () => navigateTo({ path: "/venues", query: { genre: genre.value || undefined } });

const stats = [
  { value: venues.length * 37, label: "баров и площадок" },
  { value: events.length * 61, label: "событий в месяц" },
  { value: artists.length * 54, label: "музыкантов и групп" },
];
</script>

<template>
  <div>
    <!-- HERO: на всю высоту вьюпорта, заезжает под sticky-хедер (h-16 + pt-3 / sm:pt-4) -->
    <section class="relative isolate -mt-19 flex min-h-dvh flex-col pt-19 sm:-mt-20 sm:pt-20">
      <UiBackdrop />
      <div class="container-x my-auto py-14 text-center sm:py-24">
        <h1 class="h-display text-[15vw] sm:text-8xl lg:text-[9rem]">Найди свой звук сегодня</h1>
        <!-- <p class="mx-auto mt-7 max-w-xl text-base text-white/80 sm:text-lg">
          Бары, концерты и джем-сейшены - по жанрам, с расписанием выступлений и билетами в пару кликов
        </p> -->

        <!-- Подбор по городу и жанру: жанр уходит в фильтры страницы мест -->
        <!-- На мобильных - в колонку, чтобы названия не обрезались -->
        <form class="search-bar mx-auto mt-10 flex max-w-md flex-col gap-2 p-2 text-left sm:flex-row" @submit.prevent="search">
          <!-- Выбор всегда в модалке: выпадашки уезжали за низ экрана. Телефон: текст крупнее -->
          <CitySelect inline modal class="h-12 shrink-0 border-b border-white/15 pb-2 sm:h-auto sm:border-r sm:border-b-0 sm:pr-1 sm:pb-0 [&>button]:text-base sm:[&>button]:text-sm" />
          <UiSelect v-model="genre" :options="genres" all-label="Любой жанр" icon="music" label="Жанр" inline modal class="h-12 min-w-0 sm:h-auto sm:flex-1 [&>button]:text-base sm:[&>button]:text-sm" />
          <button class="btn-primary px-6 py-3 sm:py-2" type="submit">Найти</button>
        </form>
      </div>

      <!-- Большого футера на главной нет - обязательное (условия, 18+) тонкой строкой внизу первого экрана -->
      <footer class="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-5 text-xs text-white/60 sm:pb-6">
        <span>© {{ new Date().getFullYear() }} Joined. Места и музыка</span>
        <nav class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <NuxtLink to="/rules" class="transition-colors hover:text-sand">Условия сервиса</NuxtLink>
          <NuxtLink to="/rules#privacy" class="transition-colors hover:text-sand">Конфиденциальность</NuxtLink>
          <span>18+</span>
        </nav>
      </footer>
    </section>

    <!-- СТАТИСТИКА (временно скрыта) -->
    <section v-if="false" class="container-x mt-28">
      <div class="glass grid grid-cols-3 divide-x divide-line rounded-4xl">
        <div v-for="s in stats" :key="s.label" class="p-4 text-center sm:p-10">
          <div class="h-display text-3xl sm:text-7xl">{{ s.value }}+</div>
          <div class="mt-2 text-xs text-white/70 sm:text-sm">{{ s.label }}</div>
        </div>
      </div>
    </section>
  </div>
</template>
