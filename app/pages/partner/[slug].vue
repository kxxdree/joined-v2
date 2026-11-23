<script setup lang="ts">
import { VenueEditor } from '@features/manage-venue'

const route = useRoute()
definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['venue', 'admin'] })
</script>

<template>
  <VenueEditor :key="String(route.params.slug)" :slug="String(route.params.slug)" />
</template>
