<script setup lang="ts">
import { HomePage } from '@pages/home'

// футер главной - строкой в первом экране, большой AppFooter не нужен
definePageMeta({ hideFooter: true })
</script>

<template>
  <HomePage />
</template>
