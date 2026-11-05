<script setup lang="ts">
import { isPhone } from '@shared/lib'
import { UiIcon, UiPhoto, UiPhotoViewer } from '@shared/ui'

const props = defineProps<{ photos: string[] }>()

const route = useRoute()
const router = useRouter()
const root = ref<HTMLElement>()

// --- Десктоп: фото открывается на затемнённом экране
const current = ref<number | null>(null)

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

    <!-- Просмотр на десктопе: само фото на затемнённом экране -->
    <UiPhotoViewer v-model="current" :photos="photos" />
  </div>
</template>
