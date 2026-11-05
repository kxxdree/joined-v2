<script setup lang="ts">
import { useToast } from '@shared/lib'
import { UiIcon } from '@shared/ui'

/** url - чем поделиться; без него текущая страница */
const props = defineProps<{ title: string; url?: string }>()
const { push } = useToast()

const share = async () => {
  const url = new URL(props.url ?? '', window.location.href).href
  if (navigator.share) {
    await navigator.share({ title: props.title, url }).catch(() => {})
    return
  }
  await navigator.clipboard.writeText(url)
  push('Ссылка скопирована')
}
</script>

<template>
  <button type="button" class="btn-icon" aria-label="Поделиться" @click="share">
    <UiIcon name="share" />
  </button>
</template>
