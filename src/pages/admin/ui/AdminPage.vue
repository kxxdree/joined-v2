<script setup lang="ts">
import { roleNames, type Role } from '@entities/session'
import { cities as baseCities } from '@entities/city'
import { drinks, formats, venues } from '@entities/venue'
import { genres } from '@shared/config'
import { formatPrice, ph, plural, useToast } from '@shared/lib'
import { UiBarChart, UiEmpty, UiIcon, UiPhoto, UiTabs, UiToggle } from '@shared/ui'

useHead({ title: 'Админ-панель - Joined' })

const { push } = useToast()

type Tab = 'overview' | 'cities' | 'moderation' | 'tags' | 'users' | 'payments'
const moderation = ref([
  { id: 'm1', kind: 'Заведение', name: 'Vinyl Room', city: 'Москва', author: 'vinyl@room.ru', photo: ph('vinyl,bar', 501), date: '2 ч назад' },
  { id: 'm2', kind: 'Группа', name: 'Северное сияние', city: 'Санкт-Петербург', author: 'band@aurora.ru', photo: ph('band', 502), date: '5 ч назад' },
  { id: 'm3', kind: 'Событие', name: 'Halloween Rock Party', city: 'Казань', author: 'bar@rnr.ru', photo: ph('halloween,party', 503), date: 'вчера' },
  { id: 'm4', kind: 'Событие', name: 'Ночь винила', city: 'Москва', author: 'bar@redvelvet.ru', photo: ph('vinyl', 504), date: 'вчера' },
])
const tabs = computed(() => [
  { id: 'overview' as Tab, name: 'Статистика', icon: 'chart' },
  { id: 'moderation' as Tab, name: 'Модерация', icon: 'shield', badge: moderation.value.length },
  { id: 'cities' as Tab, name: 'Города и регионы', icon: 'globe' },
  { id: 'tags' as Tab, name: 'Категории и теги', icon: 'tag' },
  { id: 'users' as Tab, name: 'Пользователи', icon: 'users' },
  { id: 'payments' as Tab, name: 'Комиссии и платежи', icon: 'wallet' },
])
const tab = ref<Tab>('overview')

// --- Статистика
const kpis = [
  { label: 'Посещений за месяц', value: '1,24 млн', delta: '+14%' },
  { label: 'Активных пользователей', value: '186 400', delta: '+8%' },
  { label: 'Продано билетов', value: '42 918', delta: '+21%' },
  { label: 'Оборот платформы', value: formatPrice(38_400_000), delta: '+17%' },
]
const visits = ['Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт'].map((label, i) => ({ label, value: [620, 710, 820, 790, 1040, 1240][i]! * 1000 }))
const byGenre = genres.map((g, i) => ({ label: g.name, value: [34, 22, 18, 12, 6, 4, 2, 1, 1, 1][i]! }))

// --- Города
const cityList = ref(baseCities.map(c => ({ ...c, venues: venues.filter(v => v.city === c.id).length, active: true })))
const newCity = ref('')
const addCity = () => {
  const name = newCity.value.trim()
  if (!name) return
  cityList.value.push({ id: name.toLowerCase(), name, where: '', lat: 0, lng: 0, venues: 0, active: false })
  newCity.value = ''
  push(`Город «${name}» добавлен (выключен до наполнения)`)
}

// --- Модерация
const moderate = (id: string, ok: boolean) => {
  moderation.value = moderation.value.filter(m => m.id !== id)
  push(ok ? 'Опубликовано' : 'Отклонено, автору отправлено уведомление')
}

// --- Теги
const tagGroups = reactive([
  { title: 'Музыкальные жанры', items: genres.map(g => g.name) },
  { title: 'Форматы заведений', items: formats.map(f => f.name) },
  { title: 'Бар и кухня', items: drinks.map(d => d.name) },
])
const tagDrafts = reactive<string[]>(['', '', ''])
const addTag = (i: number) => {
  const v = tagDrafts[i]!.trim()
  if (!v) return
  tagGroups[i]!.items.push(v)
  tagDrafts[i] = ''
}

