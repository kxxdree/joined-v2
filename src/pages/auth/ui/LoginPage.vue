<script setup lang="ts">
import { LoginForm } from '@features/auth'
import background from '@shared/assets/images/background-auth.jpg'
import AuthShell from './AuthShell.vue'

useHead({ title: 'Вход - Joined' })
</script>

<template>
  <AuthShell :background="background" title="С возвращением" subtitle="">
    <LoginForm />
  </AuthShell>
</template>
