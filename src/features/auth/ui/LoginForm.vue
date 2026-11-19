<script setup lang="ts">
import { type Role, useSession } from '@entities/session'
import { isEmail } from '@shared/lib'

const route = useRoute()
const { login } = useSession()
const form = reactive({ email: '', password: '' })
const error = ref('')

// после входа - на главную; если на вход отправила закрытая страница (?redirect=) - обратно на неё
const go = () => navigateTo(route.query.redirect ? String(route.query.redirect) : '/')

const submit = () => {
  if (!isEmail(form.email)) return (error.value = 'Введите корректный email')
  if (form.password.length < 6) return (error.value = 'Пароль - минимум 6 символов')
  // демо: роль угадываем по началу email
  const role: Role = form.email.startsWith('admin') ? 'admin' : form.email.startsWith('bar') ? 'venue' : form.email.startsWith('band') ? 'artist' : 'user'
  login({ email: form.email, role })
  go()
}

</script>

<template>
  <div>
    <form class="grid gap-2.5" novalidate @submit.prevent="submit">
      <input v-model="form.email" type="email" autocomplete="email" class="field" placeholder="Email" aria-label="Email">
      <input v-model="form.password" type="password" autocomplete="current-password" class="field" placeholder="Пароль" aria-label="Пароль">
      <p v-if="error" class="px-1 text-sm text-accent-text">{{ error }}</p>
      <button class="btn-primary mt-4 h-12" type="submit">Войти</button>
    </form>

  </div>
</template>
