<script setup lang="ts">
import { type Role, useSession } from '@entities/session'
import { isEmail } from '@shared/lib'

type PublicRole = Exclude<Role, 'admin'>

const route = useRoute()
const { login } = useSession()

const roles: { id: PublicRole; name: string }[] = [
  { id: 'user', name: 'Слушатель' },
  { id: 'venue', name: 'Заведение' },
  { id: 'artist', name: 'Музыкант' },
]

const form = reactive({
  role: (roles.find(r => r.id === route.query.role)?.id ?? 'user') as PublicRole,
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
    <!-- Тип аккаунта: общий сегментный переключатель -->
    <div class="segmented mb-5 w-full [&>button]:px-1 [&>button]:text-xs min-[360px]:[&>button]:text-sm" role="group" aria-label="Тип аккаунта">
      <button v-for="r in roles" :key="r.id" type="button" :aria-pressed="form.role === r.id" @click="form.role = r.id">{{ r.name }}</button>
    </div>

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
