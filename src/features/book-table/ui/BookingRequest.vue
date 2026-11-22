<script setup lang="ts">
import { useSession } from '@entities/session'
import type { Venue } from '@entities/venue'
import { UiModal } from '@shared/ui'

defineProps<{ venue: Venue; hideTrigger?: boolean }>()
const { user } = useSession()
const open = defineModel<boolean>('open', { default: false })
const error = ref('')
const nameInput = ref<HTMLInputElement>()
const form = reactive({ name: '', phone: '' })
let previousFocus: HTMLElement | null = null

const formatPhone = (value: string) => {
  if (/^\s*\+/.test(value) && !/^\s*\+7/.test(value)) return ''
  let digits = value.replace(/\D/g, '')
  if (value.trim().startsWith('+7') || ([1, 11].includes(digits.length) && /^[78]/.test(digits))) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (!digits) return value ? '+7' : ''
  let result = `+7 (${digits.slice(0, 3)}`
  if (digits.length >= 3) result += ') '
  result += digits.slice(3, 6)
  if (digits.length > 6) result += `-${digits.slice(6, 8)}`
  if (digits.length > 8) result += `-${digits.slice(8, 10)}`
  return result
}

const updatePhone = (input: HTMLInputElement, value: string, cursor: number) => {
  let digitsBeforeCursor = value.slice(0, cursor).replace(/\D/g, '').length
  const digits = value.replace(/\D/g, '')
  if (digits && !value.trim().startsWith('+7') && !([1, 11].includes(digits.length) && /^[78]/.test(digits))) digitsBeforeCursor++
  form.phone = formatPhone(value)
  input.value = form.phone
  let position = 0
  let count = 0
  while (position < input.value.length && count < digitsBeforeCursor) {
    if (/\d/.test(input.value[position]!)) count++
    position++
  }
  input.setSelectionRange(position, position)
}

const onPhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  updatePhone(input, input.value, input.selectionStart ?? input.value.length)
}

// При удалении скобок и пробелов удаляем соседнюю цифру, чтобы маска не мешала редактированию.
const onPhoneBeforeInput = (event: Event) => {
  const inputEvent = event as InputEvent
  if (!['deleteContentBackward', 'deleteContentForward'].includes(inputEvent.inputType)) return
  const input = event.target as HTMLInputElement
  const cursor = input.selectionStart ?? 0
  if (cursor !== input.selectionEnd) return
  const backward = inputEvent.inputType === 'deleteContentBackward'
  let index = backward ? cursor - 1 : cursor
  if (index < 2 || index >= input.value.length || /\d/.test(input.value[index]!)) return
  event.preventDefault()
  while (index >= 2 && index < input.value.length && !/\d/.test(input.value[index]!)) index += backward ? -1 : 1
  if (index < 2 || index >= input.value.length) return
  updatePhone(input, input.value.slice(0, index) + input.value.slice(index + 1), backward ? index : cursor)
}

const start = () => {
  open.value = true
}

watch(open, async (value) => {
  if (value) {
    form.name = user.value?.name ?? ''
    form.phone = ''
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
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const submit = () => {
  error.value = ''
  const name = form.name.trim()
  const digits = form.phone.replace(/\D/g, '')
  if (name.length < 2) {
    error.value = 'Введите имя - не менее двух символов.'
    nameInput.value?.focus()
    return
  }
  if (!/^7[3489]\d{9}$/.test(digits)) {
    error.value = 'Проверьте номер телефона'
    return
  }
  open.value = false
}
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
        <input :value="form.phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (999) 123-45-67" class="field" required :aria-invalid="!!error || undefined" aria-describedby="booking-request-description booking-request-error" @input="onPhoneInput" @beforeinput="onPhoneBeforeInput">
      </label>
      <p v-if="error" id="booking-request-error" role="alert" class="text-sm text-accent-text">{{ error }}</p>
      <button type="submit" class="btn-primary w-full py-3.5">Оставить заявку</button>
    </form>
  </UiModal>
</template>
