<script setup lang="ts">
import { parseHours } from '../model/hours';
import EditorTimeSelect from './EditorTimeSelect.vue';

defineProps<{ day: string }>();
const model = defineModel<string>({ required: true });
const initial = parseHours(model.value);
const opening = ref(initial?.opening ?? '');
const closing = ref(initial?.closing ?? '');
const closed = ref(model.value.trim() === 'Закрыто');
const value = computed(() => closed.value ? 'Закрыто' : `${opening.value}–${closing.value}`);

watch(value, (time) => { model.value = time; });
watch(model, (time) => {
  if (time === value.value) return;
  const parsed = parseHours(time);
  closed.value = time.trim() === 'Закрыто';
  opening.value = parsed?.opening ?? '';
  closing.value = parsed?.closing ?? '';
});
</script>

<template>
  <fieldset class="min-w-0 border-b border-line py-4">
    <legend class="font-medium">{{ day }}</legend>
    <label class="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm">
      <input v-model="closed" type="checkbox" class="size-4 accent-white" :aria-label="`${day}: выходной`">
      Выходной
    </label>
    <div v-if="!closed" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <EditorTimeSelect v-model="opening" :label="`Открытие (${day})`" />
      <EditorTimeSelect v-model="closing" :label="`Закрытие (${day})`" />
    </div>
  </fieldset>
</template>
