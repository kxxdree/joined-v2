<script setup lang="ts">
// Отдельной страницы события больше нет: старые ссылки (билеты, соцсети) ведут в афишу
await navigateTo('/events', { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
