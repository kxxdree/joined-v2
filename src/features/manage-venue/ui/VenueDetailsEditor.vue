<script setup lang="ts">
import { cities } from "@entities/city";
import { drinks, formats, type Venue } from "@entities/venue";
import { genres } from "@shared/config";
import { UiPills, UiSelect, UiYandexMap } from "@shared/ui";
import type { EditorSection } from "../model/content";
import EditorField from "./EditorField.vue";

defineProps<{ section: EditorSection; isNew: boolean }>();
const venue = defineModel<Venue>({ required: true });

</script>

<template>
  <div v-if="section === 'overview'" class="space-y-7">
    <EditorField label="Название заведения" required
      ><input v-model="venue.name" class="field" maxlength="120" placeholder="Например, Red Velvet"
    /></EditorField>
    <EditorField label="Адрес страницы" :required="isNew">
      <div class="flex items-center gap-2">
        <input v-model="venue.slug" class="field min-w-0" :readonly="!isNew" :class="!isNew ? 'text-muted' : ''" placeholder="red-velvet" />
      </div>
    </EditorField>
    <EditorField label="Короткое описание" hint="Пара предложений об атмосфере. Появится на обложке страницы и в каталоге" required>
      <textarea v-model="venue.short" rows="3" maxlength="400" class="field" placeholder="Джаз, авторские коктейли и вечера в хорошей компании." /><span
        class="mt-1 block text-right text-xs text-muted"
        >{{ venue.short.length }} / 400</span
      ></EditorField
    >
    <EditorField label="Подробно о заведении" hint="Расскажите об интерьере, музыке, кухне и о том, ради чего к вам приходят" required>
      <textarea v-model="venue.description" rows="6" class="field" placeholder="Что делает ваше заведение особенным?" />
    </EditorField>
    <EditorField label="Формат" required><UiSelect v-model="venue.format" :options="formats" :all-label="false" label="Формат заведения" /></EditorField>
    <fieldset class="min-w-0">
      <legend class="mb-3 text-sm font-medium">Музыкальные жанры <span class="text-accent-text">*</span></legend>
      <p class="mb-3 text-sm text-muted">Можно выбрать несколько. По ним гости найдут вас в каталоге</p>
      <UiPills class="mx-0! flex-wrap! px-0!" v-model="venue.genres" :options="genres" multiple :all-label="false" />
    </fieldset>
    <fieldset class="min-w-0">
      <legend class="mb-3 text-sm font-medium">Бар и кухня</legend>
      <UiPills class="mx-0! flex-wrap! px-0!" v-model="venue.drinks" :options="drinks" multiple :all-label="false" />
    </fieldset>
  </div>
  <div v-else-if="section === 'location'" class="space-y-7">
    <div class="grid gap-6 sm:grid-cols-2">
      <EditorField label="Город" required><UiSelect v-model="venue.city" :options="cities" :all-label="false" label="Город заведения" /></EditorField>
      <EditorField label="Ближайшее метро" hint="Необязательно, если в городе нет метро"
        ><input v-model="venue.metro" class="field" placeholder="Маяковская"
      /></EditorField>
    </div>
    <EditorField label="Адрес" required><input v-model="venue.address" class="field" placeholder="Улица, дом, корпус" /></EditorField>
    <EditorField label="Как добраться" hint="Например: вход со двора, второй этаж, рядом есть парковка">
      <textarea v-model="venue.directions" rows="3" class="field" />
    </EditorField>
    <div class="rounded-2xl bg-white/4 p-5">
      <h3 class="font-medium">Точка на карте</h3>
      <p class="mt-2 mb-5 text-sm text-muted">Скопируйте координаты из Яндекс Карт: сначала широта, затем долгота</p>
      <div class="grid gap-4 sm:grid-cols-2">
        <EditorField label="Широта" required
          ><input v-model.number="venue.lat" type="number" step="any" min="-90" max="90" class="field" placeholder="55.7558" /></EditorField
        ><EditorField label="Долгота" required
          ><input v-model.number="venue.lng" type="number" step="any" min="-180" max="180" class="field" placeholder="37.6173"
        /></EditorField>
      </div>
      <div v-if="Number.isFinite(venue.lat) && Number.isFinite(venue.lng)" class="mt-5 h-52 overflow-hidden rounded-xl">
        <UiYandexMap :lat="venue.lat" :lng="venue.lng" :title="venue.name" />
      </div>
    </div>
    <EditorField label="Телефон для гостей" required><input v-model="venue.phone" type="tel" class="field" placeholder="+7 (999) 123-45-67" /></EditorField>
    <div class="grid gap-6 sm:grid-cols-2">
      <EditorField label="Telegram"
        ><input v-model="venue.telegram" class="field" placeholder="@redvelvet" /></EditorField
      ><EditorField label="Instagram"
        ><input v-model="venue.instagram" class="field" placeholder="@redvelvet"
      /></EditorField>
    </div>
  </div>
  <div v-else-if="section === 'hours'" class="space-y-5">
    <div v-for="day in venue.hours" :key="day.day" class="flex flex-wrap items-center gap-4 border-b border-line py-3">
      <label class="flex w-full items-center gap-5"
        ><span class="w-12 shrink-0 font-medium">{{ day.day }}</span
        ><input v-model="day.time" class="field flex-1" :aria-label="`Часы работы: ${day.day}`" placeholder="18:00–02:00 или Закрыто"
      /></label>
    </div>
  </div>
</template>
