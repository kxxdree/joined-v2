<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, type EventItem, EventRows, events, isUpcoming } from '@entities/event'
import { useSession } from '@entities/session'
import { getVenue, venues } from '@entities/venue'
import { type GenreId, genres } from '@shared/config'
import { addDays, dayNumber, monthShort, ph, plural, todayISO, useToast } from '@shared/lib'
import { UiCarousel, UiEmpty, UiIcon, UiModal, UiPageHead, UiPhoto, UiPhotoViewer, UiPills, UiTabs } from '@shared/ui'

useHead({ title: 'Кабинет партнёра - Joined' })

const { user } = useSession()
const { push } = useToast()
const isVenue = computed(() => user.value?.role !== 'artist')

// Демо: владелец управляет Red Velvet, группа - Orange Sunset
const venue = getVenue('red-velvet')!
const artist = getArtist('orange-sunset')!

type Tab = 'profile' | 'events' | 'bookings' | 'media'
const tabs = computed(() => [
  { id: 'events' as Tab, name: 'Мероприятия', icon: 'calendar' },
  { id: 'profile' as Tab, name: isVenue.value ? 'Профиль заведения' : 'Профиль группы', icon: 'edit' },
  ...(isVenue.value ? [{ id: 'bookings' as Tab, name: 'Бронирования', icon: 'users', badge: incoming.value.filter(b => b.status === 'new').length }] : []),
  { id: 'media' as Tab, name: isVenue.value ? 'Фото и меню' : 'Медиа', icon: 'image' },
])
const tab = ref<Tab>('events')

// --- Профиль
const profile = reactive({
  name: isVenue.value ? venue.name : artist.name,
  short: isVenue.value ? venue.short : artist.short,
  description: isVenue.value ? venue.description : artist.bio,
  phone: venue.phone,
  address: venue.address,
  instagram: venue.instagram,
  telegram: venue.telegram,
  genres: [...(isVenue.value ? venue.genres : artist.genres)] as GenreId[],
  rules: venue.rules.join('\n'),
  deposit: venue.booking.deposit,
})

// --- Мероприятия
const myEvents = ref<EventItem[]>(
  events.filter(e => isUpcoming(e) && (isVenue.value ? e.venue === venue.slug : e.artists.includes(artist.slug))),
)
// События, сгруппированные по дням - для афиши-постера
const groupByDate = (list: EventItem[]) => {
  const map = new Map<string, EventItem[]>()
  for (const e of list) map.set(e.date, [...(map.get(e.date) ?? []), e])
  return [...map.entries()]
}
const grouped = computed(() => groupByDate([...myEvents.value].sort(byDateTime)))
const newOpen = ref(false)
const draft = reactive({ title: '', date: todayISO(), time: '21:00', genre: 'live' as GenreId, price: 1000, vip: 0, description: '', venue: venue.slug })
const createEvent = () => {
  if (draft.title.trim().length < 3) return push('Укажите название события')
  myEvents.value = [{
    id: `new-${Date.now()}`,
    title: draft.title.trim(),
    venue: draft.venue,
    artists: isVenue.value ? [] : [artist.slug],
    genres: [draft.genre],
    date: draft.date,
    time: draft.time,
    description: draft.description,
    photo: ph('concert', Math.floor(Math.random() * 1000)),
    tickets: [
      { id: 'standard' as const, name: 'Стандарт', desc: '', price: draft.price, left: 100 },
      ...(draft.vip ? [{ id: 'vip' as const, name: 'VIP', desc: '', price: draft.vip, left: 20 }] : []),
    ],
  }, ...myEvents.value].sort((a, b) => a.date.localeCompare(b.date))
  newOpen.value = false
  draft.title = ''
  push('Событие создано и отправлено на модерацию')
}
const removeEvent = (id: string) => {
  myEvents.value = myEvents.value.filter(e => e.id !== id)
  push('Событие снято с публикации')
}

