<script setup lang="ts">
import { LoginForm } from '@features/auth'
import AuthShell from './AuthShell.vue'

useHead({ title: 'Вход - Joined' })
</script>

<template>
  <AuthShell title="С возвращением" subtitle="Войдите, чтобы бронировать столики и следить за любимыми группами.">
    <LoginForm />
    <p class="mt-8 text-center text-sm text-muted">
      Нет аккаунта? <NuxtLink to="/register" class="text-white hover:text-sand">Зарегистрироваться</NuxtLink>
    </p>
  </AuthShell>
</template>
