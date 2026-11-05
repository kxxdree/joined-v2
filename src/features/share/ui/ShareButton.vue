<script setup lang="ts">
import { useToast } from '@shared/lib'
import { UiIcon } from '@shared/ui'

const props = defineProps<{ title: string }>()
const { push } = useToast()

const share = async () => {
  const url = window.location.href
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
