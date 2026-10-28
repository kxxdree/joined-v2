<script setup lang="ts">
// Отдельной страницы события больше нет: старые ссылки (билеты, соцсети) ведут в афишу, где событие открывается в историях
const route = useRoute()
await navigateTo({ path: '/events', query: { event: String(route.params.id) } }, { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
