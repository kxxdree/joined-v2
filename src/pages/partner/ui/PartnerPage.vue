<script setup lang="ts">
import { cityName } from "@entities/city";
import { useVenueCatalog } from "@entities/venue";
import { UiIcon, UiPhoto } from "@shared/ui";

const { venues } = useVenueCatalog();
const searchQuery = ref("");
const filteredVenues = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase("ru");
  return venues.value.filter((venue) => !query || `${venue.name} ${cityName(venue.city)} ${venue.address}`.toLocaleLowerCase("ru").includes(query));
});
const visibleCount = ref(12);
watch(searchQuery, () => {
  visibleCount.value = 12;
});
useHead({ title: "Кабинет заведения — Joined" });
</script>

<template>
  <div class="container-x py-10 sm:py-14">
    <header class="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p class="mb-3 text-sm text-accent-text">Joined для заведений</p>
        <h1 class="h-display text-4xl sm:text-6xl">Ваше место.<br />Ваша атмосфера.</h1>
        <p class="mt-5 max-w-xl leading-relaxed text-muted">Расскажите о себе, обновите меню и пригласите гостей на следующий концерт.</p>
      </div>
      <NuxtLink to="/partner/new" class="btn-primary gap-2 px-6 py-4"><UiIcon name="plus" :size="19" /> Добавить заведение</NuxtLink>
    </header>
    <div class="mt-10 mb-6 flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-2xl font-medium">Заведения</h2>
      <label class="flex w-full items-center gap-3 rounded-2xl border border-line bg-black/20 px-4 sm:w-96"
        ><UiIcon name="search" :size="19" class="text-muted" /><span class="sr-only">Поиск заведения по названию, городу или адресу</span
        ><input v-model="searchQuery" type="search" class="min-w-0 flex-1 bg-transparent py-4 text-sm" placeholder="Название, город или адрес"
      /></label>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="venue in filteredVenues.slice(0, visibleCount)"
        :key="venue.slug"
        :to="`/partner/${venue.slug}`"
        class="card group overflow-hidden transition-colors hover:bg-white/5"
        ><div class="relative aspect-video"><UiPhoto :src="venue.photo" :alt="venue.name" class="absolute! inset-0" /></div>
        <div class="p-5">
          <p class="text-sm text-muted">{{ cityName(venue.city) }}</p>
          <h3 class="mt-2 text-xl font-medium transition-colors group-hover:text-sand">{{ venue.name }}</h3>
          <p class="mt-2 truncate text-sm text-muted">{{ venue.address }}</p>
          <span class="mt-6 inline-flex items-center gap-2 text-sm text-accent-text"><UiIcon name="edit" :size="16" /> Редактировать страницу</span>
        </div></NuxtLink
      >
    </div>
    <p v-if="!filteredVenues.length" class="card p-8 text-center text-muted">Ничего не нашли. Попробуйте другое название или город.</p>
    <div v-if="filteredVenues.length > visibleCount" class="mt-8 text-center">
      <button type="button" class="btn-dark px-6 py-4" @click="visibleCount += 12">Показать ещё</button>
    </div>
  </div>
</template>
