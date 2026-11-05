<script setup lang="ts" generic="T extends string">
/** Ряд стеклянных пилюль-фильтров. Пустая строка / пустой массив = «Все»; variant text - постерные текстовые переключатели */
const props = withDefaults(
  defineProps<{ options: readonly { id: T; name: string }[]; allLabel?: string | false; center?: boolean; multiple?: boolean; variant?: 'pill' | 'text' }>(),
  { allLabel: 'Все', center: false, multiple: false, variant: 'pill' },
)
const model = defineModel<T | '' | T[]>({ required: true })

const isActive = (id: T | '') => {
  if (props.multiple) {
    const list = (model.value as T[]) ?? []
    return id === '' ? list.length === 0 : list.includes(id as T)
  }
  return model.value === id
}

// для текстового варианта «Все» - обычный пункт списка
const items = computed(() => (props.allLabel === false ? props.options : [{ id: '' as T | '', name: props.allLabel }, ...props.options]))

const select = (id: T | '') => {
  if (!props.multiple) return (model.value = id)
  const list = (model.value as T[]) ?? []
  if (id === '') return (model.value = [])
  model.value = list.includes(id as T) ? list.filter(x => x !== id) : [...list, id as T]
}
</script>

<template>
  <div v-if="variant === 'text'" class="flex flex-wrap gap-x-5 gap-y-2" :class="center ? 'justify-center' : ''" role="group">
    <button
      v-for="o in items"
      :key="o.id"
      type="button"
      class="flex items-center gap-2 py-1 text-xs font-semibold tracking-wider uppercase"
      :class="isActive(o.id) ? 'text-white' : 'text-muted hover:text-white'"
      :aria-pressed="isActive(o.id)"
      @click="select(o.id)"
    >
      <span class="size-1.5 rounded-full" :class="isActive(o.id) ? 'bg-accent' : 'bg-white/20'" />
      {{ o.name }}
    </button>
  </div>
  <div v-else class="scroll-x -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0" :class="center ? 'sm:justify-center' : ''" role="group">
    <button v-if="allLabel !== false" type="button" class="pill" :class="{ 'pill-active': isActive('') }" :aria-pressed="isActive('')" @click="select('')">
      {{ allLabel }}
    </button>
    <button
      v-for="o in options"
      :key="o.id"
      type="button"
      class="pill"
      :class="{ 'pill-active': isActive(o.id) }"
      :aria-pressed="isActive(o.id)"
      @click="select(o.id)"
    >
      {{ o.name }}
    </button>
  </div>
</template>
