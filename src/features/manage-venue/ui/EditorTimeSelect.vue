<script setup lang="ts">
defineProps<{ label: string }>();
const model = defineModel<string>({ required: true });
const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
const hour = computed({
  get: () => model.value.split(':')[0] ?? '',
  set: (value: string) => { model.value = `${value}:${model.value.split(':')[1] || '00'}`; },
});
const minute = computed({
  get: () => model.value.split(':')[1] ?? '',
  set: (value: string) => { model.value = `${model.value.split(':')[0] || '00'}:${value}`; },
});
</script>

<template>
  <fieldset class="min-w-0">
    <legend class="mb-2 text-sm text-muted">{{ label }}</legend>
    <div class="flex items-center gap-1.5">
      <select v-model="hour" class="field min-w-0 flex-1" :aria-label="`${label}: часы`">
        <option disabled value="">—</option>
        <option v-for="value in hours" :key="value" :value="value">{{ value }}</option>
      </select>
      <span aria-hidden="true">:</span>
      <select v-model="minute" class="field min-w-0 flex-1" :aria-label="`${label}: минуты`">
        <option disabled value="">—</option>
        <option v-for="value in minutes" :key="value" :value="value">{{ value }}</option>
      </select>
    </div>
  </fieldset>
</template>
