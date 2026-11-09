<script setup lang="ts">
import background from "@shared/assets/images/bg-alternative.jpg";
import { grain } from "./grain";
</script>

<template>
  <!-- Общий фон всех страниц, кроме главной (bg-alternative), заметно затемнён - на страницах читаются текст и фото;
       + зерно; дают стеклу что размывать. Hero на главной перекрывает его своим более ярким UiBackdrop -->
  <div class="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-ink transform-[translateZ(0)]" aria-hidden="true">
    <!-- в файле сверху и снизу чёрные полосы (до 10% высоты): увеличение от центра в 1,28 раза уводит их за край при любой форме экрана -->
    <img :src="background" alt="" decoding="async" class="absolute inset-0 h-full w-full scale-[1.28] object-cover" />
    <div class="absolute inset-0 bg-ink/70" />
    <div class="absolute inset-0 opacity-[0.06] mix-blend-overlay" :style="{ backgroundImage: grain }" />
  </div>
</template>
