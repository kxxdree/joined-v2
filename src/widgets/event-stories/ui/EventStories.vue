<script setup lang="ts">
import { getArtist } from '@entities/artist'
import { byDateTime, EventTextPoster, minPrice, type EventItem } from '@entities/event'
import { getVenue } from '@entities/venue'
import { genreName } from '@shared/config'
import { formatDate, formatPrice, useToast } from '@shared/lib'
import { UiIcon } from '@shared/ui'

const props = defineProps<{ events: EventItem[] }>()
const openId = defineModel<string | null>({ required: true })
const orderedEvents = computed(() => [...props.events].sort(byDateTime))
const eventIndex = computed(() => orderedEvents.value.findIndex(event => event.id === openId.value))
const event = computed(() => orderedEvents.value[eventIndex.value])
const venue = computed(() => event.value ? getVenue(event.value.venue) : undefined)
const images = computed(() => event.value?.posters?.length ? event.value.posters : [''])
const photoIndex = ref(0)
const photoTrack = ref<HTMLElement>()
const failedPosters = ref<Record<string, boolean>>({})
const onImageError = (e: Event) => {
  const src = (e.target as HTMLImageElement).getAttribute('src')
  if (src) failedPosters.value[src] = true
}
const artistNames = computed(() => (event.value?.artists ?? []).map(id => getArtist(id)?.name).filter((name): name is string => !!name))
const { push } = useToast()
const dialog = ref<HTMLElement>()
const closeButton = ref<HTMLButtonElement>()
const details = ref<HTMLElement>()
const close = () => { openId.value = null }

const goEvent = (direction: number) => {
  const next = orderedEvents.value[eventIndex.value + direction]
  if (next) openId.value = next.id
}
const goPhoto = (index: number) => {
  const track = photoTrack.value
  if (!track) return
  const next = Math.max(0, Math.min(index, images.value.length - 1))
  track.scrollTo({
    left: next * track.clientWidth,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  })
}
const onPhotoScroll = () => {
  const track = photoTrack.value
  if (track?.clientWidth) photoIndex.value = Math.max(0, Math.min(Math.round(track.scrollLeft / track.clientWidth), images.value.length - 1))
}
watch(photoTrack, (track, _previous, onCleanup) => {
  if (!track) return
  const observer = new ResizeObserver(() => {
    track.scrollTo({ left: photoIndex.value * track.clientWidth, behavior: 'instant' })
  })
  observer.observe(track)
  onCleanup(() => observer.disconnect())
}, { flush: 'post' })
// На границе карусели клавиши переходят к соседнему мероприятию.
const step = (direction: number) => {
  const next = photoIndex.value + direction
  if (next >= 0 && next < images.value.length) goPhoto(next)
  else goEvent(direction)
}
watch(() => event.value?.id, () => {
  photoIndex.value = 0
  gesture = undefined
  if (details.value) details.value.scrollTop = 0
}, { flush: 'sync' })

let gesture: { id: number; x: number; y: number } | undefined
const onPointerDown = (e: PointerEvent) => {
  if (!e.isPrimary || e.button !== 0 || (e.target as HTMLElement).closest('button, a')) return
  gesture = { id: e.pointerId, x: e.clientX, y: e.clientY }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
const onPointerUp = (e: PointerEvent) => {
  const start = gesture
  gesture = undefined
  if (!start || start.id !== e.pointerId) return
  const dx = e.clientX - start.x
  const dy = e.clientY - start.y
  if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.4) return
  const direction = dx < 0 ? 1 : -1
  goEvent(direction)
}

const share = async () => {
  if (!event.value) return
  const url = new URL('/events', window.location.origin)
  url.searchParams.set('event', event.value.id)
  try {
    if (navigator.share) await navigator.share({ title: event.value.title, url: url.href })
    else {
      await navigator.clipboard.writeText(url.href)
      push('Ссылка на мероприятие скопирована')
    }
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) push('Не удалось поделиться ссылкой')
  }
}

