<script setup lang="ts">
import { cityName } from "@entities/city";
import { useSession } from "@entities/session";
import { getVenue, VenueCard, type Venue } from "@entities/venue";
import { FavoriteButton, useFavorites } from "@features/favorites";
import { isEmail, isRussianPhone } from "@shared/lib";
import { UiEmpty, UiRussianPhoneInput } from "@shared/ui";

useHead({ title: "Профиль - Joined" });

const { user } = useSession();
const { favs } = useFavorites();
const favoriteVenues = computed(() => favs.value.venues.map(getVenue).filter((venue): venue is Venue => !!venue));

const form = reactive({ name: user.value?.name ?? "", phone: user.value?.phone ?? "", email: user.value?.email ?? "" });
const errors = reactive({ name: "", phone: "", email: "" });
const saved = ref(false);
const dirty = computed(() => form.name !== (user.value?.name ?? "") || form.phone !== (user.value?.phone ?? "") || form.email !== (user.value?.email ?? ""));

const reset = () => {
  form.name = user.value?.name ?? "";
  form.phone = user.value?.phone ?? "";
  form.email = user.value?.email ?? "";
  errors.name = errors.phone = errors.email = "";
  saved.value = false;
};
watch(form, () => {
  saved.value = false;
});

const formElement = ref<HTMLFormElement>();
const save = async () => {
  if (!user.value) return;
  errors.name = form.name.trim().length < 2 ? "Введите имя — не менее двух символов." : "";
  errors.phone = form.phone && !isRussianPhone(form.phone) ? "Введите российский номер полностью." : "";
  errors.email = !isEmail(form.email.trim()) ? "Введите корректный email." : "";
  if (Object.values(errors).some(Boolean)) {
    await nextTick();
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }
  user.value = { ...user.value, name: form.name.trim(), phone: form.phone, email: form.email.trim() };
  reset();
  await nextTick();
  saved.value = true;
};
</script>

<template>
  <div class="container-x pt-10 pb-16 sm:pt-16 sm:pb-24">
    <h1 class="h-display mb-8 text-5xl sm:mb-10 sm:text-7xl">Профиль</h1>

    <div class="grid items-start gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[23rem_minmax(0,1fr)] xl:gap-14">
      <section class="card min-w-0 rounded-3xl p-5 sm:p-7" aria-labelledby="profile-contacts-heading">
        <h2 id="profile-contacts-heading" class="mb-6 text-xl font-semibold">Личные данные</h2>
        <form ref="formElement" class="grid gap-5" novalidate @submit.prevent="save">
          <label>
            <span class="label">Имя</span>
            <input
              v-model="form.name"
              name="name"
              autocomplete="name"
              class="field"
              placeholder="Введите имя"
              required
              maxlength="80"
              :aria-invalid="!!errors.name || undefined"
              :aria-describedby="errors.name ? 'profile-name-error' : undefined"
            />
            <span v-if="errors.name" id="profile-name-error" role="alert" class="mt-2 block text-xs text-accent-text">{{ errors.name }}</span>
          </label>
          <label>
            <span class="label">Номер телефона</span>
            <UiRussianPhoneInput
              v-model="form.phone"
              name="phone"
              class="field"
              :aria-invalid="!!errors.phone || undefined"
              :aria-describedby="errors.phone ? 'profile-phone-error' : undefined"
            />
            <span v-if="errors.phone" id="profile-phone-error" role="alert" class="mt-2 block text-xs text-accent-text">{{ errors.phone }}</span>
          </label>
          <label>
            <span class="label">Email</span>
            <input
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              class="field"
              placeholder="you@example.ru"
              required
              maxlength="254"
              :aria-invalid="!!errors.email || undefined"
              :aria-describedby="errors.email ? 'profile-email-error' : undefined"
            />
            <span v-if="errors.email" id="profile-email-error" role="alert" class="mt-2 block text-xs text-accent-text">{{ errors.email }}</span>
          </label>
          <div class="grid gap-2 border-t border-line pt-5">
            <button type="submit" class="btn-primary w-full py-3.5 disabled:cursor-default disabled:opacity-40" :disabled="!dirty">Сохранить изменения</button>
            <button v-if="dirty" type="button" class="btn-dark w-full py-3" @click="reset">Отменить</button>
            <p v-if="saved" role="status" class="pt-1 text-center text-sm text-soft">Изменения сохранены</p>
          </div>
        </form>
      </section>

      <section class="min-w-0" aria-labelledby="profile-favorites-heading">
        <div class="mb-6 flex items-baseline justify-between gap-4">
          <h2 id="profile-favorites-heading" class="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Избранные места</h2>
          <span v-if="favoriteVenues.length" class="text-sm text-muted">{{ favoriteVenues.length }}</span>
        </div>
        <div v-if="favoriteVenues.length" class="grid gap-x-5 gap-y-9 sm:grid-cols-2 xl:gap-x-6">
          <div v-for="venue in favoriteVenues" :key="venue.slug" class="min-w-0">
            <VenueCard :venue="venue" variant="guide">
              <template #actions>
                <FavoriteButton kind="venues" :id="venue.slug" class="size-10 bg-black/60 backdrop-blur-md" />
              </template>
            </VenueCard>
            <p class="mt-2 text-xs text-muted">{{ cityName(venue.city) }}</p>
          </div>
        </div>
        <UiEmpty v-else icon="heart" title="Пока нет избранных мест" text="Lorem ipsum dolor sit amet consectetur adipisicing elit">
          <NuxtLink to="/venues" class="btn-primary px-6 py-3.5">Найти место</NuxtLink>
        </UiEmpty>
      </section>
    </div>
  </div>
</template>
