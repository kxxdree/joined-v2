<script setup lang="ts">
import background from "../assets/images/background.jpg";
import { grain } from "./grain";
</script>

<template>
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
    <img :src="background" alt="" fetchpriority="high" decoding="async" class="absolute inset-0 h-full w-full object-cover" />

    <div class="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_40%,rgb(12_9_10/0.6)_100%)]" />

    <div class="absolute inset-0 opacity-[0.12] mix-blend-overlay" :style="{ backgroundImage: grain }" />
  </div>
</template>
