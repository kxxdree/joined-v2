<script setup lang="ts">
import { useCurrentCity } from '@entities/city'
import { isPhone, useToast } from '@shared/lib'
import { UiIcon, UiModal } from '@shared/ui'

// inline - без «пилюли», для встраивания в строку поиска; на телефоне выбор открывается нижней модалкой (sheet: false - всегда выпадашка,
// modal - всегда модалка, и на десктопе)
const props = withDefaults(defineProps<{ inline?: boolean; sheet?: boolean; modal?: boolean }>(), { sheet: true })

const { cityId, city, cities, detect, locating } = useCurrentCity()
const { push } = useToast()
const open = ref(false)
const asSheet = ref(false)
const root = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? cities.filter(c => c.name.toLowerCase().includes(q)) : cities
})

const toggle = () => {
  asSheet.value = props.modal || (props.sheet && isPhone())
  open.value = !open.value
}

// при открытии - фокус в поиск (в модалке на телефоне - нет, чтобы не выскакивала клавиатура), при закрытии - сброс запроса
watch(open, (v) => {
  if (v && !asSheet.value) nextTick(() => input.value?.focus())
  else if (!v) query.value = ''
})

const pick = (id: string) => {
  cityId.value = id
  open.value = false
}

const onDetect = async () => {
  const id = await detect()
  open.value = false
  push(id ? `Ваш город: ${city.value.name}` : 'Не удалось определить геолокацию')
}

// модалка телепортирована в body - клики в ней не должны закрывать её как «клик снаружи»
const onDoc = (e: MouseEvent) => {
  if (!asSheet.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onDoc))
onBeforeUnmount(() => document.removeEventListener('click', onDoc))
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" :class="inline ? 'flex h-full items-center gap-2 px-3 text-sm whitespace-nowrap transition-colors hover:text-sand' : 'pill'" :aria-expanded="open" @click="toggle">
      <UiIcon name="pin" :size="16" class="text-accent-text" />
      {{ city.name }}
      <UiIcon name="chevron-down" :size="16" class="text-muted transition-transform duration-300" :class="{ 'rotate-180': open }" />
    </button>
    <Transition
      enter-active-class="transition duration-300 ease-[var(--ease-liquid)]"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="open && !asSheet" class="absolute top-full z-40 mt-2 w-64 origin-top rounded-xl bg-[#241b1a] p-1 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)]" :class="inline ? 'left-0' : 'left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0'">
        <button type="button" class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-accent-text hover:bg-white/10" @click="onDetect">
          <UiIcon name="locate" :size="16" />
          {{ locating ? 'Определяем…' : 'Определить автоматически' }}
        </button>
        <div class="mx-3 my-1 h-px bg-line" />
        <label class="mb-1 flex items-center gap-2 rounded-lg bg-white/5 px-3">
          <UiIcon name="search" :size="16" class="shrink-0 text-muted" />
          <input
            ref="input"
            v-model="query"
            type="search"
            placeholder="Найти город"
            class="w-full bg-transparent py-2.5 text-sm placeholder:text-muted"
            aria-label="Поиск города"
            @keydown.enter.prevent="filtered[0] && pick(filtered[0].id)"
          >
        </label>
        <div class="max-h-64 overflow-y-auto">
          <button
            v-for="c in filtered"
            :key="c.id"
            type="button"
            class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/10"
            @click="pick(c.id)"
          >
            {{ c.name }}
            <UiIcon v-if="c.id === cityId" name="check" :size="16" class="text-accent-text" />
          </button>
          <p v-if="!filtered.length" class="px-3 py-2.5 text-sm text-muted">Город не найден</p>
        </div>
      </div>
    </Transition>

    <!-- Телефон (или modal): выбор в модалке, пункты крупнее -->
    <UiModal v-if="sheet || modal":model-value="open && asSheet" title="Город" panel-class="[--lg-tint:rgb(26_21_22/0.92)]" @update:model-value="open = $event">
      <div class="-mx-2">
        <button type="button" class="flex w-full items-center gap-2 rounded-lg px-3 py-3.5 text-left text-base text-accent-text hover:bg-white/10" @click="onDetect">
          <UiIcon name="locate" :size="18" />
          {{ locating ? 'Определяем…' : 'Определить автоматически' }}
        </button>
        <label class="my-2 flex items-center gap-2 rounded-lg bg-white/5 px-3">
          <UiIcon name="search" :size="18" class="shrink-0 text-muted" />
          <input
            v-model="query"
            type="search"
            placeholder="Найти город"
            class="w-full bg-transparent py-3 text-base placeholder:text-muted"
            aria-label="Поиск города"
            @keydown.enter.prevent="filtered[0] && pick(filtered[0].id)"
          >
        </label>
        <!-- фиксированная высота: окно не ужимается при фильтрации -->
        <div class="h-[min(24rem,50dvh)] overflow-y-auto">
          <button
            v-for="c in filtered"
            :key="c.id"
            type="button"
            class="flex w-full items-center justify-between rounded-lg px-3 py-3.5 text-left text-base hover:bg-white/10"
            @click="pick(c.id)"
          >
            {{ c.name }}
            <UiIcon v-if="c.id === cityId" name="check" :size="18" class="text-accent-text" />
          </button>
          <p v-if="!filtered.length" class="px-3 py-3.5 text-base text-muted">Город не найден</p>
        </div>
      </div>
    </UiModal>
  </div>
</template>
