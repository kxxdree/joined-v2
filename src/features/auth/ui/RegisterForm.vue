<script setup lang="ts">
import { type Role, useSession } from '@entities/session'
import { isEmail } from '@shared/lib'

type PublicRole = Exclude<Role, 'admin'>

const route = useRoute()
const { login } = useSession()

// Публично - только регистрация слушателя. Заведение регистрируется по прямой ссылке /register?role=venue
// (позже - персональная ссылка-приглашение с кодом). Музыканты временно закрыты вместе с разделом артистов
const linkRoles: PublicRole[] = ['venue']
const linkRole = linkRoles.find(r => r === route.query.role)

const form = reactive({
  role: (linkRole ?? 'user') as PublicRole,
  name: '',
  email: '',
  password: '',
  agree: false,
})
const error = ref('')
const nameLabel = computed(() => ({ user: 'Имя', venue: 'Название заведения', artist: 'Название группы' })[form.role])

const submit = () => {
  if (form.name.trim().length < 2) return (error.value = `Заполните поле «${nameLabel.value}»`)
  if (!isEmail(form.email)) return (error.value = 'Введите корректный email')
  if (form.password.length < 6) return (error.value = 'Пароль - минимум 6 символов')
  if (!form.agree) return (error.value = 'Нужно согласиться с условиями сервиса')
  login({ email: form.email, name: form.name.trim(), role: form.role })
  navigateTo('/') // после регистрации - на главную
}
</script>

<template>
  <div>
    <!-- Переключателя типа нет: по ссылке для заведений - пометка, что это регистрация заведения -->
    <p v-if="form.role === 'venue'" class="mb-5 text-sm text-accent-text">Регистрация заведения</p>

    <form class="grid gap-2.5" novalidate @submit.prevent="submit">
      <input v-model="form.name" autocomplete="name" class="field" :placeholder="nameLabel" :aria-label="nameLabel">
      <input v-model="form.email" type="email" autocomplete="email" class="field" placeholder="Email" aria-label="Email">
      <input v-model="form.password" type="password" autocomplete="new-password" class="field" placeholder="Пароль, минимум 6 символов" aria-label="Пароль">

      <label class="mt-2 flex items-start gap-3 px-1 text-sm text-soft">
        <input v-model="form.agree" type="checkbox" class="mt-0.5 size-4 accent-white">
        <span>Принимаю <NuxtLink to="/rules" class="text-white underline-offset-2 hover:underline">условия сервиса</NuxtLink> и политику конфиденциальности</span>
      </label>
      <p v-if="error" class="px-1 text-sm text-accent-text">{{ error }}</p>
      <button class="btn-primary mt-4 h-12" type="submit">Создать аккаунт</button>
    </form>
  </div>
</template>
