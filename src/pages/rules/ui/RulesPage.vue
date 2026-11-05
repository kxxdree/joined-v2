<script setup lang="ts">
import { UiPageHead } from "@shared/ui";

useHead({ title: "Условия сервиса - Joined" });

const sections = [
  {
    id: "terms",
    title: "Условия использования",
    items: [
      "Joined - агрегатор баров и музыкальных событий. Брони оформляются от имени заведений.",
      "Бронировать столики могут только авторизованные пользователи старше 18 лет.",
      "Организатор вправе изменить программу события; о существенных изменениях мы сообщаем по email и push.",
    ],
  },
  {
    id: "refunds",
    title: "Отмена брони",
    items: [
      "Бронь можно отменить в личном кабинете.",
      "При отмене события заведением бронь отменяется, а депозит возвращается полностью.",
      "Депозит за бронь возвращается при отмене не позднее чем за 24 часа до визита.",
    ],
  },
  {
    id: "privacy",
    title: "Конфиденциальность",
    items: [
      "Мы храним только данные, необходимые для оформления броней.",
      "Заведение получает имя и телефон гостя только для подтверждения брони.",
      "Вы можете удалить аккаунт и все связанные данные в любой момент.",
    ],
  },
];
</script>

<template>
  <section class="container-x">
    <UiPageHead title="Условия" caption="Сервис, брони и данные" />

    <!-- Текстовая страница: узкая колонка от левого края. scroll-mt - чтобы якорь из футера не прятался под шапку -->
    <div class="mt-6 grid max-w-3xl gap-10">
      <div v-for="s in sections" :id="s.id" :key="s.id" class="scroll-mt-24">
        <h2 class="mono-cap mb-1">{{ s.title }}</h2>
        <ol>
          <li v-for="(t, i) in s.items" :key="t" class="hair-row flex items-baseline gap-4">
            <span class="shrink-0 font-mono text-xs text-white/50 tabular-nums">{{ String(i + 1).padStart(2, "0") }}</span>
            <p class="min-w-0 text-sm sm:text-base">{{ t }}</p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
