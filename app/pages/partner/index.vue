<script setup lang="ts">
import { PartnerPage } from '@pages/partner'

definePageMeta({ layout: 'dashboard', middleware: 'auth', roles: ['venue', 'admin'] })
</script>

<template>
  <PartnerPage />
</template>
