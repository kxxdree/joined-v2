<script setup lang="ts">
import type { Ref } from 'vue'
import { UiIcon } from '@shared/ui'
import { isImageSource } from '../model/content'

const props = withDefaults(defineProps<{ label: string; single?: boolean }>(), { single: false })
const images = defineModel<string[]>({ required: true })
const pendingUploads = inject<Ref<number>>('venue-editor-upload-count', ref(0))
const imageUrl = ref('')
const error = ref('')
const isUploading = ref(false)
const addUrl = () => {
  const url = imageUrl.value.trim()
  if (!isImageSource(url) || url.startsWith('data:')) { error.value = 'Укажите ссылку https://… или загрузите изображение с устройства.'; return }
  if (images.value.includes(url)) { error.value = 'Это изображение уже добавлено.'; return }
  images.value = props.single ? [url] : [...images.value, url]
  imageUrl.value = ''
  error.value = ''
}
const moveImage = (index: number, direction: number) => {
  const reordered = [...images.value]
  const target = index + direction
  if (target < 0 || target >= reordered.length) return
  ;[reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!]
  images.value = reordered
}
const readImage = (file: File) => new Promise<string>((resolve, reject) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    reject(new Error(`${file.name}: нужен JPG, PNG или WebP до 10 МБ.`)); return
  }
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => {
    try {
      const scale = Math.min(1, 2000 / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Не удалось обработать изображение.')
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    } catch { reject(new Error(`${file.name}: не удалось обработать изображение.`)) }
    finally { URL.revokeObjectURL(url) }
  }
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`${file.name}: файл повреждён или не поддерживается.`)) }
  image.src = url
})
const uploadImages = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (!files.length) return
  isUploading.value = true
  pendingUploads.value++
  error.value = ''
  const uploaded: string[] = []
  try {
    for (const file of (props.single ? files.slice(0, 1) : files)) uploaded.push(await readImage(file))
    images.value = props.single ? uploaded : [...images.value, ...uploaded]
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Не удалось загрузить фотографии. Попробуйте ещё раз.' }
  finally { isUploading.value = false; pendingUploads.value--; input.value = '' }
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="images.length" class="grid gap-3" :class="single ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'">
      <div v-for="(image, index) in images" :key="`${index}-${image.slice(-30)}`" class="overflow-hidden rounded-2xl border border-line bg-black/20">
        <img :src="image" :alt="`${label}, изображение ${index + 1}`" class="w-full object-contain" :class="single ? 'max-h-64' : 'aspect-4/3'" loading="lazy">
        <div class="flex flex-wrap items-center gap-1 p-2">
          <span class="mr-auto px-1 text-sm text-muted">{{ index + 1 }}</span>
          <template v-if="!single">
            <button type="button" class="btn-ghost px-2 py-2 text-xs" :disabled="index === 0" :aria-label="`Фото ${index + 1}: раньше`" @click="moveImage(index, -1)">Раньше</button>
            <button type="button" class="btn-ghost px-2 py-2 text-xs" :disabled="index === images.length - 1" :aria-label="`Фото ${index + 1}: позже`" @click="moveImage(index, 1)">Позже</button>
          </template>
          <button type="button" class="btn-icon size-9 text-accent-text" :aria-label="`Удалить фото ${index + 1}`" @click="images = images.filter((_, imageIndex) => imageIndex !== index)"><UiIcon name="trash" :size="16" /></button>
        </div>
      </div>
    </div>
    <div class="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-5 text-center">
      <UiIcon name="image" :size="24" class="mx-auto mb-3 text-accent-text" />
      <p class="text-sm">{{ single ? 'Выберите фотографию для обложки' : 'Добавьте фотографии с устройства' }}</p>
      <p class="mt-1 text-sm text-muted">JPG, PNG, WebP до 10 МБ. Фото оптимизируются автоматически.</p>
      <label class="btn-dark relative mt-4 inline-flex px-4 py-3 text-sm focus-within:outline-2 focus-within:outline-white">
        {{ isUploading ? 'Обрабатываем фотографии…' : single && images.length ? 'Заменить фото' : 'Выбрать фото' }}
        <input type="file" accept="image/jpeg,image/png,image/webp" :multiple="!single" :disabled="isUploading" :aria-label="`${label}: загрузить фотографии`" class="absolute inset-0 cursor-pointer opacity-0" @change="uploadImages">
      </label>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row">
      <label class="min-w-0 flex-1"><span class="sr-only">{{ label }}: ссылка на изображение</span><input v-model="imageUrl" type="url" class="field" placeholder="Или вставьте ссылку https://…" @keydown.enter.prevent="addUrl"></label>
      <button type="button" class="btn-dark shrink-0 px-4 py-3 text-sm" :disabled="!imageUrl.trim() || isUploading" @click="addUrl">{{ single && images.length ? 'Заменить' : 'Добавить' }}</button>
    </div>
    <p v-if="error" role="alert" class="text-sm text-accent-text">{{ error }}</p>
  </div>
</template>
