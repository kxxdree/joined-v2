<script setup lang="ts">
const phone = defineModel<string>({ required: true })
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
  phone.value = formatPhone(value)
  input.value = phone.value
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

</script>

<template>
  <input :value="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (999) 123-45-67" @input="onPhoneInput" @beforeinput="onPhoneBeforeInput">
</template>