// --- Фото: галерея и страницы меню бара и кухни (меню - только для заведения)
type MediaKind = 'gallery' | 'bar' | 'kitchen'
// title/eyebrow - для афиши-секции, name - для подписей и просмотра; units - склонение счётчика
const photoUnits: [string, string, string] = ['фото', 'фото', 'фото']
const pageUnits: [string, string, string] = ['страница', 'страницы', 'страниц']
const mediaKinds = computed(() => [
  { id: 'gallery' as MediaKind, name: isVenue.value ? 'Фотогалерея' : 'Фото и видео', title: isVenue.value ? 'Галерея' : 'Фото', eyebrow: 'Интерьер и события', units: photoUnits, target: 'в галерею', aspect: 'aspect-square', empty: 'Загрузите фото - их увидят гости на публичной странице' },
  ...(isVenue.value
    ? [
        { id: 'bar' as MediaKind, name: 'Меню бара', title: 'Бар', eyebrow: 'Меню', units: pageUnits, target: 'в меню', aspect: 'aspect-3/4', empty: 'Загрузите фото страниц меню - их увидят гости на странице заведения' },
        { id: 'kitchen' as MediaKind, name: 'Меню кухни', title: 'Кухня', eyebrow: 'Меню', units: pageUnits, target: 'в меню', aspect: 'aspect-3/4', empty: 'Загрузите фото страниц меню - их увидят гости на странице заведения' },
      ]
    : []),
])
const media = reactive({ gallery: [...venue.gallery], bar: [...venue.menu.bar], kitchen: [...venue.menu.kitchen] })
// Демо без бэкенда: локальные превью файлов, сразу видны на странице заведения
const syncMedia = (kind: MediaKind) => {
  if (kind === 'gallery') venue.gallery = [...media.gallery]
  else venue.menu[kind] = [...media[kind]]
}
const addPhotos = (kind: MediaKind, e: Event) => {
  const input = e.target as HTMLInputElement
  const files = [...(input.files ?? [])].filter(f => f.type.startsWith('image/'))
  input.value = ''
  if (!files.length) return
  media[kind].push(...files.map(f => URL.createObjectURL(f)))
  syncMedia(kind)
  push(`${files.length} ${plural(files.length, ['фото добавлено', 'фото добавлены', 'фото добавлено'])} ${mediaKinds.value.find(k => k.id === kind)?.target}`)
}
const removePhoto = (kind: MediaKind, src: string) => {
  media[kind] = media[kind].filter(s => s !== src)
  if (src.startsWith('blob:')) URL.revokeObjectURL(src)
  syncMedia(kind)
}
// Просмотр фото крупно, с листанием - как на странице заведения
const viewer = ref<{ kind: MediaKind; index: number } | null>(null)
const viewerPhotos = computed(() => (viewer.value ? media[viewer.value.kind] : []))
const viewerIndex = computed({
  get: () => viewer.value?.index ?? null,
  set: (i) => { viewer.value = viewer.value && i !== null ? { ...viewer.value, index: i } : null },
})

// --- Входящие брони (только для заведения)
type BookingStatus = 'new' | 'ok' | 'no'
const incoming = ref<{ id: string; name: string; phone: string; date: string; time: string; guests: number; status: BookingStatus }[]>([
  { id: 'b1', name: 'Мария Л.', phone: '+7 916 482-12-40', date: todayISO(), time: '20:00', guests: 4, status: 'new' },
  { id: 'b2', name: 'Илья К.', phone: '+7 903 617-55-11', date: todayISO(), time: '21:00', guests: 2, status: 'new' },
  { id: 'b3', name: 'Компания «Ромашка»', phone: '+7 495 230-14-00', date: addDays(todayISO(), 2), time: '19:00', guests: 10, status: 'new' },
  { id: 'b4', name: 'Анна В.', phone: '+7 926 354-87-01', date: addDays(todayISO(), 3), time: '22:00', guests: 3, status: 'ok' },
])
const setStatus = (id: string, status: Exclude<BookingStatus, 'new'>) => {
  incoming.value = incoming.value.map(b => (b.id === id ? { ...b, status } : b))
  push(status === 'ok' ? 'Бронь подтверждена, гостю отправлено уведомление' : 'Бронь отклонена')
}
</script>

