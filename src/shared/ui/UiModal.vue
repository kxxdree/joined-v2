<script lang="ts">
// стек открытых окон - общий для всех UiModal, живёт только на клиенте
const stack: symbol[] = [];
</script>

<script setup lang="ts">
import UiIcon from "./UiIcon.vue";

/** panelClass - доп. классы для самой панели (например, плотнее фон);
 * glass - лёгкое стекло .glass-modal. Размывает страницу слой-затемнение: он «корень фона» для панели,
 * поэтому собственный blur панели страницу не видит */
withDefaults(defineProps<{ title?: string; wide?: boolean; panelClass?: string; glass?: boolean }>(), { wide: false, panelClass: "", glass: false });
const open = defineModel<boolean>({ required: true });

const id = Symbol("modal");

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape" && stack.at(-1) === id) open.value = false;
};
const release = () => {
  const i = stack.indexOf(id);
  if (i === -1) return;
  stack.splice(i, 1);
  if (!stack.length) {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }
  window.removeEventListener("keydown", onKey);
};
watch(open, (v) => {
  if (!import.meta.client) return;
  if (v) {
    if (!stack.length) document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    stack.push(id);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
  } else release();
});
onBeforeUnmount(() => {
  if (import.meta.client) release();
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-[var(--ease-liquid)]"
      enter-from-class="opacity-0 [&>div]:translate-y-6 [&>div]:scale-[0.98]"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 sm:items-center sm:p-6"
        :class="glass ? 'backdrop-blur-lg' : 'backdrop-blur-[3px]'"
        @click.self="open = false"
      >
        <div
          role="dialog"
          aria-modal="true"
          class="glass-strong lg-refract max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] p-5 transition-transform duration-300 [--lg-refract-blur:30px] sm:rounded-[2rem] sm:p-8"
          :class="[wide ? 'sm:max-w-3xl' : 'sm:max-w-lg', { 'glass-modal': glass }, panelClass]"
        >
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25 sm:hidden" />
          <div class="mb-6 flex items-start justify-between gap-4">
            <h2 class="text-2xl font-medium tracking-tight">{{ title }}</h2>
            <button class="btn-icon size-9" aria-label="Закрыть" @click="open = false">
              <UiIcon name="x" :size="18" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
