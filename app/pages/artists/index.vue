<script setup lang="ts">
// Раздел артистов временно скрыт: любой адрес /artists ведёт на главную (302 - временно).
// Чтобы вернуть: убрать редирект и раскомментировать импорт и шаблон
// import { ArtistsPage } from '@pages/artists'
await navigateTo('/', { redirectCode: 302, replace: true })
</script>

<template>
  <!-- <ArtistsPage /> -->
  <div />
</template>
