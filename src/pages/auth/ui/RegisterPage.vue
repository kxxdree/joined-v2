<script setup lang="ts">
import { RegisterForm } from '@features/auth'
import background from '@shared/assets/images/background-login.jpg'
import AuthShell from './AuthShell.vue'

useHead({ title: 'Регистрация - Joined' })
</script>

<template>
  <AuthShell :background="background" title="Присоединяйтесь" subtitle="Зарегистрируйтесь, чтобы следить за любимыми местами и группами">
    <!-- переход ко входу - переключатель в шапке карточки -->
    <RegisterForm />
  </AuthShell>
</template>
