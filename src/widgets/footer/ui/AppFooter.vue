<script setup lang="ts">
import { UiIcon } from "@shared/ui";

// только то, чего нет в шапке
const links = [
  { to: "/about", label: "О нас" },
  // { to: "/register?role=venue", label: "Для заведений" },
  // { to: "/register?role=artist", label: "Для музыкантов" },
  { to: "/rules", label: "Условия" },
  { to: "/rules#privacy", label: "Конфиденциальность" },
];
const socials = [
  { icon: "telegram", label: "Telegram" },
  { icon: "instagram", label: "Instagram" },
  { icon: "vk", label: "VK" },
];
</script>

<template>
  <!-- Тонкая полоса под линией: название, ссылки и соцсети одной строкой; на телефоне ссылки переносятся вниз -->
  <footer class="container-x mt-20 sm:mt-28">
    <div class="border-t border-white/10 py-6">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <NuxtLink to="/" class="text-lg font-medium tracking-[-0.04em] hover:opacity-70" aria-label="Joined - на главную">Joined</NuxtLink>
        <nav class="order-last flex w-full flex-wrap gap-x-5 gap-y-1 text-sm text-white/70 lg:order-0 lg:w-auto" aria-label="Информация">
          <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="py-1 hover:text-white">{{ l.label }}</NuxtLink>
        </nav>
        <div class="-mr-2 flex items-center">
          <a v-for="s in socials" :key="s.icon" href="#" :aria-label="s.label" class="grid size-9 place-items-center text-white/70 hover:text-white"><UiIcon :name="s.icon" :size="18" /></a>
        </div>
      </div>
      <p class="mono-cap mt-4 flex justify-between gap-4">
        <span>© {{ new Date().getFullYear() }} Joined</span>
        <span>18+</span>
      </p>
    </div>
  </footer>
</template>
