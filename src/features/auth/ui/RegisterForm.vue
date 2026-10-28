<script setup lang="ts">
import { homeForRole, type Role, useSession } from '@entities/session'
import { isEmail } from '@shared/lib'
import { UiIcon } from '@shared/ui'

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
  navigateTo(homeForRole(form.role))
}

// поле - стеклянная строка, как на странице входа
const row = 'flex h-14 items-center gap-3 rounded-2xl bg-black/10 px-4 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.25)] transition-colors focus-within:bg-black/20 focus-within:ring-white/25'
</script>

<template>
  <div>
    <!-- Тип аккаунта: минималистичный переключатель-пилюля, как «Вход | Регистрация» в шапке карточки -->
    <div class="mb-5 grid grid-cols-3 rounded-full bg-black/25 p-1 text-xs font-semibold" role="radiogroup" aria-label="Тип аккаунта">
      <button
        v-for="r in roles"
        :key="r.id"
        type="button"
        role="radio"
        :aria-checked="form.role === r.id"
        class="rounded-full px-2 py-2.5 transition-colors"
        :class="form.role === r.id ? 'bg-white text-ink' : 'text-white/70 hover:text-white'"
        @click="form.role = r.id"
      >
        {{ r.name }}
      </button>
    </div>

    <form class="grid gap-2.5" novalidate @submit.prevent="submit">
      <label :class="row">
        <UiIcon name="edit" :size="18" class="shrink-0 text-white/60" />
        <input v-model="form.name" autocomplete="name" class="w-full bg-transparent text-sm placeholder:text-white/50" :placeholder="nameLabel" :aria-label="nameLabel">
      </label>
      <label :class="row">
        <UiIcon name="user" :size="18" class="shrink-0 text-white/60" />
        <input v-model="form.email" type="email" autocomplete="email" class="w-full bg-transparent text-sm placeholder:text-white/50" placeholder="Email" aria-label="Email">
      </label>
      <label :class="row">
        <UiIcon name="lock" :size="18" class="shrink-0 text-white/60" />
        <input v-model="form.password" type="password" autocomplete="new-password" class="w-full bg-transparent text-sm placeholder:text-white/50" placeholder="Пароль, минимум 6 символов" aria-label="Пароль">
      </label>

      <label class="mt-2 flex items-start gap-3 px-1 text-sm text-soft">
        <input v-model="form.agree" type="checkbox" class="mt-0.5 size-4 accent-white">
        <span>Принимаю <NuxtLink to="/rules" class="text-white underline-offset-2 hover:underline">условия сервиса</NuxtLink> и политику конфиденциальности</span>
      </label>
      <p v-if="error" class="px-1 text-sm text-accent-text">{{ error }}</p>
      <!-- главная кнопка - белая пилюля -->
      <button class="mt-4 h-14 rounded-full bg-linear-to-b from-white to-[#f1ece9] text-sm font-semibold text-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.08),0_12px_30px_-12px_rgb(0_0_0/0.6)] transition-[filter] hover:brightness-95" type="submit">Создать аккаунт</button>
    </form>
  </div>
</template>
