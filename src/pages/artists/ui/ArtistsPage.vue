<script setup lang="ts">
import { ArtistCard, artists } from "@entities/artist";
import { cities, cityName } from "@entities/city";
import { type GenreId, genres } from "@shared/config";
import { UiEmpty, UiIcon, UiPageHead, UiPills, UiSelect } from "@shared/ui";

useHead({ title: "Артисты и группы - Joined" });

const genre = ref<GenreId | "">("");
const city = ref("");
const q = ref("");

const list = computed(() =>
  artists
    .filter((a) => !genre.value || a.genres.includes(genre.value))
    .filter((a) => !city.value || a.city === city.value)
    .filter((a) => !q.value.trim() || a.name.toLowerCase().includes(q.value.trim().toLowerCase()))
    .sort((a, b) => b.followers - a.followers),
);
</script>

<template>
  <div>
    <section class="container-x">
      <UiPageHead title="Артисты" />

      <!-- Поиск одной плашкой: поле и город внутри -->
      <div class="search-bar mt-4 flex flex-col gap-1 p-2 sm:flex-row">
        <label class="flex min-w-0 flex-1 items-center gap-3 px-3">
          <UiIcon name="search" class="shrink-0 text-white/60" :size="18" />
          <input
            v-model="q"
            type="search"
            placeholder="Название группы"
            class="w-full bg-transparent py-2.5 text-sm placeholder:text-white/50"
            aria-label="Поиск артистов"
          />
        </label>
        <UiSelect
          v-model="city"
          :options="cities"
          all-label="Все города"
          icon="pin"
          label="Город"
          modal
          class="min-w-0 sm:w-48 [&>button]:h-full [&>button]:w-full"
        />
      </div>
      <div class="mt-3"><UiPills v-model="genre" :options="genres" /></div>
    </section>

    <!-- Сетка как в галерее заведения: три колонки, на больших экранах пять; на телефоне от края до края -->
    <section class="mx-auto w-full max-w-7xl pt-3 sm:px-6 lg:px-12">
      <div v-if="list.length" class="grid grid-cols-3 gap-0.5 lg:grid-cols-5">
        <ArtistCard v-for="a in list" :key="a.slug" :artist="a" :city-label="cityName(a.city)" />
      </div>
      <UiEmpty v-else icon="music" title="Никого не нашли" text="Попробуйте другой жанр или город" />
    </section>
  </div>
</template>
