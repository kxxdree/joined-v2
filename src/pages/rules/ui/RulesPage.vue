<script setup lang="ts">
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
  <section class="container-x max-w-4xl pt-12 sm:pt-20">
    <h1 class="h-display text-[14vw] sm:text-8xl">Условия</h1>
    <div class="mt-12 grid grid-cols-1 gap-6">
      <!-- Разделы оформлены как меню заведения: карточка-список -->
      <div v-for="s in sections" :id="s.id" :key="s.id" class="card min-w-0 scroll-mt-28 p-6 sm:p-10">
        <!-- на мобильных мельче: длинные слова («Конфиденциальность») не влезают в 36px -->
        <h2 class="h-display mb-6 text-2xl wrap-break-word sm:text-5xl">{{ s.title }}</h2>
        <ol>
          <li v-for="(t, i) in s.items" :key="t" class="flex items-baseline gap-6 border-b border-line py-3.5 last:border-b-0">
            <span class="shrink-0 text-xs text-muted tabular-nums">{{ String(i + 1).padStart(2, "0") }}</span>
            <p class="min-w-0 text-base">{{ t }}</p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
