<script setup lang="ts">
import { UiIcon } from "@shared/ui";

const links = [
  { to: "/", label: "Главная" },
  { to: "/venues", label: "Места" },
  { to: "/events", label: "Афиша" },
  { to: "/about", label: "О нас" },
  { to: "mailto:hello@joined.ru?subject=Подключить заведение", label: "Для заведений" },
];
const legal = [
  { to: "/rules", label: "Условия сервиса" },
  { to: "/rules#privacy", label: "Конфиденциальность" },
];
const socials = [
  { icon: "telegram", label: "Telegram" },
  { icon: "instagram", label: "Instagram" },
  { icon: "vk", label: "VK" },
];
</script>

<template>
  <footer class="relative mt-24 px-3 pb-3 sm:mt-32 sm:px-6 sm:pb-6">
    <div class="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1a1718] [container-type:inline-size] sm:rounded-[2.5rem]">
      <div class="pointer-events-none absolute inset-0 -z-1 bg-[radial-gradient(ellipse_at_85%_120%,rgb(255_196_163/0.95)_0%,rgb(255_109_41/0.55)_30%,rgb(255_109_41/0.08)_55%,transparent_75%)]" aria-hidden="true" />

      <div class="flex flex-col justify-between gap-9 px-6 pt-8 sm:flex-row sm:gap-12 sm:px-10 sm:pt-10 lg:px-12 lg:pt-12">
        <nav aria-label="Навигация в подвале">
          <ul class="space-y-2.5 text-lg leading-relaxed sm:text-xl">
            <li v-for="link in links" :key="link.to">
              <NuxtLink :to="link.to" class="inline-block transition-colors hover:text-sand">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="flex flex-col items-start gap-4 sm:items-end sm:text-right">
          <div class="-ml-2 flex items-center gap-1 sm:-mr-2 sm:ml-0">
            <a v-for="social in socials" :key="social.icon" href="#" :aria-label="social.label" class="grid size-10 place-items-center text-white/90 transition-colors hover:text-sand"><UiIcon :name="social.icon" :size="22" /></a>
          </div>
          <a href="mailto:hello@joined.ru" class="text-sm text-soft transition-colors hover:text-sand sm:text-base">hello@joined.ru</a>
          <p class="max-w-64 text-sm leading-relaxed text-white/60">Места, сцены и музыка<br>в одном месте</p>
        </div>
      </div>

      <div class="relative mt-10 flex flex-col justify-between gap-4 px-6 text-[11px] leading-relaxed text-white/55 sm:mt-12 sm:flex-row sm:items-end sm:gap-8 sm:px-10 lg:px-12">
        <nav class="flex flex-wrap gap-x-5 gap-y-2" aria-label="Правовая информация">
          <NuxtLink v-for="link in legal" :key="link.to" :to="link.to" class="transition-colors hover:text-white">{{ link.label }}</NuxtLink>
        </nav>
        <span>© {{ new Date().getFullYear() }} Joined · 18+</span>
      </div>

      <div class="pointer-events-none mt-8 overflow-hidden px-4 pb-4 text-center select-none sm:mt-10 sm:px-8 sm:pb-5" aria-hidden="true">
        <span class="block bg-linear-to-b from-white/5 via-sand/25 to-sand/65 bg-clip-text font-display text-[18cqw] leading-[0.9] font-medium tracking-[-0.075em] text-transparent">JOINED</span>
      </div>
    </div>
  </footer>
</template>
