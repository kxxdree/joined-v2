<script setup lang="ts">
import background from "@shared/assets/images/background-hero.jpg";
import { grain } from "./grain";
</script>

<template>
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
    <!-- в файле сверху и снизу чёрные полосы (до 10,4% высоты, с тонкой светлой линией внутри): увеличение от центра в 1,28 раза уводит их за край при любой форме экрана -->
    <img :src="background" alt="" fetchpriority="high" decoding="async" class="absolute inset-0 h-full w-full scale-[1.28] object-cover" />

    <div class="absolute inset-0 bg-ink/30" />
    <div class="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_40%,rgb(22_19_22/0.6)_100%)]" />

    <div class="absolute inset-0 opacity-[0.12] mix-blend-overlay" :style="{ backgroundImage: grain }" />
  </div>
</template>
