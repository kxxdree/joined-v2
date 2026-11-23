<script setup lang="ts">
import { useSession } from '@entities/session'
import { useEventCatalog } from '@entities/event'
import { useVenueCatalog, type Venue } from '@entities/venue'
import { useToast } from '@shared/lib'
import { UiIcon, UiModal } from '@shared/ui'
import { cloneContent, editorSections, isVenueContent, validateContent, type ContentIssue, type EditorSection, type VenueContent } from '../model/content'
import { useVenueWorkspace } from '../model/workspace'
import EditorField from './EditorField.vue'
import EditorList from './EditorList.vue'
import EditorMedia from './EditorMedia.vue'
import VenueDetailsEditor from './VenueDetailsEditor.vue'
import VenueEventsEditor from './VenueEventsEditor.vue'

const props = defineProps<{ slug: string }>()
const { getVenue } = useVenueCatalog()
const { events } = useEventCatalog()
const { save, isReady, storageError } = useVenueWorkspace()
const { push } = useToast()
const { user } = useSession()
const isNew = computed(() => props.slug === 'new')
const activeSection = ref<EditorSection>('overview')
const draft = ref<VenueContent>()
const savedSnapshot = ref('')
const issues = ref<ContentIssue[]>([])
const saveError = ref('')
const draftMessage = ref('')
const lastSaved = ref('')
const discardOpen = ref(false)
const editorBody = ref<HTMLElement>()
const pendingUploads = ref(0)
provide('venue-editor-upload-count', pendingUploads)
let draftTimer: ReturnType<typeof setTimeout> | undefined
const dirty = computed(() => !!draft.value && JSON.stringify(draft.value) !== savedSnapshot.value)
const currentSection = computed(() => editorSections.find(section => section.id === activeSection.value)!)
const draftKey = computed(() => `joined_venue_draft_v1:${user.value?.email ?? 'demo'}:${props.slug}`)
const initialVenue = (): Venue => ({
  slug: '', name: '', city: 'moscow', format: 'bar', genres: [], drinks: [], address: '', metro: '', directions: '', lat: 55.7558, lng: 37.6173,
  popularity: 0, short: '', description: '', phone: '', instagram: '', telegram: '',
  hours: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => ({ day, time: '18:00–02:00' })),
  photo: '', gallery: [], menu: { bar: [], kitchen: [] }, booking: { deposit: 0, minGuests: 1, maxGuests: 10, conditions: [] }, rules: [],
})
const initialize = () => {
  const venue = isNew.value ? initialVenue() : getVenue(props.slug)
  if (!venue) return
  const content = { venue: cloneContent(venue), events: cloneContent(events.value.filter(event => event.venue === venue.slug)) }
  savedSnapshot.value = JSON.stringify(content)
  draft.value = content
  try {
    const stored = localStorage.getItem(draftKey.value)
    if (stored) {
      const recovered = JSON.parse(stored) as { base: string; content: VenueContent }
      if (recovered.base === savedSnapshot.value && isVenueContent(recovered.content)) {
        draft.value = recovered.content
        draftMessage.value = 'Восстановлен ваш несохранённый черновик.'
      } else draftMessage.value = 'Сохранённая версия обновилась. Открыты актуальные данные; старый черновик не применён.'
    }
  } catch { draftMessage.value = 'Автосохранение черновика недоступно. Перед выходом сохраните изменения.' }
}
const persistDraft = () => {
  if (!draft.value || !dirty.value) return
  try {
    localStorage.setItem(draftKey.value, JSON.stringify({ base: savedSnapshot.value, content: draft.value }))
    draftMessage.value = 'Черновик сохранён в этом браузере.'
  } catch { draftMessage.value = 'Не удалось сохранить черновик: хранилище недоступно или заполнено. Уменьшите число загруженных фото или используйте ссылки.' }
}
watch(isReady, ready => { if (ready && import.meta.client) initialize() }, { immediate: true })
watch(draft, () => {
  clearTimeout(draftTimer)
  if (dirty.value) draftTimer = setTimeout(persistDraft, 600)
}, { deep: true })
const showSection = async (section: EditorSection) => {
  activeSection.value = section
  await nextTick()
  editorBody.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  editorBody.value?.focus({ preventScroll: true })
}
const saveChanges = async () => {
  if (!draft.value || pendingUploads.value) return
  saveError.value = ''
  const content = cloneContent(draft.value)
  content.events.forEach(event => { event.venue = content.venue.slug })
  issues.value = validateContent(content)
  if (!isNew.value && content.venue.slug !== props.slug) issues.value.unshift({ section: 'overview', message: 'Адрес существующей страницы нельзя изменить.' })
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.value.venue.slug) || draft.value.venue.slug === 'new') issues.value.unshift({ section: 'overview', message: 'Адрес страницы: используйте латинские буквы, цифры и дефисы; «new» зарезервирован.' })
  if (isNew.value && getVenue(draft.value.venue.slug)) issues.value.unshift({ section: 'overview', message: 'Этот адрес страницы уже занят. Выберите другой.' })
  if (issues.value.length) { await showSection(issues.value[0]!.section); return }
  try {
    save(content)
    savedSnapshot.value = JSON.stringify(content)
    draft.value = content
    clearTimeout(draftTimer)
    try { localStorage.removeItem(draftKey.value) } catch { /* Сохранённая версия уже записана. */ }
    lastSaved.value = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    draftMessage.value = ''
    push('Изменения сохранены. Страница заведения обновлена.')
    if (isNew.value) await navigateTo(`/partner/${content.venue.slug}`, { replace: true })
  } catch { saveError.value = 'Не удалось сохранить изменения. Возможно, закончилось место в браузере. Уменьшите количество загруженных фото или замените их ссылками. Ваши правки остаются в форме.' }
}
const discardChanges = () => {
  clearTimeout(draftTimer)
  draft.value = JSON.parse(savedSnapshot.value) as VenueContent
  try { localStorage.removeItem(draftKey.value) } catch { /* Форма восстановлена независимо от хранилища. */ }
  draftMessage.value = ''
  issues.value = []
  saveError.value = ''
  discardOpen.value = false
}
const beforeUnload = (event: BeforeUnloadEvent) => {
  if (!dirty.value && !pendingUploads.value) return
  persistDraft()
  event.preventDefault()
  event.returnValue = ''
}
onBeforeRouteLeave(() => {
  if (pendingUploads.value) return window.confirm('Фотографии ещё обрабатываются. Выйти и прервать загрузку?')
  if (!dirty.value) return true
  persistDraft()
  return window.confirm('Изменения ещё не сохранены на странице заведения. Выйти из редактора?')
})
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => { clearTimeout(draftTimer); if (dirty.value) persistDraft(); window.removeEventListener('beforeunload', beforeUnload) })

