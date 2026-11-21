<script setup lang="ts">
import { useCurrentCity } from "@entities/city";
import { CitySelect } from "@features/select-city";
import backgroundArtists from "@shared/assets/images/background-welcome.jpg";
import backgroundTexture from "@shared/assets/images/background-texture.jpg";

useHead({ title: "Joined" });
const { city } = useCurrentCity();
</script>

<template>
  <section class="relative isolate -mt-19 flex min-h-svh flex-col bg-[#141315] pt-19 sm:-mt-20 sm:pt-20" aria-labelledby="home-title">
    <div class="absolute inset-y-0 right-[43%] left-0 -z-1 isolate hidden overflow-hidden md:block" aria-hidden="true">
      <img :src="backgroundTexture" alt="" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
    </div>
    <div class="absolute inset-0 -z-1 isolate overflow-hidden after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgb(20_19_21/0.2),rgb(20_19_21/0.65))] md:left-[57%] md:after:hidden" aria-hidden="true">
      <img :src="backgroundArtists" alt="" fetchpriority="high" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
    </div>

    <div class="mx-auto my-auto w-full max-w-[100rem] px-[clamp(1.5rem,4.5vw,5rem)] pt-20 pb-12 md:pt-[clamp(5rem,14vh,10rem)] md:pb-16">
      <div>
        <h1 id="home-title" class="font-display text-[clamp(2.4rem,9.8vw,4.6rem)] leading-[1.05] font-bold tracking-[-0.065em] uppercase md:text-[clamp(2rem,6.4vw,6.6rem)] md:text-center">JOINED</h1>
      </div>

      <div class="mt-8 grid grid-cols-1 items-end gap-12 md:mt-[clamp(2rem,4.5vh,3rem)] md:grid-cols-[57fr_43fr] md:gap-0">
        <div class="max-w-lg md:pr-8">
          <div class="text-[clamp(0.875rem,4.5vw,1.5rem)] leading-[1.6] whitespace-nowrap text-white/72 md:text-[clamp(1.1rem,1.8vw,1.5rem)]">
            Места и музыка
            <CitySelect inline modal class="inline-block align-baseline [&>button]:h-auto [&>button]:p-0 [&>button]:text-[length:inherit] [&>button]:leading-[inherit] [&>button]:text-inherit [&>button]:underline [&>button]:decoration-white/45 [&>button]:underline-offset-[0.2em] [&>button:hover]:text-sand [&>button:hover]:decoration-current">твоего города</CitySelect>
          </div>
          <p class="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.2] wrap:anywhere" aria-live="polite">{{ city.name }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <NuxtLink to="/venues" class="btn-primary min-h-14 min-w-36 px-7 py-3.5 text-base">
              Начать
            </NuxtLink>
            <NuxtLink to="/events" class="btn-dark min-h-14 min-w-36 px-7 py-3.5 text-base bg-[#222225] hover:bg-[#303033]">
              Афиша
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <footer class="mx-auto flex w-full max-w-[100rem] flex-wrap justify-between gap-x-8 gap-y-4 px-[clamp(1.5rem,4.5vw,5rem)] py-6 text-xs text-white/55 [&_a]:transition-colors [&_a]:duration-180 [&_a:hover]:text-sand">
      <span>© {{ new Date().getFullYear() }} Joined</span>
      <nav class="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Правовая информация">
        <NuxtLink to="/rules">Условия сервиса</NuxtLink>
        <NuxtLink to="/rules#privacy">Конфиденциальность</NuxtLink>
        <span>18+</span>
      </nav>
    </footer>
  </section>
</template>
