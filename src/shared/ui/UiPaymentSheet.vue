<script setup lang="ts">
import { formatPrice } from "../lib/format";
import UiIcon from "./UiIcon.vue";
import UiModal from "./UiModal.vue";
import UiQr from "./UiQr.vue";

/** Имитация оплаты: выбор способа, данные карты, обработка платежа */
const props = defineProps<{ amount: number; title: string; lines?: { label: string; value: string }[] }>();
const emit = defineEmits<{ paid: [] }>();
const open = defineModel<boolean>({ required: true });

const methods = [
  { id: "card", name: "Карта", icon: "card" },
  { id: "sbp", name: "СБП", icon: "qr" },
  { id: "wallet", name: "Кошелёк", icon: "wallet" },
];
const method = ref("card");
const card = reactive({ number: "", exp: "", cvc: "" });
const isProcessing = ref(false);

const canPay = computed(() => method.value !== "card" || (card.number.replace(/\s/g, "").length === 16 && card.exp.length === 5 && card.cvc.length === 3));

const onCardNumberInput = (e: Event) => {
  const cardNumberDigits = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 16);
  card.number = cardNumberDigits.replace(/(.{4})/g, "$1 ").trim();
};
const onCardExpiryInput = (e: Event) => {
  const expiryDigits = (e.target as HTMLInputElement).value.replace(/\D/g, "").slice(0, 4);
  card.exp = expiryDigits.length > 2 ? `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}` : expiryDigits;
};

const pay = async () => {
  isProcessing.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  isProcessing.value = false;
  open.value = false;
  emit("paid");
};

watch(open, (v) => {
  if (v) Object.assign(card, { number: "", exp: "", cvc: "" });
});
</script>

<template>
  <UiModal v-model="open" title="Оплата">
    <div class="glass-chip mb-6 rounded-3xl p-4">
      <p class="text-sm text-muted">{{ props.title }}</p>
      <dl v-if="lines?.length" class="mt-3 space-y-1.5 text-sm">
        <div v-for="paymentLine in lines" :key="paymentLine.label" class="flex justify-between gap-4">
          <dt class="text-soft">{{ paymentLine.label }}</dt>
          <dd>{{ paymentLine.value }}</dd>
        </div>
      </dl>
      <div class="mt-3 flex items-baseline justify-between border-t border-line pt-3">
        <span class="text-soft">Итого</span>
        <span class="text-3xl font-semibold">{{ formatPrice(amount) }}</span>
      </div>
    </div>

    <div class="segmented mb-5 w-full">
      <button v-for="paymentMethod in methods" :key="paymentMethod.id" type="button" class="py-2.5" :aria-pressed="method === paymentMethod.id" @click="method = paymentMethod.id">
        <UiIcon :name="paymentMethod.icon" :size="16" /> {{ paymentMethod.name }}
      </button>
    </div>

    <form class="grid gap-3" @submit.prevent="pay">
      <template v-if="method === 'card'">
        <input :value="card.number" inputmode="numeric" placeholder="0000 0000 0000 0000" class="field" aria-label="Номер карты" @input="onCardNumberInput" />
        <div class="grid grid-cols-2 gap-3">
          <input :value="card.exp" inputmode="numeric" placeholder="ММ/ГГ" class="field" aria-label="Срок действия" @input="onCardExpiryInput" />
          <input v-model="card.cvc" inputmode="numeric" maxlength="3" placeholder="CVC" type="password" class="field" aria-label="CVC" />
        </div>
      </template>
      <div v-else-if="method === 'sbp'" class="glass-chip flex items-center gap-4 rounded-3xl p-4">
        <UiQr value="https://qr.nspk.ru/demo-joined" :size="96" />
        <p class="text-sm text-soft">Отсканируйте QR-код в приложении банка или нажмите «Оплатить», чтобы открыть банк на телефоне.</p>
      </div>
      <p v-else class="glass-chip rounded-3xl p-4 text-sm text-soft">Вы будете перенаправлены в приложение кошелька для подтверждения платежа.</p>

      <button class="btn-primary mt-2 py-3.5" :disabled="!canPay || isProcessing" type="submit">
        <UiIcon v-if="isProcessing" name="refresh" :size="16" class="animate-spin" />
        {{ isProcessing ? "Обрабатываем платёж…" : `Оплатить ${formatPrice(amount)}` }}
      </button>    </form>
  </UiModal>
</template>
