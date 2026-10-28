<script setup lang="ts">
import { grain } from "./grain";
</script>

<template>
  <!-- Общий фон сайта, как на брендбуке: тёплый почти чёрный (#161316), оранжевое свечение слева и коричневое (#453027) справа
       + зерно; дают стеклу что размывать. Hero на главной перекрывает его своим UiBackdrop -->
  <div class="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-ink [transform:translateZ(0)]" aria-hidden="true">
    <div class="absolute top-[10vh] -left-[25vw] size-[75vmax] rounded-full bg-[radial-gradient(closest-side,rgb(255_109_41/0.22),transparent)]" />
    <div class="absolute -right-[20vw] -bottom-[25vh] size-[80vmax] rounded-full bg-[radial-gradient(closest-side,rgb(69_48_39/0.55),transparent)]" />
    <div class="absolute top-1/2 left-2/3 size-[40vmax] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_125_60/0.06),transparent)]" />
    <div class="absolute inset-0 opacity-[0.06] mix-blend-overlay" :style="{ backgroundImage: grain }" />
  </div>
</template>
