<script setup lang="ts">
import { homeForRole, type Role, useSession } from '@entities/session'
import { isEmail } from '@shared/lib'
import { UiIcon } from '@shared/ui'

const route = useRoute()
const { login } = useSession()
const form = reactive({ email: '', password: '' })
const error = ref('')

const go = (role: Role) => navigateTo(route.query.redirect ? String(route.query.redirect) : homeForRole(role))

const submit = () => {
  if (!isEmail(form.email)) return (error.value = 'Введите корректный email')
  if (form.password.length < 6) return (error.value = 'Пароль - минимум 6 символов')
  // демо: роль угадываем по началу email
  const role: Role = form.email.startsWith('admin') ? 'admin' : form.email.startsWith('bar') ? 'venue' : form.email.startsWith('band') ? 'artist' : 'user'
  login({ email: form.email, role })
  go(role)
}

const demo: { role: Role; label: string; email: string; name: string }[] = [
  { role: 'user', label: 'Гость', email: 'alex@joined.ru', name: 'Алекс' },
  { role: 'venue', label: 'Бар', email: 'bar@redvelvet.ru', name: 'Red Velvet' },
  { role: 'artist', label: 'Группа', email: 'band@orangesunset.ru', name: 'Orange Sunset' },
  { role: 'admin', label: 'Админ', email: 'admin@joined.ru', name: 'Админ' },
]
const demoLogin = (d: typeof demo[number]) => {
  login({ email: d.email, name: d.name, role: d.role })
  go(d.role)
}

// поле и вариант демо-входа - одна и та же стеклянная строка, как варианты ответа в онбординге
const row = 'flex h-14 items-center gap-3 rounded-2xl bg-black/10 px-4 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-1px_0_rgb(0_0_0/0.25)] transition-colors'
</script>

<template>
  <div>
    <form class="grid gap-2.5" novalidate @submit.prevent="submit">
      <label :class="row" class="focus-within:bg-black/20 focus-within:ring-white/25">
        <UiIcon name="user" :size="18" class="shrink-0 text-white/60" />
        <input v-model="form.email" type="email" autocomplete="email" class="w-full bg-transparent text-sm placeholder:text-white/50" placeholder="Email" aria-label="Email">
      </label>
      <label :class="row" class="focus-within:bg-black/20 focus-within:ring-white/25">
        <UiIcon name="lock" :size="18" class="shrink-0 text-white/60" />
        <input v-model="form.password" type="password" autocomplete="current-password" class="w-full bg-transparent text-sm placeholder:text-white/50" placeholder="Пароль" aria-label="Пароль">
      </label>
      <p v-if="error" class="px-1 text-sm text-accent-text">{{ error }}</p>
      <!-- главная кнопка - белая пилюля -->
      <button class="mt-4 h-14 rounded-full bg-linear-to-b from-white to-[#f1ece9] text-sm font-semibold text-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.08),0_12px_30px_-12px_rgb(0_0_0/0.6)] transition-[filter] hover:brightness-95" type="submit">Войти</button>
    </form>

    <div class="my-7 flex items-center gap-4 text-xs text-white/50">
      <div class="h-px flex-1 bg-white/10" /> или демо-вход <div class="h-px flex-1 bg-white/10" />
    </div>
    <div class="grid grid-cols-2 gap-2.5">
      <button v-for="d in demo" :key="d.role" type="button" :class="row" class="justify-center text-sm hover:bg-black/25" @click="demoLogin(d)">
        {{ d.label }}
      </button>
    </div>
  </div>
</template>
