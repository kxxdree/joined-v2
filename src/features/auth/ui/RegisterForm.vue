<script setup lang="ts">
import { homeForRole, type Role, useSession } from '@entities/session'
import { isEmail } from '@shared/lib'
import { UiIcon } from '@shared/ui'

type PublicRole = Exclude<Role, 'admin'>

const route = useRoute()
const { login } = useSession()

const roles: { id: PublicRole; name: string; desc: string; icon: string }[] = [
  { id: 'user', name: 'Слушатель', desc: 'Брони и избранное', icon: 'user' },
  { id: 'venue', name: 'Заведение', desc: 'Афиша, меню, брони', icon: 'glass' },
  { id: 'artist', name: 'Музыкант', desc: 'Профиль группы, концерты', icon: 'music' },
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
</script>

<template>
  <div>
    <div class="mb-6 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Тип аккаунта">
      <button
        v-for="r in roles"
        :key="r.id"
        type="button"
        role="radio"
        :aria-checked="form.role === r.id"
        class="flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors duration-300"
        :class="form.role === r.id
          ? 'border-accent bg-accent/10'
          : 'border-transparent bg-white/10 hover:bg-white/15'"
        @click="form.role = r.id"
      >
        <UiIcon :name="r.icon" :class="form.role === r.id ? 'text-accent-text' : 'text-muted'" />
        <span class="text-sm font-medium">{{ r.name }}</span>
        <span class="hidden text-xs text-muted sm:block">{{ r.desc }}</span>
      </button>
    </div>

    <form class="grid gap-4" novalidate @submit.prevent="submit">
      <label>
        <span class="label">{{ nameLabel }}</span>
        <input v-model="form.name" class="field" autocomplete="name">
      </label>
      <label>
        <span class="label">Email</span>
        <input v-model="form.email" type="email" autocomplete="email" class="field" placeholder="sample@gmail.com">
      </label>
      <label>
        <span class="label">Пароль</span>
        <input v-model="form.password" type="password" autocomplete="new-password" class="field" placeholder="Минимум 6 символов">
      </label>
      <label class="flex items-start gap-3 text-sm text-soft">
        <input v-model="form.agree" type="checkbox" class="mt-0.5 size-4 accent-accent">
        <span>Принимаю <NuxtLink to="/rules" class="text-white underline-offset-2 hover:underline">условия сервиса</NuxtLink> и политику конфиденциальности</span>
      </label>
      <p v-if="form.role !== 'user'" class="flex items-start gap-2 text-xs text-muted">
        <UiIcon name="clock" :size="14" class="mt-px shrink-0 text-accent-text" />
        <span>Профиль {{ form.role === 'venue' ? 'заведения' : 'группы' }} появится в каталоге после модерации - обычно это занимает до 24 часов.</span>
      </p>
      <p v-if="error" class="text-sm text-accent-text">{{ error }}</p>
      <button class="btn-primary mt-2 py-3.5" type="submit">Создать аккаунт</button>
    </form>
  </div>
</template>
