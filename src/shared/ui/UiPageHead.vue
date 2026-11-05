<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import UiPhoto from './UiPhoto.vue'

/** Шапка страницы, как в профиле: назад, аватар (фото или буква), название с короткой подписью, действия справа (слот actions) */
defineProps<{ title: string; caption?: string; back?: string; backLabel?: string; photo?: string; initial?: string }>()
</script>

<template>
  <div class="flex items-center gap-3 pt-2">
    <NuxtLink v-if="back" :to="back" class="btn-icon size-10" :aria-label="backLabel ?? 'Назад'"><UiIcon name="chevron-left" :size="20" /></NuxtLink>
    <UiPhoto v-if="photo" :src="photo" :alt="title" class="size-12 shrink-0 rounded-full" />
    <div v-else-if="initial" class="grid size-12 shrink-0 place-items-center rounded-full bg-white text-lg font-semibold text-ink uppercase">{{ initial }}</div>
    <div class="min-w-0 flex-1">
      <h1 class="page-title truncate">{{ title }}</h1>
      <p v-if="caption || $slots.caption" class="mono-cap mt-1"><slot name="caption">{{ caption }}</slot></p>
    </div>
    <slot name="actions" />
  </div>
</template>