useHead({ title: computed(() => `${draft.value?.venue.name || 'Новое заведение'} · Кабинет — Joined`) })
</script>

<template>
  <div class="container-x pt-7 pb-32 sm:pt-10">
    <NuxtLink to="/partner" class="inline-flex items-center gap-2 py-2 text-sm text-muted hover:text-white"><UiIcon name="chevron-left" :size="16" /> Все заведения</NuxtLink>
    <div v-if="!isReady" class="card mt-8 p-8" role="status">Загружаем ваши данные…</div>
    <div v-else-if="!draft" class="card mt-8 p-8"><h1 class="text-2xl">Заведение не найдено</h1><p class="mt-3 text-muted">Вернитесь к списку и выберите заведение или создайте новое.</p><NuxtLink to="/partner" class="btn-dark mt-6 px-5 py-3">К заведениям</NuxtLink></div>
    <template v-else>
      <header class="mt-6 mb-8 flex flex-wrap items-end justify-between gap-5">
        <div class="min-w-0"><p class="mb-3 text-sm text-accent-text">Кабинет заведения</p><h1 class="h-display text-4xl wrap-break-word sm:text-5xl">{{ draft.venue.name || 'Новое место' }}</h1><p class="mt-4 max-w-2xl text-sm leading-relaxed text-muted">Всё, что нужно гостям, — в одном месте. Заполните разделы в удобном порядке.</p></div>
        <NuxtLink v-if="!isNew" :to="`/venues/${slug}`" target="_blank" class="btn-dark gap-2 px-5 py-3 text-sm"><UiIcon name="eye" :size="18" /> Открыть страницу</NuxtLink>
      </header>
      <div class="mb-6 flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent-deep p-4 text-sm leading-relaxed"><UiIcon name="info" :size="20" class="mt-0.5 shrink-0 text-accent-text" /><p>Демонстрационный кабинет. Сохранённые изменения видны на сайте в этом браузере. Они не передаются другим посетителям или устройствам.</p></div>
      <p v-if="storageError" role="alert" class="mb-5 text-sm text-accent-text">{{ storageError }}</p>
      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <aside class="sticky top-24 z-30 min-w-0 lg:top-28">
          <nav aria-label="Разделы редактора" class="card flex gap-1 overflow-x-auto p-2 lg:flex-col">
            <button v-for="section in editorSections" :key="section.id" type="button" :aria-current="activeSection === section.id ? 'step' : undefined" class="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-colors" :class="activeSection === section.id ? 'bg-white/8 text-white' : 'text-muted hover:bg-white/4 hover:text-white'" @click="showSection(section.id)"><UiIcon :name="section.icon" :size="19" :class="activeSection === section.id ? 'text-accent-text' : ''" /><span class="flex-1 whitespace-nowrap">{{ section.name }}</span><span v-if="issues.some(issue => issue.section === section.id)" class="text-accent-text" aria-label="Есть ошибки">!</span></button>
          </nav>
          <p class="mt-4 hidden px-3 text-sm leading-relaxed text-muted lg:block">Поля со <span class="text-accent-text">*</span> обязательны. Остальное можно добавить позже.</p>
        </aside>
        <div ref="editorBody" tabindex="-1" class="min-w-0 scroll-mt-48 outline-none lg:scroll-mt-28">
          <div v-if="issues.length || saveError" role="alert" class="mb-5 rounded-2xl border border-accent/40 bg-accent-deep p-5">
            <h2 class="font-medium">{{ saveError ? 'Изменения пока не сохранены' : 'Осталось кое-что проверить' }}</h2><p v-if="saveError" class="mt-2 text-sm leading-relaxed">{{ saveError }}</p><ul v-else class="mt-3 space-y-2"><li v-for="(issue, index) in issues" :key="index"><button type="button" class="text-left text-sm underline decoration-white/30 underline-offset-4 hover:text-sand" @click="showSection(issue.section)">{{ issue.message }}</button></li></ul>
          </div>
          <form class="card p-5 sm:p-8 lg:p-9" novalidate @submit.prevent="saveChanges">
            <div class="mb-8 border-b border-line pb-6"><h2 class="text-2xl font-medium">{{ currentSection.name }}</h2><p class="mt-2 text-sm text-muted">{{ currentSection.hint }}</p></div>
            <VenueDetailsEditor v-if="['overview', 'location', 'hours'].includes(activeSection)" v-model="draft.venue" :section="activeSection" :is-new="isNew" />
            <div v-else-if="activeSection === 'media'" class="space-y-10"><div><h3 class="mb-2 font-medium">Обложка *</h3><p class="mb-4 text-sm leading-relaxed text-muted">Главное фото в каталоге и на странице заведения. Лучше всего подойдёт широкий кадр интерьера.</p><EditorMedia :model-value="draft.venue.photo ? [draft.venue.photo] : []" single label="Обложка заведения" @update:model-value="draft.venue.photo = $event[0] ?? ''" /></div><div><h3 class="mb-2 font-medium">Галерея</h3><p class="mb-4 text-sm text-muted">Покажите атмосферу, сцену, напитки и любимые места гостей.</p><EditorMedia v-model="draft.venue.gallery" label="Галерея заведения" /></div></div>
            <div v-else-if="activeSection === 'menu'" class="space-y-10"><p class="text-sm text-muted">Загрузите фотографии или изображения страниц в порядке чтения. Гости смогут открыть их на весь экран.</p><div><h3 class="mb-4 font-medium">Меню бара</h3><EditorMedia v-model="draft.venue.menu.bar" label="Меню бара" /></div><div><h3 class="mb-4 font-medium">Меню кухни</h3><EditorMedia v-model="draft.venue.menu.kitchen" label="Меню кухни" /></div></div>
            <div v-else-if="activeSection === 'booking'" class="space-y-7"><EditorField label="Депозит на одного гостя, ₽" hint="Укажите 0, если депозит не требуется." required><input v-model.number="draft.venue.booking.deposit" type="number" min="0" class="field"></EditorField><div class="grid gap-5 sm:grid-cols-2"><EditorField label="Минимум гостей" required><input v-model.number="draft.venue.booking.minGuests" type="number" min="1" step="1" class="field"></EditorField><EditorField label="Максимум гостей" required><input v-model.number="draft.venue.booking.maxGuests" type="number" min="1" step="1" class="field"></EditorField></div><div><h3 class="mb-2 font-medium">Условия бронирования</h3><p class="mb-4 text-sm text-muted">Расскажите об отмене, опоздании, предоплате и о том, как подтверждается столик.</p><EditorList v-model="draft.venue.booking.conditions" label="Условие" placeholder="Например, бронь сохраняется 15 минут после указанного времени" /></div></div>
            <VenueEventsEditor v-else-if="activeSection === 'events'" v-model="draft.events" :venue-slug="draft.venue.slug" :cover="draft.venue.photo" />
            <div v-else-if="activeSection === 'rules'" class="space-y-5"><p class="text-sm text-muted">Возрастные ограничения, дресс-код, посещение с детьми или питомцами — всё, что гостю полезно знать заранее.</p><EditorList v-model="draft.venue.rules" label="Правило" placeholder="Например, вход на мероприятия с 18 лет" /></div>
            <p class="mt-8 text-sm text-muted">Все разделы сохраняются вместе.</p>
          </form>
        </div>
      </div>
      <div class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#1c1719]/95 px-4 py-4 shadow-[0_-12px_40px_rgb(0_0_0/0.25)] backdrop-blur-xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 sm:px-6 lg:px-12">
          <div class="min-w-0" role="status" aria-live="polite"><p class="text-sm font-medium">{{ pendingUploads ? 'Обрабатываем фотографии…' : dirty ? 'Есть несохранённые изменения' : lastSaved ? `Сохранено в ${lastSaved}` : isNew ? 'Заполните обязательные поля' : 'Все изменения сохранены' }}</p><p v-if="draftMessage" class="mt-1 max-w-xl text-xs leading-relaxed text-muted">{{ draftMessage }}</p></div>
          <div class="flex w-full gap-2 sm:w-auto"><button type="button" class="btn-dark flex-1 px-4 py-3 text-sm sm:flex-none" :disabled="!dirty || !!pendingUploads" @click="discardOpen = true">Отменить изменения</button><button type="button" class="btn-primary flex-1 px-5 py-3 text-sm sm:flex-none" :disabled="(!dirty && !isNew) || !!pendingUploads" @click="saveChanges">{{ isNew ? 'Создать заведение' : 'Сохранить изменения' }}</button></div>
        </div>
      </div>
      <UiModal v-model="discardOpen" title="Отменить изменения?"><p class="text-soft">Все несохранённые правки во всех разделах будут заменены последней сохранённой версией.</p><div class="mt-6 flex flex-wrap gap-3"><button type="button" class="btn-dark px-5 py-3" @click="discardOpen = false">Продолжить редактирование</button><button type="button" class="btn-primary px-5 py-3" @click="discardChanges">Отменить правки</button></div></UiModal>
    </template>
  </div>
</template>
