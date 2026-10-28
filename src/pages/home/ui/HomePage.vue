<script setup lang="ts">
import { artists } from "@entities/artist";
import { events } from "@entities/event";
import { venues } from "@entities/venue";
import { CitySelect } from "@features/select-city";
import { type GenreId, genres } from "@shared/config";
import { UiBackdrop, UiIcon, UiSelect } from "@shared/ui";

useHead({ title: "JOINED" });

const genre = ref<GenreId | "">("");

const search = () => navigateTo({ path: "/venues", query: { genre: genre.value || undefined } });

// кнопки-триггеры селектов превращаются в подчёркнутые слова фразы: шрифт, размер и регистр - от фразы, без иконок и отступов;
// overflow-visible у текста внутри - иначе обрезка (truncate) срезает подчёркивание
// (модалки выбора телепортированы в body, на них [&_svg]:hidden не действует)
const phraseWord =
  "[&>button]:h-auto [&>button]:gap-0 [&>button]:p-0 [&>button]:text-[length:inherit] [&>button]:text-white [&>button]:uppercase [&_span]:overflow-visible [&>button]:underline [&>button]:decoration-white/40 [&>button]:underline-offset-[5px] [&>button:hover]:decoration-white [&_svg]:hidden";

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
      <!-- Минималистичный логотип-подпись по центру фото: название + мелкая моноширинная подпись в две строки -->
      <div class="container-x my-auto flex flex-col items-center py-14">
        <h1 class="flex items-center gap-4 sm:gap-6">
          <span class="text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Joined</span>
          <span class="font-mono text-[10px] leading-snug tracking-[0.14em] text-white/85 uppercase sm:text-xs">Места и музыка<br />твоего города</span>
        </h1>

        <!-- Поиск-фраза тем же моноширинным шрифтом: «Ищу [жанр] в городе [город] →».
             Жанр и город - подчёркнутые слова, выбор в стеклянных модалках; стрелка ведёт на «Бары и сцены» -->
        <form class="mt-8 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 font-mono text-[11px] tracking-[0.14em] text-white/80 uppercase [text-shadow:0_1px_12px_rgb(0_0_0/0.7)] sm:text-xs" @submit.prevent="search">
          <span>Ищу</span>
          <UiSelect v-model="genre" :options="genres" all-label="Любой жанр" label="Жанр" inline modal :class="[phraseWord, '[&>button]:w-auto']" />
          <span>в городе</span>
          <CitySelect inline modal :class="phraseWord" />
          <button type="submit" class="ml-1 grid size-8 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-white/85" aria-label="Найти места">
            <UiIcon name="arrow-right" :size="16" />
          </button>
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