// --- Пользователи
const userQuery = ref('')
const users = ref([
  { id: 1, name: 'Алекс Петров', email: 'alex@joined.ru', role: 'user' as Role, joined: '12.03.2025', blocked: false },
  { id: 2, name: 'Red Velvet', email: 'bar@redvelvet.ru', role: 'venue' as Role, joined: '02.01.2025', blocked: false },
  { id: 3, name: 'Orange Sunset', email: 'band@orangesunset.ru', role: 'artist' as Role, joined: '18.02.2025', blocked: false },
  { id: 4, name: 'Мария Л.', email: 'maria@gmail.com', role: 'user' as Role, joined: '30.06.2025', blocked: false },
  { id: 5, name: 'Spam Bot', email: 'win@prize.biz', role: 'user' as Role, joined: '01.10.2025', blocked: true },
  { id: 6, name: 'Garage Hall', email: 'hello@garagehall.ru', role: 'venue' as Role, joined: '15.11.2024', blocked: false },
])
const filteredUsers = computed(() => {
  const q = userQuery.value.trim().toLowerCase()
  return users.value.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.includes(q))
})

// --- Платежи
const payments = reactive({ ticketFee: 7, bookingFee: 5, serviceFee: 99, payout: 'weekly', providers: { card: true, sbp: true, wallet: false } })
const transactions = [
  { id: 'TX-81F2', what: 'Билеты · Jazz Night', amount: 2500, fee: 175, status: 'Оплачено' },
  { id: 'TX-81E9', what: 'Депозит · Neon Lounge', amount: 9000, fee: 450, status: 'Оплачено' },
  { id: 'TX-81D1', what: 'Возврат · Techno Underground', amount: -1200, fee: 0, status: 'Возврат' },
  { id: 'TX-81C7', what: 'Билеты · Indie Weekend Fest', amount: 15000, fee: 1050, status: 'Оплачено' },
]
</script>

