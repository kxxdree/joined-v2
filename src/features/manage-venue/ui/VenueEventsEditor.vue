<script setup lang="ts">
import type { EventItem, TicketTypeId } from '@entities/event'
import { genres } from '@shared/config'
import { todayISO } from '@shared/lib'
import { UiIcon, UiModal, UiPills } from '@shared/ui'
import EditorField from './EditorField.vue'
import EditorMedia from './EditorMedia.vue'

const props = defineProps<{ venueSlug: string; cover: string }>()
const events = defineModel<EventItem[]>({ required: true })
const expandedId = ref<string | null>(null)
const pendingDeleteId = ref<string | null>(null)
const deleteOpen = computed({ get: () => pendingDeleteId.value !== null, set: (open) => { if (!open) pendingDeleteId.value = null } })
const createEvent = () => {
  const id = `custom-${crypto.randomUUID()}`
  events.value.push({ id, title: '', venue: props.venueSlug, artists: [], genres: [], date: todayISO(), time: '20:00', description: '', photo: props.cover, posters: [], tickets: [{ id: 'standard', name: 'Входной билет', desc: '', price: 0, left: 100 }] })
  expandedId.value = id
}
const addTicket = (event: EventItem) => {
  const id = (['standard', 'vip', 'table'] as TicketTypeId[]).find(id => !event.tickets.some(ticket => ticket.id === id))
  if (id) event.tickets.push({ id, name: id === 'vip' ? 'VIP' : id === 'table' ? 'Столик' : 'Входной билет', desc: '', price: 0, left: 100 })
}
const deleteEvent = () => {
  events.value = events.value.filter(event => event.id !== pendingDeleteId.value)
  pendingDeleteId.value = null
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-muted">{{ events.length }} в афише · прошедшие события тоже можно редактировать</p><button type="button" class="btn-dark px-4 py-3 text-sm" @click="createEvent"><UiIcon name="plus" :size="16" /> Добавить мероприятие</button></div>
    <div v-if="!events.length" class="rounded-2xl border border-dashed border-line p-8 text-center"><UiIcon name="music" :size="28" class="mx-auto mb-3 text-accent-text" /><h3 class="font-medium">Здесь начнётся ваша афиша</h3><p class="mt-2 text-sm text-muted">Добавьте концерт, DJ-сет или вечер живой музыки</p></div>
    <article v-for="(event, eventIndex) in events" :key="event.id" class="overflow-hidden rounded-2xl border border-line">
      <div class="flex items-center gap-3 bg-white/4 p-4">
        <button type="button" class="min-w-0 flex-1 text-left" :aria-expanded="expandedId === event.id" :aria-controls="`event-editor-${event.id}`" @click="expandedId = expandedId === event.id ? null : event.id">
          <span class="block truncate font-medium">{{ event.title || 'Новое мероприятие' }}</span><span class="mt-1 block text-sm text-muted">{{ event.date || 'Дата не выбрана' }} · {{ event.time }} · {{ expandedId === event.id ? 'Свернуть' : 'Редактировать' }}</span>
        </button>
        <button type="button" class="btn-icon size-10 text-accent-text" :aria-label="`Удалить мероприятие ${event.title || eventIndex + 1}`" @click="pendingDeleteId = event.id"><UiIcon name="trash" :size="18" /></button>
      </div>
      <div v-if="expandedId === event.id" :id="`event-editor-${event.id}`" class="space-y-6 p-4 sm:p-6">
        <EditorField label="Название мероприятия" required><input v-model="event.title" class="field" placeholder="Например, Jazz Night"></EditorField>
        <div class="grid gap-4 sm:grid-cols-2"><EditorField label="Дата" required><input v-model="event.date" type="date" class="field"></EditorField><EditorField label="Начало" required><input v-model="event.time" type="time" class="field"></EditorField></div>
        <EditorField label="Описание" required><textarea v-model="event.description" rows="4" class="field" placeholder="Программа вечера и что ждёт гостей" /></EditorField>
        <fieldset class="min-w-0"><legend class="mb-3 text-sm font-medium">Жанры *</legend><UiPills class="mx-0! flex-wrap! px-0!" v-model="event.genres" :options="genres" multiple :all-label="false" /></fieldset>
        <div><h4 class="mb-3 text-sm font-medium">Фотография мероприятия *</h4><EditorMedia :model-value="event.photo ? [event.photo] : []" single label="Фотография мероприятия" @update:model-value="event.photo = $event[0] ?? ''" /></div>
        <div><h4 class="mb-2 text-sm font-medium">Афиши и фотографии для историй</h4><p class="mb-3 text-sm text-muted">Гости смогут пролистать изображения. Если не добавлять, появится текстовая афиша</p><EditorMedia :model-value="event.posters ?? []" label="Афиши мероприятия" @update:model-value="event.posters = $event" /></div>
        <div class="space-y-3">
          <h4 class="font-medium">Билеты и стоимость</h4><p class="text-sm text-muted">Для бесплатного входа укажите цену 0 ₽. Нужен хотя бы один вариант</p>
          <div v-for="(ticket, ticketIndex) in event.tickets" :key="ticket.id" class="space-y-4 rounded-xl bg-white/4 p-4">
            <EditorField label="Название билета"><input v-model="ticket.name" class="field"></EditorField>
            <div class="grid gap-4 sm:grid-cols-2"><EditorField label="Цена, ₽"><input v-model.number="ticket.price" type="number" min="0" class="field"></EditorField><EditorField label="Осталось билетов"><input v-model.number="ticket.left" type="number" min="0" step="1" class="field"></EditorField></div>
            <EditorField label="Что входит"><textarea v-model="ticket.desc" rows="2" class="field" /></EditorField>
            <button type="button" class="btn-ghost px-3 py-2 text-sm text-accent-text" :disabled="event.tickets.length === 1" @click="event.tickets.splice(ticketIndex, 1)">Удалить вариант</button>
          </div>
          <button type="button" class="btn-dark px-4 py-3 text-sm" :disabled="event.tickets.length >= 3" @click="addTicket(event)">Добавить вариант билета</button>
        </div>
      </div>
    </article>
    <UiModal v-model="deleteOpen" title="Удалить мероприятие?">
      <p class="text-soft">Оно исчезнет из афиши после сохранения изменений</p>
      <div class="mt-6 flex flex-wrap gap-3"><button type="button" class="btn-dark px-5 py-3" @click="pendingDeleteId = null">Оставить</button><button type="button" class="btn-primary px-5 py-3" @click="deleteEvent">Удалить мероприятие</button></div>
    </UiModal>
  </div>
</template>
