<script setup lang="ts">
import { useSession } from '@entities/session'
import { UiIcon, UiLogo } from '@shared/ui'

const { user, logout } = useSession()
const route = useRoute()
const open = ref(false)
const scrolled = ref(false)

const links = [
  { to: '/', label: 'Главная' },
  { to: '/venues', label: 'Места' },
  { to: '/events', label: 'Афиша' },
  { to: '/artists', label: 'Артисты' },
]

const cabinet = computed(() => {
  if (!user.value) return null
  if (user.value.role === 'admin') return { to: '/admin', label: 'Админ-панель' }
  if (user.value.role === 'venue' || user.value.role === 'artist') return { to: '/partner', label: 'Кабинет партнёра' }
  return null
})

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

const onScroll = () => { scrolled.value = window.scrollY > 12 }
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(() => route.fullPath, () => { open.value = false })
watch(open, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <header class="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
    <!-- Плавающая стеклянная капсула -->
    <div
      class="glass lg-refract mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-3xl pr-3 pl-5 transition-[box-shadow,background] duration-500 [--lg-refract-blur:14px] sm:pl-6"
      :class="scrolled ? '[--lg-tint:rgb(22_19_22/0.66)]' : '[--lg-tint:rgb(22_19_22/0.42)]'"
    >
      <UiLogo class="transition-opacity duration-300 hover:opacity-70" />

      <nav class="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="pill"
          :class="isActive(l.to) ? 'pill-active' : 'bg-transparent text-soft hover:bg-white/10 hover:text-white'"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <template v-if="user">
          <NuxtLink v-if="cabinet" :to="cabinet.to" class="btn-ghost">{{ cabinet.label }}</NuxtLink>
          <NuxtLink to="/account" class="btn-dark py-2 pl-2">
            <span class="grid size-7 place-items-center rounded-full rim [background:var(--accent-fill)] [box-shadow:var(--accent-shadow)] text-[var(--accent-ink)] text-xs font-semibold uppercase [--lg-rim:var(--lg-rim-warm)]">{{ user.name[0] }}</span>
            {{ user.name }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn-ghost">Войти</NuxtLink>
          <NuxtLink to="/register" class="btn-primary">Начать</NuxtLink>
        </template>
      </div>

      <button class="btn-icon md:hidden" :aria-expanded="open" aria-label="Меню" @click="open = !open">
        <UiIcon :name="open ? 'x' : 'menu'" :size="22" />
      </button>
    </div>

    <!-- Подложка под мобильным меню: затемняет экран, тап вне меню закрывает его -->
    <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-200" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm md:hidden" aria-hidden="true" @click="open = false" />
    </Transition>

    <!-- Мобильное меню: стеклянный лист -->
    <Transition
      enter-active-class="transition duration-400 ease-[var(--ease-liquid)]"
      enter-from-class="opacity-0 -translate-y-3 scale-[0.98]"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="open" class="glass-strong fixed inset-x-3 top-[5.25rem] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-[2rem] p-3 md:hidden">
        <nav class="flex flex-col">
          <NuxtLink
            v-for="l in [...links, ...(cabinet ? [cabinet] : [])]"
            :key="l.to"
            :to="l.to"
            class="flex items-center rounded-lg px-4 py-3.5 text-xl font-medium tracking-tight transition-colors"
            :class="isActive(l.to) ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10'"
          >
            {{ l.label }}
          </NuxtLink>

          <div class="mt-6 flex flex-col gap-2 px-1 pb-1">
            <template v-if="user">
              <NuxtLink to="/account" class="btn-primary py-4">Личный кабинет</NuxtLink>
              <button class="btn-dark py-4" @click="logout()">Выйти</button>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn-primary py-4">Войти</NuxtLink>
              <NuxtLink to="/register" class="btn-dark py-4">Регистрация</NuxtLink>
            </template>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>
