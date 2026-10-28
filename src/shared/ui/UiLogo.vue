<script setup lang="ts">
withDefaults(defineProps<{ to?: string; mark?: boolean }>(), { to: '/', mark: false })
</script>

<template>
  <NuxtLink :to="to" class="inline-flex items-center gap-2.5 text-white" aria-label="Joined - на главную">
    <svg width="34" height="22" viewBox="0 0 34 22" fill="none" aria-hidden="true" class="drop-shadow-[0_2px_10px_rgb(255_109_41/0.6)]">
      <defs>
        <linearGradient id="logo-o" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffa77d" />
          <stop offset="1" stop-color="#ff6d29" />
        </linearGradient>
      </defs>
      <path d="M13 3h7.5a8 8 0 0 1 0 16H17" stroke="currentColor" stroke-width="4.2" stroke-linecap="round" />
      <path d="M21 19h-7.5a8 8 0 0 1 0-16H17" stroke="url(#logo-o)" stroke-width="4.2" stroke-linecap="round" />
    </svg>
    <span v-if="!mark" class="text-xl font-semibold tracking-tight">JOINED</span>
  </NuxtLink>
</template>
