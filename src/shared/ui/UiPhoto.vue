<script setup lang="ts">
/** Фото со стеклянным бликом; при ошибке загрузки остаётся градиент */
const props = withDefaults(defineProps<{ src: string; alt?: string }>(), { alt: '' })
const failed = ref(false)
const img = ref<HTMLImageElement>()

// ошибка могла случиться до гидрации, когда @error ещё не был навешан
onMounted(() => {
  if (img.value?.complete && img.value.naturalWidth === 0) failed.value = true
})
watch(() => props.src, () => { failed.value = false })
</script>

<template>
  <div class="relative overflow-hidden bg-linear-to-br from-[#ff8a52] via-[#d9501c] to-[#453027]">
    <img
      v-if="!failed"
      ref="img"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="absolute inset-0 h-full w-full object-cover text-transparent"
      @error="failed = true"
    >
    <!-- стеклянный блик сверху -->
    <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.14),transparent_35%)]" />
    <slot />
  </div>
</template>