<template>
  <section class="container-x">
    <UiPageHead :title="profile.name" :caption="isVenue ? 'Владелец заведения' : 'Музыкальная группа'">
      <template #actions>
        <NuxtLink :to="isVenue ? `/venues/${venue.slug}` : `/artists/${artist.slug}`" class="btn-icon size-10" aria-label="Публичная страница"><UiIcon name="eye" :size="18" /></NuxtLink>
      </template>
    </UiPageHead>
    <UiTabs v-model="tab" :tabs="tabs" />

    <div class="pt-4">
      <div class="max-w-4xl">
        <!-- ПРОФИЛЬ -->
        <form v-if="tab === 'profile'" class="grid grid-cols-1 gap-4" @submit.prevent="push('Изменения отправлены на модерацию')">
          <div class="card grid grid-cols-1 gap-5 p-5 sm:p-8">
            <h2 class="text-xl font-medium">Основная информация</h2>
            <label><span class="label">Название</span><input v-model="profile.name" class="field"></label>
            <label><span class="label">Короткое описание</span><input v-model="profile.short" class="field"></label>
            <label><span class="label">{{ isVenue ? 'Описание' : 'О коллективе' }}</span><textarea v-model="profile.description" rows="5" class="field resize-none" /></label>
            <div class="min-w-0">
              <span class="label">Музыкальные жанры</span>
              <UiPills v-model="profile.genres" :options="genres" multiple :all-label="false" />
            </div>
          </div>
          <div v-if="isVenue" class="card grid gap-5 p-5 sm:p-8">
            <h2 class="text-xl font-medium">Контакты и бронирование</h2>
            <div class="grid gap-5 sm:grid-cols-2">
              <label><span class="label">Телефон</span><input v-model="profile.phone" class="field"></label>
              <label><span class="label">Telegram</span><input v-model="profile.telegram" class="field" placeholder="@username"></label>
              <label><span class="label">Instagram</span><input v-model="profile.instagram" class="field"></label>
              <label><span class="label">Депозит с гостя, ₽</span><input v-model.number="profile.deposit" type="number" min="0" step="100" class="field"></label>
              <label class="sm:col-span-2"><span class="label">Адрес</span><input v-model="profile.address" class="field"></label>
            </div>
            <label><span class="label">Правила посещения (по строке на пункт)</span><textarea v-model="profile.rules" rows="5" class="field resize-none" /></label>
          </div>
          <div class="flex justify-end"><button class="btn-primary px-8 py-3.5" type="submit">Сохранить изменения</button></div>
        </form>

        <!-- МЕРОПРИЯТИЯ -->
        <div v-else-if="tab === 'events'" class="grid grid-cols-1 gap-4">
          <div class="flex justify-end">
            <button class="btn-primary" @click="newOpen = true"><UiIcon name="plus" :size="18" /> Новое событие</button>
          </div>
          <EventRows v-if="grouped.length" :groups="grouped" :subtitle="(e) => `${getVenue(e.venue)?.name ?? '-'} · ${e.time}`">
            <template #actions="{ event: e }">
              <div class="flex shrink-0 gap-2">
                <button class="btn-icon size-9" aria-label="Снять с публикации" @click="removeEvent(e.id)"><UiIcon name="trash" :size="16" /></button>
              </div>
            </template>
          </EventRows>
          <UiEmpty v-else icon="calendar" title="Пока нет событий" text="Нажмите «Новое событие», чтобы добавить первое." />
        </div>

        <!-- БРОНИ -->
        <div v-else-if="tab === 'bookings'" class="grid grid-cols-1 gap-4">
          <ul v-if="incoming.length">
            <li
              v-for="b in incoming"
              :key="b.id"
              class="hair-row grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
              :class="b.status === 'no' ? 'opacity-50' : ''"
            >
              <div class="w-11 text-center">
                <p class="text-xl leading-none font-medium tracking-[-0.03em]">{{ dayNumber(b.date) }}</p>
                <p class="mono-cap mt-1">{{ monthShort(b.date) }}</p>
              </div>
              <div class="min-w-0">
                <p class="truncate font-medium">{{ b.name }}</p>
                <p class="mono-cap mt-1">
                  {{ b.time }} · {{ b.guests }} {{ plural(b.guests, ['гость', 'гостя', 'гостей']) }} ·
                  <a :href="`tel:${b.phone.replace(/[^\d+]/g, '')}`" class="hover:text-white">{{ b.phone }}</a>
                </p>
              </div>
              <div v-if="b.status === 'new'" class="col-span-2 flex gap-2 sm:col-span-1">
                <button class="btn-dark flex-1 sm:flex-none" @click="setStatus(b.id, 'no')">Отклонить</button>
                <button class="btn-primary flex-1 sm:flex-none" @click="setStatus(b.id, 'ok')">Подтвердить</button>
              </div>
              <p v-else class="mono-cap col-span-2 flex items-center gap-2 sm:col-span-1" :class="{ 'text-white': b.status === 'ok' }">
                <span class="size-1.5 rounded-full" :class="b.status === 'ok' ? 'bg-accent' : 'bg-white/20'" />
                {{ b.status === 'ok' ? 'Подтверждена' : 'Отклонена' }}
              </p>
            </li>
          </ul>
          <UiEmpty v-else icon="users" title="Броней пока нет" text="Новые заявки гостей появятся здесь" />
        </div>

        <!-- МЕДИА -->
        <div v-else-if="tab === 'media'" class="grid grid-cols-1 gap-4">
          <!-- Галерея и меню (бар, кухня) - секции через линию -->
          <div>
            <section v-for="k in mediaKinds" :key="k.id" class="border-t border-white/10 py-6 first:border-t-0 first:pt-0 last:pb-0">
              <div class="mb-5 flex items-end justify-between gap-4">
                <div class="min-w-0">
                  <p class="mono-cap">
                    {{ k.eyebrow }} · {{ media[k.id].length }} {{ plural(media[k.id].length, k.units) }}
                  </p>
                  <h3 class="mt-1 text-xl font-medium tracking-[-0.03em]">{{ k.title }}</h3>
                </div>
                <label class="btn-dark shrink-0 cursor-pointer">
                  <UiIcon name="plus" :size="16" /> Загрузить
                  <input type="file" accept="image/*" multiple class="sr-only" @change="addPhotos(k.id, $event)">
                </label>
              </div>
              <!-- Лента: 3 фото в ряд на телефоне, 6 - шире; не влезают - листаются стрелками -->
              <UiCarousel v-if="media[k.id].length">
                <div v-for="(src, i) in media[k.id]" :key="src" class="group/item relative w-[calc((100%-1rem)/3)] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/6)]">
                  <button type="button" class="block w-full overflow-hidden rounded-2xl" :aria-label="`Открыть фото ${i + 1}`" @click="viewer = { kind: k.id, index: i }">
                    <UiPhoto :src="src" :alt="`${k.name}, фото ${i + 1}`" class="transition-transform duration-700 ease-liquid group-hover/item:scale-[1.03]" :class="k.aspect" />
                  </button>
                  <!-- с мышью - появляется при наведении, на тач-экранах видна всегда -->
                  <button
                    type="button"
                    class="btn-icon absolute top-1.5 right-1.5 size-8 bg-black/50 transition-opacity focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100"
                    :aria-label="`Удалить фото ${i + 1}`"
                    @click="removePhoto(k.id, src)"
                  >
                    <UiIcon name="trash" :size="14" />
                  </button>
                </div>
              </UiCarousel>
              <label v-else class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-muted transition-colors hover:border-white/30 hover:text-white">
                <UiIcon name="image" :size="22" class="text-accent-text" />
                {{ k.empty }}
                <input type="file" accept="image/*" multiple class="sr-only" @change="addPhotos(k.id, $event)">
              </label>
            </section>
          </div>
        </div>
      </div>
    </div>

    <UiPhotoViewer v-model="viewerIndex" :photos="viewerPhotos" />

    <UiModal v-model="newOpen" title="Новое событие">
      <form class="grid gap-4" @submit.prevent="createEvent">
        <label><span class="label">Название</span><input v-model="draft.title" class="field" placeholder="Например: Jazz Night"></label>
        <div class="grid grid-cols-2 gap-3">
          <label><span class="label">Дата</span><input v-model="draft.date" type="date" :min="todayISO()" class="field"></label>
          <label><span class="label">Начало</span><input v-model="draft.time" type="time" class="field"></label>
        </div>
        <label v-if="!isVenue">
          <span class="label">Площадка</span>
          <select v-model="draft.venue" class="field appearance-none">
            <option v-for="v in venues" :key="v.slug" :value="v.slug">{{ v.name }}</option>
          </select>
        </label>
        <label>
          <span class="label">Жанр</span>
          <select v-model="draft.genre" class="field appearance-none">
            <option v-for="g in genres" :key="g.id" :value="g.id">{{ g.name }}</option>
          </select>
        </label>
        <div class="grid grid-cols-2 gap-3">
          <label><span class="label">Стандарт, ₽</span><input v-model.number="draft.price" type="number" min="0" step="100" class="field"></label>
          <label><span class="label">VIP, ₽ (0 - нет)</span><input v-model.number="draft.vip" type="number" min="0" step="100" class="field"></label>
        </div>
        <label><span class="label">Описание</span><textarea v-model="draft.description" rows="3" class="field resize-none" /></label>
        <button class="btn-primary mt-2 py-3.5" type="submit">Опубликовать</button>
      </form>
    </UiModal>
  </section>
</template>
