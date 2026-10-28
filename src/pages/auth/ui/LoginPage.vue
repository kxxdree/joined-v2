<script setup lang="ts">
import { LoginForm } from '@features/auth'
import background from '@shared/assets/images/background-login.jpg'
import AuthShell from './AuthShell.vue'

useHead({ title: 'Вход - Joined' })
</script>

<template>
  <AuthShell :background="background" title="С возвращением" subtitle="Войдите, чтобы бронировать столики и следить за любимыми группами.">
    <!-- переход к регистрации - переключатель в шапке карточки -->
    <LoginForm />
  </AuthShell>
</template>
