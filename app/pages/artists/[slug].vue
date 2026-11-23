<script setup lang="ts">
// Раздел артистов временно скрыт: любой адрес /artists ведёт на главную (302 - временно).
// Чтобы вернуть: убрать редирект и раскомментировать импорт и шаблон
// import { ArtistPage } from '@pages/artist'
await navigateTo('/', { redirectCode: 302, replace: true })
</script>

<template>
  <!-- <ArtistPage /> -->
  <div />
</template>
