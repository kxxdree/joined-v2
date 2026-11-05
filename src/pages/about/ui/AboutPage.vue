<script setup lang="ts">
import { UiIcon, UiPageHead } from "@shared/ui";

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
  <section class="container-x">
    <UiPageHead title="О нас" caption="Места и музыка твоего города" />

    <!-- Текстовая страница: узкая колонка от левого края, разделы - подпись и строки с тонкой линией -->
    <div class="mt-6 grid max-w-3xl gap-10">
      <p class="text-base leading-relaxed text-soft sm:text-lg">
        Joined - агрегатор баров и музыкальных событий. Мы собираем в одном месте площадки с живой музыкой, их афишу и
        артистов, чтобы найти вечер под настроение было так же просто, как выбрать трек.
      </p>

      <div>
        <h2 class="mono-cap mb-1">Для кого</h2>
        <ul>
          <li v-for="a in audiences" :key="a.eyebrow" class="hair-row flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div class="min-w-0">
              <p class="font-medium">{{ a.eyebrow }}: {{ a.title.toLowerCase() }}</p>
              <p class="mt-1 text-sm leading-relaxed text-soft">{{ a.text }}</p>
            </div>
            <NuxtLink :to="a.to" class="group inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors hover:text-sand">
              {{ a.cta }} <UiIcon name="arrow-right" :size="16" class="transition-transform group-hover:translate-x-0.5" />
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div>
        <h2 class="mono-cap mb-1">Как это работает</h2>
        <ol>
          <li v-for="(s, i) in steps" :key="s" class="hair-row flex items-baseline gap-4">
            <span class="shrink-0 font-mono text-xs text-white/50 tabular-nums">{{ String(i + 1).padStart(2, "0") }}</span>
            <p class="min-w-0 text-sm sm:text-base">{{ s }}</p>
          </li>
        </ol>
      </div>

      <div>
        <h2 class="mono-cap mb-3">На связи</h2>
        <p class="text-sm text-soft sm:text-base">Вопросы, партнёрство и предложения - пишите, ответим в течение дня.</p>
        <div class="mt-4 grid gap-2 sm:flex">
          <a href="mailto:hello@joined.ru" class="btn-primary h-12">hello@joined.ru</a>
          <NuxtLink to="/rules" class="btn-dark h-12">Условия сервиса</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
