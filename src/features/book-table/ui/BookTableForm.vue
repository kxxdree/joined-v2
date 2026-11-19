<script setup lang="ts">
import { useBookings } from "@entities/booking";
import { useSession } from "@entities/session";
import type { Venue } from "@entities/venue";
import { formatDay, formatPrice, todayISO, useToast } from "@shared/lib";
import { UiIcon, UiPaymentSheet } from "@shared/ui";

const props = defineProps<{ venue: Venue }>();

const { requireAuth } = useSession();
const { add } = useBookings();
const { push } = useToast();

const slots = ["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
const form = reactive({ date: todayISO(), time: "20:00", guests: 2, comment: "" });
const deposit = computed(() => form.guests * props.venue.booking.deposit);
const payOpen = ref(false);

const start = () => {
  if (requireAuth()) payOpen.value = true;
};
const onPaid = () => {
  add({ venue: props.venue.slug, date: form.date, time: form.time, guests: form.guests, deposit: deposit.value, comment: form.comment });
  push("Столик забронирован!");
};
</script>

<template>
  <form class="card p-6 sm:p-8" @submit.prevent="start">
    <h2 class="mb-6 text-2xl font-medium">Забронировать столик</h2>
    <div class="grid gap-5">
      <label>
        <span class="label">Дата</span>
        <input v-model="form.date" type="date" :min="todayISO()" required class="field" />
      </label>
      <div>
        <span class="label">Время</span>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <button v-for="s in slots" :key="s" type="button" class="pill justify-center" :class="{ 'pill-active': form.time === s }" @click="form.time = s">
            {{ s }}
          </button>
        </div>
      </div>
      <div>
        <span class="label">Количество гостей</span>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <button type="button" class="btn-icon size-10" :disabled="form.guests <= venue.booking.minGuests" aria-label="Меньше" @click="form.guests--">
              <UiIcon name="minus" :size="18" />
            </button>
            <span class="w-10 text-center text-xl font-medium">{{ form.guests }}</span>
            <button type="button" class="btn-icon size-10" :disabled="form.guests >= venue.booking.maxGuests" aria-label="Больше" @click="form.guests++">
              <UiIcon name="plus" :size="18" />
            </button>
          </div>
          <span class="text-sm text-muted">до {{ venue.booking.maxGuests }} человек</span>
        </div>
      </div>
      <label>
        <span class="label">Пожелания</span>
        <textarea v-model="form.comment" rows="3" class="field resize-none" placeholder="Например: столик у сцены, день рождения" />
      </label>
    </div>
    <div class="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-muted">Депозит ({{ form.guests }} × {{ formatPrice(venue.booking.deposit) }})</p>
        <p class="text-4xl font-medium">{{ formatPrice(deposit) }}</p>
      </div>
      <button class="btn-primary px-8 py-4" type="submit">Внести депозит</button>
    </div>

    <UiPaymentSheet
      v-model="payOpen"
      :amount="deposit"
      :title="`Депозит · ${venue.name}`"
      :lines="[
        { label: 'Дата', value: `${formatDay(form.date)}, ${form.time}` },
        { label: 'Гостей', value: String(form.guests) },
      ]"
      @paid="onPaid"
    />
  </form>
</template>
