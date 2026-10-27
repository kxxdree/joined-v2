<script setup lang="ts">
import { UiIcon } from "@shared/ui";

useHead({ title: "О нас - Joined", meta: [{ name: "description", content: "Joined - бары, концерты и джем-сейшены твоего города в одном месте" }] });

// Для кого сервис: у каждой аудитории - своя польза и свой следующий шаг
const audiences = [
  {
    eyebrow: "Гостям",
    title: "Найти свой звук",
    text: "Бары и сцены по жанрам, афиша на каждый вечер и брони столиков в пару кликов.",
    to: "/venues",
    cta: "Смотреть места",
  },
  {
    eyebrow: "Заведениям",
    title: "Собрать зал",
    text: "Профиль с меню и галереей, расписание выступлений и входящие брони - в одном кабинете.",
    to: "/register?role=venue",
    cta: "Подключить заведение",
  },
  {
    eyebrow: "Музыкантам",
    title: "Выйти на сцену",
    text: "Страница коллектива, концерты на площадках города и слушатели, которые ищут именно ваш жанр.",
    to: "/register?role=artist",
    cta: "Добавить группу",
  },
];

const steps = [
  "Заведения и музыканты публикуют события - каждое проходит модерацию.",
  "Гость выбирает город и жанр и видит, где сегодня играет живая музыка.",
  "Бронь оформляется сразу на сайте, без звонков и переписок.",
  "В личном кабинете - брони, история посещений и избранные места.",
];
</script>

<template>
  <section class="container-x max-w-5xl pt-12 sm:pt-20">
    <p class="text-xs font-medium tracking-[0.2em] text-accent-text uppercase">О нас</p>
    <h1 class="h-display mt-4 text-[13vw] sm:text-8xl">Музыка рядом</h1>
    <p class="mt-6 max-w-2xl text-white/80 sm:text-lg">
      Joined - агрегатор баров и музыкальных событий. Мы собираем в одном месте площадки с живой музыкой, их афишу и
      артистов, чтобы найти вечер под настроение было так же просто, как выбрать трек.
    </p>

    <!-- Для кого: три колонки встык, как сетки карточек на сайте -->
    <div class="mt-16 grid sm:grid-cols-3">
      <div v-for="a in audiences" :key="a.eyebrow" class="card flex flex-col rounded-none p-6 sm:p-8">
        <p class="text-xs font-semibold tracking-wider text-accent-text uppercase">{{ a.eyebrow }}</p>
        <h2 class="h-display mt-3 text-3xl uppercase">{{ a.title }}</h2>
        <p class="mt-4 flex-1 text-sm leading-relaxed text-soft">{{ a.text }}</p>
        <NuxtLink :to="a.to" class="group mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-sand">
          {{ a.cta }} <UiIcon name="arrow-right" :size="16" class="transition-transform group-hover:translate-x-0.5" />
        </NuxtLink>
      </div>
    </div>

    <!-- Как это работает: нумерованный список, как разделы «Условий» -->
    <div class="card mt-6 p-6 sm:p-10">
      <h2 class="h-display mb-6 text-3xl sm:text-5xl">Как это работает</h2>
      <ol>
        <li v-for="(s, i) in steps" :key="s" class="flex items-baseline gap-6 border-b border-line py-3.5 last:border-b-0">
          <span class="shrink-0 text-xs text-muted tabular-nums">{{ String(i + 1).padStart(2, "0") }}</span>
          <p class="min-w-0 text-base">{{ s }}</p>
        </li>
      </ol>
    </div>

    <!-- Контакты -->
    <div class="card mt-6 flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
      <div>
        <h2 class="h-display text-3xl sm:text-5xl">На связи</h2>
        <p class="mt-3 text-soft">Вопросы, партнёрство и предложения - пишите, ответим в течение дня.</p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row">
        <a href="mailto:hello@joined.ru" class="btn-primary py-3.5">hello@joined.ru</a>
        <NuxtLink to="/rules" class="btn-dark py-3.5">Условия сервиса</NuxtLink>
      </div>
    </div>
  </section>
</template>