<template>
  <section class="container-x pt-10">
    <div class="card mb-8 p-6 sm:p-8">
      <p class="text-xs font-medium tracking-[0.2em] text-accent-text uppercase">Администратор системы</p>
      <h1 class="h-display mt-2 text-4xl sm:text-6xl">Управление платформой</h1>
    </div>

    <div class="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      <aside class="min-w-0 lg:sticky lg:top-28 lg:h-fit"><UiTabs v-model="tab" :tabs="tabs" /></aside>

      <div class="min-w-0">
        <!-- СТАТИСТИКА -->
        <div v-if="tab === 'overview'" class="grid grid-cols-1 gap-4">
          <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div v-for="k in kpis" :key="k.label" class="card p-4 sm:p-5">
              <p class="text-sm text-muted">{{ k.label }}</p>
              <p class="mt-2 text-xl font-medium sm:text-3xl">{{ k.value }}</p>
              <p class="mt-1 text-xs text-accent-text">{{ k.delta }} м/м</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_1fr]">
            <div class="card p-5 sm:p-6">
              <h2 class="mb-8 text-lg font-medium">Посещения по месяцам</h2>
              <UiBarChart :data="visits" :height="220" />
            </div>
            <div class="card p-5 sm:p-6">
              <h2 class="mb-5 text-lg font-medium">Доля продаж по жанрам</h2>
              <div class="space-y-3">
                <div v-for="g in byGenre.slice(0, 6)" :key="g.label">
                  <div class="mb-1 flex justify-between text-sm"><span class="text-soft">{{ g.label }}</span><span>{{ g.value }}%</span></div>
                  <div class="h-2 overflow-hidden rounded-full bg-black/30 shadow-[inset_0_1px_2px_rgb(0_0_0/0.4)]"><div class="h-full rounded-full bg-linear-to-r from-[#ff6d29] to-[#ff9f70]" :style="{ width: `${g.value / 34 * 100}%` }" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- МОДЕРАЦИЯ -->
        <div v-else-if="tab === 'moderation'" class="grid grid-cols-1 gap-4">
          <h2 class="text-2xl font-medium">Очередь модерации</h2>
          <!-- Список в стиле афиши, как входящие брони партнёра: обложка, тип точкой, название заглавными -->
          <ul v-if="moderation.length" class="card px-5 sm:px-8">
            <li
              v-for="m in moderation"
              :key="m.id"
              class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-4 border-b border-line py-5 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <UiPhoto :src="m.photo" :alt="m.name" class="size-16 rounded-2xl sm:size-20" />
              <div class="min-w-0">
                <p class="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent-text uppercase">
                  <span class="size-1.5 rounded-full bg-accent" />
                  {{ m.kind }}
                </p>
                <p class="mt-1.5 truncate font-medium uppercase">{{ m.name }}</p>
                <p class="mt-0.5 truncate text-xs tracking-wider text-muted uppercase">{{ m.city }} · {{ m.date }}</p>
                <p class="mt-0.5 truncate text-xs text-muted">{{ m.author }}</p>
              </div>
              <div class="col-span-2 flex gap-2 sm:col-span-1">
                <button class="btn-dark flex-1 sm:flex-none" @click="moderate(m.id, false)">Отклонить</button>
                <button class="btn-primary flex-1 sm:flex-none" @click="moderate(m.id, true)">Одобрить</button>
              </div>
            </li>
          </ul>
          <UiEmpty v-else icon="check" title="Очередь пуста" text="Все заявки обработаны." />
        </div>

        <!-- ГОРОДА -->
        <div v-else-if="tab === 'cities'" class="grid grid-cols-1 gap-4">
          <form class="flex gap-2" @submit.prevent="addCity">
            <input v-model="newCity" class="field" placeholder="Новый город или регион">
            <button class="btn-primary shrink-0" type="submit"><UiIcon name="plus" :size="16" /> Добавить</button>
          </form>
          <div class="card divide-y divide-line px-5">
            <div v-for="c in cityList" :key="c.id" class="flex items-center gap-4 py-4">
              <UiIcon name="pin" class="text-muted" :size="18" />
              <div class="min-w-0 flex-1">
                <p class="font-medium">{{ c.name }}</p>
                <p class="text-sm text-muted">{{ c.venues }} {{ plural(c.venues, ['заведение', 'заведения', 'заведений']) }}</p>
              </div>
              <UiToggle v-model="c.active" :label="c.active ? 'Активен' : 'Скрыт'" class="py-0!" />
            </div>
          </div>
        </div>

        <!-- ТЕГИ -->
        <div v-else-if="tab === 'tags'" class="grid grid-cols-1 gap-4">
          <div v-for="(g, i) in tagGroups" :key="g.title" class="card p-5 sm:p-6">
            <h2 class="mb-4 text-lg font-medium">{{ g.title }}</h2>
            <div class="flex flex-wrap gap-2">
              <span v-for="(t, j) in g.items" :key="t" class="pill gap-2 pr-2">
                {{ t }}
                <button class="grid size-5 place-items-center rounded-full bg-black/30 transition-colors hover:bg-accent" :aria-label="`Удалить ${t}`" @click="g.items.splice(j, 1)"><UiIcon name="x" :size="12" /></button>
              </span>
            </div>
            <form class="mt-4 flex gap-2" @submit.prevent="addTag(i)">
              <input v-model="tagDrafts[i]" class="field" placeholder="Новый тег">
              <button class="btn-dark shrink-0" type="submit">Добавить</button>
            </form>
          </div>
        </div>

        <!-- ПОЛЬЗОВАТЕЛИ -->
        <div v-else-if="tab === 'users'" class="grid grid-cols-1 gap-4">
          <label class="search-bar flex items-center gap-3 px-5">
            <UiIcon name="search" class="text-muted" :size="18" />
            <input v-model="userQuery" type="search" placeholder="Имя или email" class="w-full bg-transparent py-3 text-sm placeholder:text-muted">
          </label>
          <!-- Скролл во внутреннем блоке: иначе рамка карточки (::before) уезжает вместе с таблицей -->
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
            <table class="w-full min-w-160 text-left text-sm">
              <thead class="text-muted">
                <tr class="border-b border-line">
                  <th class="px-5 py-3 font-normal">Пользователь</th>
                  <th class="px-5 py-3 font-normal">Роль</th>
                  <th class="px-5 py-3 font-normal">Регистрация</th>
                  <th class="px-5 py-3 font-normal">Статус</th>
                  <th class="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in filteredUsers" :key="u.id" class="border-b border-line last:border-0">
                  <td class="px-5 py-3">
                    <p class="font-medium">{{ u.name }}</p>
                    <p class="text-xs text-muted">{{ u.email }}</p>
                  </td>
                  <td class="px-5 py-3">
                    <select v-model="u.role" class="pill appearance-none py-1.5" :aria-label="`Роль ${u.name}`">
                      <option v-for="(n, r) in roleNames" :key="r" :value="r">{{ n }}</option>
                    </select>
                  </td>
                  <td class="px-5 py-3 text-soft">{{ u.joined }}</td>
                  <td class="px-5 py-3">
                    <span class="tag" :class="u.blocked ? '' : 'tag-neutral'">{{ u.blocked ? 'Заблокирован' : 'Активен' }}</span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <button class="text-sm text-muted hover:text-white" @click="u.blocked = !u.blocked">{{ u.blocked ? 'Разблокировать' : 'Заблокировать' }}</button>
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <!-- ПЛАТЕЖИ -->
        <div v-else-if="tab === 'payments'" class="grid grid-cols-1 gap-4">
          <form class="card grid grid-cols-1 gap-5 p-5 sm:p-8" @submit.prevent="push('Настройки сохранены')">
            <h2 class="text-xl font-medium">Комиссии</h2>
            <div class="grid gap-5 sm:grid-cols-3">
              <label><span class="label">С продажи билетов, %</span><input v-model.number="payments.ticketFee" type="number" min="0" max="30" step="0.5" class="field"></label>
              <label><span class="label">С депозитов, %</span><input v-model.number="payments.bookingFee" type="number" min="0" max="30" step="0.5" class="field"></label>
              <label><span class="label">Сервисный сбор, ₽</span><input v-model.number="payments.serviceFee" type="number" min="0" step="10" class="field"></label>
            </div>
            <label>
              <span class="label">Выплаты партнёрам</span>
              <select v-model="payments.payout" class="field appearance-none">
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
                <option value="monthly">Ежемесячно</option>
              </select>
            </label>
            <div class="divide-y divide-line border-t border-line">
              <UiToggle v-model="payments.providers.card" label="Банковские карты" hint="Visa, Mastercard, МИР" />
              <UiToggle v-model="payments.providers.sbp" label="Система быстрых платежей" />
              <UiToggle v-model="payments.providers.wallet" label="Электронные кошельки" />
            </div>
            <div class="flex justify-end"><button class="btn-primary px-8 py-3.5" type="submit">Сохранить</button></div>
          </form>
          <div class="card p-5 sm:p-6">
            <h2 class="mb-4 text-lg font-medium">Последние транзакции</h2>
            <div class="divide-y divide-line">
              <div v-for="t in transactions" :key="t.id" class="flex items-center gap-4 py-3 text-sm">
                <span class="hidden w-20 text-muted sm:block">{{ t.id }}</span>
                <span class="min-w-0 flex-1 truncate">{{ t.what }}</span>
                <span class="text-muted">комиссия {{ formatPrice(t.fee) }}</span>
                <span class="w-24 text-right" :class="t.amount < 0 ? 'text-accent-text' : ''">{{ formatPrice(t.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