const focusable = () => Array.from(dialog.value?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), [tabindex="0"]') ?? []).filter(el => el.getClientRects().length)
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') { e.preventDefault(); close(); return }
  if (e.key === 'Tab') {
    const items = focusable()
    const first = items[0]
    const last = items.at(-1)
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.value)) { e.preventDefault(); last?.focus() }
    else if (!e.shiftKey && (document.activeElement === last || !dialog.value?.contains(document.activeElement))) { e.preventDefault(); first?.focus() }
    return
  }
  if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault()
    const direction = e.key === 'ArrowRight' ? 1 : -1
    if (e.shiftKey) goEvent(direction)
    else step(direction)
  }
}

let release: (() => void) | undefined
const unlock = () => { release?.(); release = undefined }
watch(() => !!event.value, async (isOpen) => {
  if (!import.meta.client) return
  if (!isOpen) { unlock(); return }
  const previousFocus = document.activeElement as HTMLElement | null
  const { overflow, paddingRight } = document.body.style
  const stableGutter = getComputedStyle(document.documentElement).scrollbarGutter.includes('stable')
  if (!stableGutter) document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKey)
  release = () => {
    document.body.style.overflow = overflow
    document.body.style.paddingRight = paddingRight
    window.removeEventListener('keydown', onKey)
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  }
  await nextTick()
  if (event.value) closeButton.value?.focus({ preventScroll: true })
}, { immediate: true })
onBeforeUnmount(() => { if (import.meta.client) unlock() })
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 motion-reduce:transition-none" enter-from-class="opacity-0" leave-active-class="transition duration-150 motion-reduce:transition-none" leave-to-class="opacity-0">
      <div v-if="event" ref="dialog" role="dialog" aria-modal="true" :aria-label="`Афиша: ${event.title}`" tabindex="-1" class="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-black/85 px-3 py-4 backdrop-blur-xl sm:px-16 lg:px-20" @click.self="close">
        <button ref="closeButton" type="button" class="btn-icon absolute top-3 right-3 z-20 size-10 bg-[#222225] hover:bg-[#303033]" aria-label="Закрыть афишу" @click="close"><UiIcon name="x" :size="22" /></button>

        <!-- Внешние стрелки всегда переключают мероприятия, внутренние — только фото. -->
        <button v-if="eventIndex > 0" type="button" class="btn-icon absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 bg-[#222225] hover:bg-[#303033] sm:grid lg:left-5" aria-label="Предыдущая афиша" @click="goEvent(-1)"><UiIcon name="chevron-left" :size="24" /></button>
        <button v-if="eventIndex < orderedEvents.length - 1" type="button" class="btn-icon absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 bg-[#222225] hover:bg-[#303033] sm:grid lg:right-5" aria-label="Следующая афиша" @click="goEvent(1)"><UiIcon name="chevron-right" :size="24" /></button>

        <article class="relative flex max-h-[calc(100dvh-6rem)] w-full max-w-6xl flex-col overflow-y-auto rounded-3xl border border-white/10 bg-[#1c191c] shadow-2xl lg:grid lg:max-h-[86dvh] lg:grid-cols-[minmax(0,1fr)_22rem] lg:overflow-hidden">
          <header class="hidden items-center gap-3 border-b border-white/10 px-5 py-4 sm:flex lg:hidden">
            <UiIcon name="calendar" class="text-accent-text" />
            <NuxtLink v-if="venue" :to="`/venues/${venue.slug}`" class="min-w-0 truncate pr-10 font-semibold hover:text-sand" @click="close">{{ venue.name }}</NuxtLink>
            <span v-else class="font-semibold">Joined / Афиша</span>
          </header>

          <div class="relative isolate h-[calc(100dvh-6rem)] w-full min-w-0 shrink-0 overflow-hidden bg-ink select-none sm:aspect-4/5 sm:h-auto sm:max-h-[58dvh] lg:aspect-auto lg:h-[min(82dvh,48rem)] lg:max-h-none" aria-roledescription="карусель" aria-label="Фотографии афиши" @dragstart.prevent>
            <div
              :key="event.id"
              ref="photoTrack"
              class="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              @scroll.passive="onPhotoScroll"
            >
              <div v-for="(src, index) in images" :key="index" class="relative h-full w-full shrink-0 snap-center snap-always overflow-hidden">
                <EventTextPoster v-if="!src || failedPosters[src]" :event="event" :artist-names="artistNames" expanded />
                <template v-else>
                  <img :src="src" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl" draggable="false" loading="lazy">
                  <img :src="src" :alt="`${event.title} — фото ${index + 1} из ${images.length}`" class="relative h-full w-full object-contain" draggable="false" loading="lazy" @error="onImageError">
                </template>
              </div>
            </div>
            <span v-if="images.length > 1" class="pointer-events-none absolute top-4 left-4 rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-xs font-semibold tabular-nums backdrop-blur-md">{{ photoIndex + 1 }} / {{ images.length }}</span>
            <button v-if="photoIndex > 0" type="button" class="btn-icon absolute top-1/2 left-3 size-9 -translate-y-1/2 rounded-full bg-black/65 hover:bg-black/85" aria-label="Предыдущее фото" @click="goPhoto(photoIndex - 1)"><UiIcon name="chevron-left" :size="20" /></button>
            <button v-if="photoIndex < images.length - 1" type="button" class="btn-icon absolute top-1/2 right-3 size-9 -translate-y-1/2 rounded-full bg-black/65 hover:bg-black/85" aria-label="Следующее фото" @click="goPhoto(photoIndex + 1)"><UiIcon name="chevron-right" :size="20" /></button>
          </div>

          <aside ref="details" class="flex min-h-0 flex-col touch-pan-y lg:overflow-y-auto" @pointerdown="onPointerDown" @pointerup="onPointerUp" @pointercancel="gesture = undefined">
            <header class="hidden items-center gap-3 border-b border-white/10 px-6 py-5 lg:flex">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-text"><UiIcon name="music" /></span>
              <div class="min-w-0"><NuxtLink v-if="venue" :to="`/venues/${venue.slug}`" class="block truncate font-semibold hover:text-sand" @click="close">{{ venue.name }}</NuxtLink></div>
            </header>
            <div class="flex-1 space-y-5 p-5 lg:p-6">
              <div><p class="mb-2 text-xs font-semibold tracking-wider text-accent-text uppercase">{{ event.genres.map(genreName).join(' / ') }}</p><h2 class="font-display text-2xl leading-tight font-bold wrap-break-word">{{ event.title }}</h2></div>
              <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"><span class="flex items-center gap-2"><UiIcon name="calendar" :size="17" class="text-accent-text" />{{ formatDate(event.date) }}</span><span class="flex items-center gap-2"><UiIcon name="clock" :size="17" class="text-accent-text" />{{ event.time }}</span></div>
              <p class="text-sm leading-relaxed whitespace-pre-line text-soft">{{ event.description }}</p>
              <p v-if="artistNames.length" class="text-sm leading-relaxed"><span class="text-muted">На сцене: </span>{{ artistNames.join(', ') }}</p>
              <p v-if="venue" class="flex items-start gap-2 text-xs leading-relaxed text-muted"><UiIcon name="pin" :size="16" />{{ venue.address }}</p>
            </div>
            <footer class="space-y-4 border-t border-white/10 p-5 lg:p-6">
              <div class="flex items-center justify-between gap-4"><p class="text-sm text-soft">Вход <span class="ml-1 font-semibold text-white">от {{ formatPrice(minPrice(event)) }}</span></p><button type="button" class="btn-icon size-10 bg-[#282429] hover:bg-[#353036]" aria-label="Поделиться мероприятием" @click="share"><UiIcon name="share" :size="18" /></button></div>
              <NuxtLink v-if="venue" :to="`/venues/${venue.slug}?tab=booking`" class="btn-primary w-full py-3.5" @click="close">Забронировать</NuxtLink>
            </footer>
          </aside>
        </article>

        <nav class="flex w-full items-center justify-between gap-3 sm:hidden" aria-label="Навигация по афишам">
          <button type="button" class="btn-icon size-11 bg-[#222225] hover:bg-[#303033] disabled:opacity-30" :disabled="eventIndex === 0" aria-label="Предыдущая афиша" @click="goEvent(-1)"><UiIcon name="chevron-left" :size="22" /></button>
          <button type="button" class="btn-icon size-11 bg-[#222225] hover:bg-[#303033] disabled:opacity-30" :disabled="eventIndex === orderedEvents.length - 1" aria-label="Следующая афиша" @click="goEvent(1)"><UiIcon name="chevron-right" :size="22" /></button>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>
