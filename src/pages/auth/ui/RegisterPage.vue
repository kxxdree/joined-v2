<script setup lang="ts">
import { RegisterForm } from "@features/auth";
import background from "@shared/assets/images/background-login.jpg";
import AuthShell from "./AuthShell.vue";

useHead({ title: "Регистрация - Joined" });
</script>

<template>
  <AuthShell :background="background" title="Присоединяйся" subtitle="Зарегистрируйся, чтобы следить за любимыми местами и артистами">
    <RegisterForm />
  </AuthShell>
</template>
