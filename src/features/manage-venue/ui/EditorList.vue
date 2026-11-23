<script setup lang="ts">
import { UiIcon } from '@shared/ui'

defineProps<{ label: string; placeholder: string }>()
const lines = defineModel<string[]>({ required: true })
const moveLine = (index: number, direction: number) => {
  const reordered = [...lines.value]
  const target = index + direction
  if (target < 0 || target >= reordered.length) return
  ;[reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!]
  lines.value = reordered
}
</script>

<template>
  <div class="space-y-3">
    <p v-if="!lines.length" class="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">Пока ничего не добавлено. Каждый пункт гости увидят отдельной строкой.</p>
    <div v-for="(_, index) in lines" :key="index" class="rounded-2xl border border-line p-3">
      <label class="block"><span class="sr-only">{{ label }} {{ index + 1 }}</span><textarea v-model="lines[index]" class="field min-h-20" :placeholder="placeholder" /></label>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" class="btn-ghost px-3 py-2 text-sm" :disabled="index === 0" :aria-label="`${label} ${index + 1}: переместить раньше`" @click="moveLine(index, -1)">Раньше</button>
        <button type="button" class="btn-ghost px-3 py-2 text-sm" :disabled="index === lines.length - 1" :aria-label="`${label} ${index + 1}: переместить позже`" @click="moveLine(index, 1)">Позже</button>
        <button type="button" class="btn-ghost ml-auto px-3 py-2 text-sm text-accent-text" :aria-label="`Удалить: ${label} ${index + 1}`" @click="lines.splice(index, 1)"><UiIcon name="trash" :size="16" /> Удалить</button>
      </div>
    </div>
    <button type="button" class="btn-dark px-4 py-3 text-sm" @click="lines.push('')"><UiIcon name="plus" :size="16" /> Добавить пункт</button>
  </div>
</template>
