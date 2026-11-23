<script setup lang="ts">
import { ArtistCard, artists } from '@entities/artist'
import { cities, cityName } from '@entities/city'
import { type GenreId, genres } from '@shared/config'
import { UiEmpty, UiIcon, UiPills, UiSelect } from '@shared/ui'

const genre = ref<GenreId | ''>('')
const city = ref('')
const searchQuery = ref('')

const filteredArtists = computed(() =>
  artists
    .filter(a => !genre.value || a.genres.includes(genre.value))
    .filter(a => !city.value || a.city === city.value)
    .filter(a => !searchQuery.value.trim() || a.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase()))
    .sort((a, b) => b.followers - a.followers),
)

useHead({ title: 'Артисты и группы - Joined' })
</script>

<template>
  <div>
    <section class="container-x pt-12 pb-12 text-center sm:pt-20">
      <h1 class="h-display text-[15vw] sm:text-8xl lg:text-[9rem]">Артисты</h1>
      <p class="mt-4 text-white/80">Группы, коллективы и музыканты</p>

      <div class="search-bar relative z-10 mx-auto mt-8 flex max-w-2xl flex-col gap-1 p-2 sm:flex-row">
        <label class="flex flex-1 items-center gap-3 px-3">
          <UiIcon name="search" class="text-white/60" :size="18" />
          <input v-model="searchQuery" type="search" placeholder="Название группы" class="w-full bg-transparent py-2.5 text-sm placeholder:text-white/50" aria-label="Поиск артистов">
        </label>
        <div class="flex sm:w-48">
          <UiSelect v-model="city" :options="cities" all-label="Все города" icon="pin" label="Город" class="min-w-0 flex-1 [&>button]:h-full [&>button]:w-full" />
        </div>
      </div>
      <div class="mt-6"><UiPills v-model="genre" :options="genres" center /></div>
    </section>

    <section class="container-x">
      <div v-if="filteredArtists.length" class="grid grid-cols-2 md:grid-cols-3">
        <ArtistCard v-for="artist in filteredArtists" :key="artist.slug" :artist="artist" :city-label="cityName(artist.city)" />
      </div>
      <UiEmpty v-else icon="music" title="Никого не нашли" text="Попробуйте другой жанр или город" />
    </section>
  </div>
</template>
