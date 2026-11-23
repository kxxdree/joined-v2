<script setup lang="ts">
import { useSession } from '@entities/session'
import type { Venue } from '@entities/venue'
import { UiModal, UiRussianPhoneInput } from '@shared/ui'
import { isRussianPhone } from '@shared/lib'

defineProps<{ venue: Venue; hideTrigger?: boolean }>()
const open = defineModel<boolean>('open', { default: false })

const { user } = useSession()
const error = ref('')
const nameInput = ref<HTMLInputElement>()
const form = reactive({ name: '', phone: '' })
let previousFocus: HTMLElement | null = null

const start = () => {
  open.value = true
}

watch(open, async (value) => {
  if (value) {
    form.name = user.value?.name ?? ''
    form.phone = user.value?.phone ?? ''
    error.value = ''
    previousFocus = document.activeElement as HTMLElement | null
    await nextTick()
    nameInput.value?.focus({ preventScroll: true })
  } else if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
})

const onKeydown = (event: KeyboardEvent) => {
  if (!open.value || event.key !== 'Tab') return
  const dialog = (event.target as HTMLElement).closest('[role="dialog"]')
  const items = Array.from(dialog?.querySelectorAll<HTMLElement>('button, input, a[href]') ?? [])
  const first = items[0]
  const last = items.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
const submit = () => {
  error.value = ''
  const name = form.name.trim()
  if (name.length < 2) {
    error.value = 'Введите имя - не менее двух символов.'
    nameInput.value?.focus()
    return
  }
  if (!isRussianPhone(form.phone)) {
    error.value = 'Проверьте номер телефона'
    return
  }
  open.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <button v-if="!hideTrigger" type="button" class="btn-primary w-full px-5 py-3.5 sm:w-auto" @click="start">
    <span>Оставить заявку на бронирование</span>
  </button>

  <UiModal v-model="open" title="Заявка на бронирование" glass>
    <form class="grid gap-5" novalidate @submit.prevent="submit">
      <div>
        <p class="mb-2 text-sm font-medium">{{ venue.name }}</p>
        <p id="booking-request-description" class="text-sm leading-relaxed text-soft">Оставьте имя и номер телефона - с вами свяжутся, чтобы уточнить детали и подтвердить бронирование</p>
      </div>
      <label>
        <span class="label">Имя</span>
        <input ref="nameInput" v-model="form.name" name="name" autocomplete="name" placeholder="Введите имя" class="field" required minlength="2" maxlength="80" :aria-invalid="!!error || undefined" aria-describedby="booking-request-error">
      </label>
      <label>
        <span class="label">Номер телефона</span>
        <UiRussianPhoneInput v-model="form.phone" name="phone" class="field" required :aria-invalid="!!error || undefined" aria-describedby="booking-request-description booking-request-error" />
      </label>
      <p v-if="error" id="booking-request-error" role="alert" class="text-sm text-accent-text">{{ error }}</p>
      <button type="submit" class="btn-primary w-full py-3.5">Оставить заявку</button>
    </form>
  </UiModal>
</template>
