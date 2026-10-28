<script setup lang="ts" generic="T extends string">
import { isPhone } from '@shared/lib'
import UiIcon from './UiIcon.vue'
import UiModal from './UiModal.vue'

/**
 * Стеклянный выпадающий список вместо нативного select. Пустая строка = allLabel; allLabel false - без пункта «Все»;
 * inline - без «пилюли», для строки поиска; на телефоне выбор открывается нижней модалкой (sheet: false - всегда выпадашка,
 * modal - всегда модалка, и на десктопе)
 */
const props = withDefaults(
  defineProps<{ options: readonly { id: T; name: string }[]; allLabel?: string | false; icon?: string; label?: string; inline?: boolean; sheet?: boolean; modal?: boolean }>(),
  { allLabel: 'Все', icon: undefined, label: undefined, sheet: true },
)
const model = defineModel<T | ''>({ required: true })

const open = ref(false)
const asSheet = ref(false)
const root = ref<HTMLElement>()
const current = computed(() => props.options.find(o => o.id === model.value)?.name ?? (props.allLabel || ''))
const items = computed(() => (props.allLabel === false ? props.options : [{ id: '' as T | '', name: props.allLabel }, ...props.options]))

const toggle = () => {
  asSheet.value = props.modal || (props.sheet && isPhone())
  open.value = !open.value
}

const pick = (id: T | '') => {
  model.value = id
  open.value = false
}

// модалка телепортирована в body - клики в ней не должны закрывать её как «клик снаружи»
const onDoc = (e: MouseEvent) => {
  if (!asSheet.value && root.value && !root.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onDoc))
onBeforeUnmount(() => document.removeEventListener('click', onDoc))
</script>

<template>
  <div ref="root" class="relative" @keydown.esc="open = false">
    <button type="button" class="w-full justify-between" :class="inline ? 'flex h-full items-center gap-2 px-3 text-sm transition-colors hover:text-sand' : 'pill'" :aria-expanded="open" aria-haspopup="listbox" :aria-label="label" @click="toggle">
      <span class="flex min-w-0 items-center gap-2">
        <UiIcon v-if="icon" :name="icon" :size="16" class="shrink-0 text-accent-text" />
        <span class="truncate">{{ current }}</span>
      </span>
      <UiIcon name="chevron-down" :size="16" class="shrink-0 text-muted transition-transform duration-300" :class="{ 'rotate-180': open }" />
    </button>
    <Transition
      enter-active-class="transition duration-300 ease-[var(--ease-liquid)]"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="open && !asSheet" role="listbox" class="absolute top-full z-40 mt-2 origin-top rounded-xl bg-[#241b1a] p-1 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.8)]" :class="inline ? 'left-0 w-64 max-w-[calc(100vw-2rem)]' : 'right-0 left-0 sm:left-auto sm:w-64'">
        <button
          v-for="o in items"
          :key="o.id"
          type="button"
          role="option"
          :aria-selected="o.id === model"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-white/10"
          @click="pick(o.id)"
        >
          {{ o.name }}
          <UiIcon v-if="o.id === model" name="check" :size="16" class="text-accent-text" />
        </button>
      </div>
    </Transition>

    <!-- Телефон (или modal): выбор в модалке, пункты крупнее -->
    <UiModal v-if="sheet || modal":model-value="open && asSheet" :title="label" panel-class="[--lg-tint:rgb(26_21_22/0.92)]" @update:model-value="open = $event">
      <div role="listbox" class="-mx-2">
        <button
          v-for="o in items"
          :key="o.id"
          type="button"
          role="option"
          :aria-selected="o.id === model"
          class="flex w-full items-center justify-between rounded-lg px-3 py-3.5 text-left text-base hover:bg-white/10"
          @click="pick(o.id)"
        >
          {{ o.name }}
          <UiIcon v-if="o.id === model" name="check" :size="18" class="text-accent-text" />
        </button>
      </div>
    </UiModal>
  </div>
</template>
