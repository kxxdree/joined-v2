<script setup lang="ts">
import { UiIcon } from "@shared/ui";

/** background - фото на весь экран за карточкой (уходит под шапку, как hero на главной); без него - тёплое свечение */
defineProps<{ title: string; subtitle: string; background?: string }>();

const route = useRoute();
const modes = [
  { to: "/login", label: "Вход" },
  { to: "/register", label: "Регистрация" },
];
</script>

<template>
  <!-- Карточка из матового стекла по центру, как онбординг-окно: за ней тёплое свечение, чтобы стеклу было что размывать -->
  <section
    class="relative isolate grid place-items-center overflow-hidden px-4 py-10"
    :class="background ? '-mt-19 min-h-dvh pt-29 sm:-mt-20 sm:pt-30' : 'min-h-[calc(100dvh-6rem)]'"
  >
    <!-- фото: кадр по лицу, лёгкое затемнение под карточку и плавный переход в цвет страницы снизу -->
    <div v-if="background" class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <img :src="background" alt="" fetchpriority="high" decoding="async" class="absolute inset-0 h-full w-full object-cover object-[50%_30%]">
      <div class="absolute inset-0 bg-ink/40" />
      <div class="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-b from-transparent to-ink" />
    </div>
    <div v-else class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <div class="absolute top-1/2 left-1/2 size-[min(90vw,46rem)] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_109_41/0.55),rgb(255_196_163/0.18)_55%,transparent)]" />
      <div class="absolute top-[30%] left-[30%] size-[min(60vw,28rem)] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(69_48_39/0.9),transparent)]" />
    </div>

    <div class="glass glass-clear lg-refract w-full max-w-md rounded-[2.5rem] p-6 sm:p-8">
      <!-- Шапка: назад, переключатель «Вход | Регистрация», закрыть -->
      <div class="mb-8 flex items-center justify-between gap-3">
        <NuxtLink to="/" class="btn-icon size-9 bg-transparent" aria-label="Назад на главную"><UiIcon name="chevron-left" :size="20" /></NuxtLink>
        <nav class="flex rounded-full bg-black/25 p-1 text-xs font-semibold" aria-label="Вход или регистрация">
          <NuxtLink
            v-for="m in modes"
            :key="m.to"
            :to="m.to"
            class="rounded-full px-3 py-1.5 transition-colors"
            :class="route.path === m.to ? 'bg-white text-ink' : 'text-white/70 hover:text-white'"
          >
            {{ m.label }}
          </NuxtLink>
        </nav>
        <NuxtLink to="/" class="btn-icon size-9 bg-transparent" aria-label="Закрыть"><UiIcon name="x" :size="20" /></NuxtLink>
      </div>

      <!-- Заголовок градиентом белый → персик, как кремовый текст на стекле.
           Размер под самое длинное слово («Присоединяйтесь»): на телефоне и десктопе без переноса -->
      <h1 class="h-display text-liquid text-2xl leading-[1.05] wrap-break-word sm:text-[2rem]">{{ title }}</h1>
      <p class="mt-3 mb-8 text-sm text-soft">{{ subtitle }}</p>
      <slot />
    </div>
  </section>
</template>
