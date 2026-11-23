<script setup lang="ts">
import background from "@shared/assets/images/background-texture.jpg";
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-ink transform-[translateZ(0)]" aria-hidden="true">
    <img :src="background" alt="" decoding="async" class="page-texture absolute inset-0 h-full w-full object-cover" />
  </div>
</template>

<style scoped>
@media (orientation: landscape) {
  .page-texture {
    inset: 50% auto auto 50%;
    width: 100dvh;
    height: 100vw;
    max-width: none;
    transform: translate(-50%, -50%) rotate(90deg);
  }
}
</style>
