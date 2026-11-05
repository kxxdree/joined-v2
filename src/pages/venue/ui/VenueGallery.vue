<script setup lang="ts">
import { isPhone } from '@shared/lib'
import { UiIcon, UiModal, UiPhoto } from '@shared/ui'

const props = defineProps<{ photos: string[] }>()

const route = useRoute()
const router = useRouter()
const root = ref<HTMLElement>()

// --- Десктоп: фото открывается на затемнённом экране
const current = ref<number | null>(null)
const open = computed({ get: () => current.value !== null, set: (v) => { if (!v) current.value = null } })
const step = (d: number) => {
  if (current.value !== null) current.value = Math.min(Math.max(current.value + d, 0), props.photos.length - 1)
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
watch(open, (v) => {
  if (!import.meta.client) return
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('keydown', onKey)
})

// --- Телефон: сетка становится лентой в одну колонку, начиная с нажатого фото.
// Состояние в адресе (?feed=3): системная кнопка «Назад» возвращает к сетке, а не уводит со страницы
const feedIndex = computed(() => {
  const n = Number(route.query.feed)
  return route.query.feed !== undefined && Number.isInteger(n) && n >= 0 && n < props.photos.length ? n : null
})
const feed = computed(() => feedIndex.value !== null)

let pushed = false
const openPhoto = (i: number) => {
  if (!isPhone()) {
    current.value = i
    return
  }
  if (feed.value) return // в ленте фото уже открыто
  pushed = true
  router.push({ query: { ...route.query, feed: i } })
}
const closeFeed = () => {
  if (pushed) return router.back()
  // пришли по прямой ссылке - возвращаться некуда, просто убираем параметр
  const { feed: _, ...query } = route.query
  router.replace({ query })
}

const scrollToTile = (i: number) => {
  root.value?.querySelector(`[data-tile="${i}"]`)?.scrollIntoView({ block: 'start', behavior: 'instant' })
}
// и при входе в ленту, и при возврате к сетке - остаёмся на том же фото
watch(feedIndex, (i, prev) => {
  const target = i ?? prev
  if (target !== null && target !== undefined) nextTick(() => scrollToTile(target))
})
onMounted(() => {
  if (feedIndex.value !== null && isPhone()) scrollToTile(feedIndex.value)
})
</script>

<template>
  <div ref="root">
    <!-- Лента на телефоне: кнопка возврата к сетке плавает поверх фото под вкладками (h-0 - не занимает места) -->
    <div v-if="feed" class="sticky top-34 z-20 h-0 px-3 sm:hidden">
      <button
        type="button"
        class="inline-flex h-10 items-center gap-1 rounded-full bg-black/45 pr-4 pl-2.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-md"
        @click="closeFeed"
      >
        <UiIcon name="chevron-left" :size="18" /> Все фото
      </button>
    </div>

    <!-- Сетка как в профиле соцсети: три колонки, на больших экранах пять; вертикальные фото, тонкие зазоры.
         В ленте на телефоне - одна колонка. Пропорции фиксированы: прокрутка к фото не сбивается, пока грузятся картинки -->
    <div class="grid gap-0.5 lg:grid-cols-5" :class="feed ? 'max-sm:grid-cols-1 sm:grid-cols-3' : 'grid-cols-3'">
      <button
        v-for="(src, i) in photos"
        :key="src"
        type="button"
        class="block scroll-mt-32 sm:scroll-mt-36"
        :data-tile="i"
        :aria-label="`Открыть фото ${i + 1}`"
        @click="openPhoto(i)"
      >
        <UiPhoto :src="src" :alt="`Фото ${i + 1}`" class="aspect-3/4" :class="{ 'max-sm:aspect-4/5': feed }" />
      </button>
    </div>

    <!-- Просмотр на десктопе: само фото на затемнённом экране, клик мимо закрывает -->
    <UiModal v-model="open" bare>
      <button type="button" class="absolute top-5 right-5 grid size-10 place-items-center text-white/80 transition-colors hover:text-white" aria-label="Закрыть" @click="open = false">
        <UiIcon name="x" :size="26" />
      </button>
      <div v-if="current !== null" class="relative" role="dialog" aria-modal="true" :aria-label="`Фото ${current + 1} из ${photos.length}`">
        <img :src="photos[current]" :alt="`Фото ${current + 1}`" class="block max-h-[calc(100dvh-3rem)] max-w-[calc(100vw-7rem)] object-contain">
        <button v-if="current > 0" type="button" class="absolute top-1/2 left-3 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink transition-colors hover:bg-white" aria-label="Предыдущее фото" @click="step(-1)">
          <UiIcon name="chevron-left" :size="20" />
        </button>
        <button v-if="current < photos.length - 1" type="button" class="absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 text-ink transition-colors hover:bg-white" aria-label="Следующее фото" @click="step(1)">
          <UiIcon name="chevron-right" :size="20" />
        </button>
        <div class="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden="true">
          <span v-for="(_, i) in photos" :key="i" class="size-1.5 rounded-full transition-colors" :class="i === current ? 'bg-white' : 'bg-white/40'" />
        </div>
      </div>
    </UiModal>
  </div>
</template>
