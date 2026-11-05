<script setup lang="ts" generic="T extends string">
import UiIcon from './UiIcon.vue'

/** Разделы страницы: стеклянные пилюли с иконками, прилипают под шапкой сайта; лента сама прокручивается к активной */
defineProps<{ tabs: readonly { id: T; name: string; icon: string; badge?: number }[] }>()
const model = defineModel<T>({ required: true })

const track = ref<HTMLElement>()
const reveal = () => {
  const el = track.value
  const btn = el?.querySelector<HTMLElement>('[aria-pressed=true]')
  if (el && btn) el.scrollTo({ left: btn.offsetLeft - (el.clientWidth - btn.offsetWidth) / 2, behavior: 'smooth' })
}
watch(model, () => nextTick(reveal))
onMounted(reveal)
</script>

<template>
  <nav class="sticky top-19 z-30 mt-3 sm:top-20" aria-label="Разделы">
    <div ref="track" class="scroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="pill h-11 px-4 py-0"
        :class="{ 'pill-active': model === t.id }"
        :aria-pressed="model === t.id"
        @click="model = t.id"
      >
        <UiIcon :name="t.icon" :size="18" />
        {{ t.name }}
        <span v-if="t.badge" class="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">{{ t.badge }}</span>
      </button>
    </div>
  </nav>
</template>
