<script setup lang="ts">
import { useSession } from '@entities/session'
import { VenueEditor } from '@features/manage-venue'

const { user } = useSession()
useHead({ title: 'Кабинет заведения — Joined' })
</script>

<template>
  <VenueEditor v-if="user?.venueSlug" :key="user.venueSlug" :slug="user.venueSlug" />
  <div v-else class="container-x py-10 sm:py-14">
    <div class="card p-8">
      <h1 class="text-2xl">Заведение не привязано к аккаунту</h1>
      <p class="mt-3 text-muted">Войдите заново. Если заведение по-прежнему недоступно, обратитесь в поддержку.</p>
    </div>
  </div>
</template>
