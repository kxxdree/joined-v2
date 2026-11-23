<script setup lang="ts">
const phone = defineModel<string>({ required: true })
const formatPhone = (value: string) => {
  if (/^\s*\+/.test(value) && !/^\s*\+7/.test(value)) return ''
  let digits = value.replace(/\D/g, '')
  if (value.trim().startsWith('+7') || ([1, 11].includes(digits.length) && /^[78]/.test(digits))) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (!digits) return value ? '+7' : ''
  let formattedPhone = `+7 (${digits.slice(0, 3)}`
  if (digits.length >= 3) formattedPhone += ') '
  formattedPhone += digits.slice(3, 6)
  if (digits.length > 6) formattedPhone += `-${digits.slice(6, 8)}`
  if (digits.length > 8) formattedPhone += `-${digits.slice(8, 10)}`
  return formattedPhone
}

const updatePhone = (input: HTMLInputElement, value: string, cursor: number) => {
  let digitsBeforeCursor = value.slice(0, cursor).replace(/\D/g, '').length
  const digits = value.replace(/\D/g, '')
  if (digits && !value.trim().startsWith('+7') && !([1, 11].includes(digits.length) && /^[78]/.test(digits))) digitsBeforeCursor++
  phone.value = formatPhone(value)
  input.value = phone.value
  let cursorPosition = 0
  let digitsCounted = 0
  while (cursorPosition < input.value.length && digitsCounted < digitsBeforeCursor) {
    if (/\d/.test(input.value[cursorPosition]!)) digitsCounted++
    cursorPosition++
  }
  input.setSelectionRange(cursorPosition, cursorPosition)
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

</script>

<template>
  <input :value="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (999) 123-45-67" @input="onPhoneInput" @beforeinput="onPhoneBeforeInput">
</template>