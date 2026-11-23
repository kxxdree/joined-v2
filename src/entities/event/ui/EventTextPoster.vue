<script setup lang="ts">
import lineupPoster from '@shared/assets/images/lineup-poster.jpg'
import { genreName } from '@shared/config'
import { formatDay } from '@shared/lib'
import { UiPhoto } from '@shared/ui'
import type { EventItem } from '../model/types'

defineProps<{ event: EventItem; artistNames: string[]; expanded?: boolean }>()
</script>

<template>
  <div class="text-poster">
    <UiPhoto :src="lineupPoster" alt="" class="poster-photo" />
    <div class="poster-shade" aria-hidden="true" />

    <div class="poster-content">
    <div class="poster-main">
      <h3 class="poster-title" :class="expanded ? 'text-[clamp(1.75rem,4vw,2rem)]' : 'text-[clamp(1.15rem,2.1vw,1.6rem)] max-[479px]:text-[1.75rem]'">{{ event.title }}</h3>
      <p class="poster-date" :class="expanded ? 'text-lg' : 'text-base'"><time :datetime="`${event.date}T${event.time}`">{{ formatDay(event.date) }}</time></p>
      <p class="poster-time" :class="expanded ? 'text-xl' : 'text-lg'">{{ event.time }}</p>
      <ul v-if="event.artists.length" class="poster-artists" :class="expanded ? 'text-base' : 'text-sm'">
        <li v-for="name in artistNames" :key="name">{{ name }}</li>
      </ul>
      <p v-else class="poster-genres" :class="expanded ? 'text-base' : 'text-sm'">{{ event.genres.map(genreName).join(' / ') }}</p>
    </div>
    </div>
  </div>
</template>

<style scoped>
.text-poster {
  position: relative;
  isolation: isolate;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  color: white;
}

.poster-photo,
.poster-shade {
  position: absolute;
  z-index: -1;
  inset: 0;
}

.poster-photo {
  transition: transform 600ms var(--ease-liquid);
}

.poster-shade {
  background: linear-gradient(180deg, rgb(10 8 10 / 0.4), rgb(10 8 10 / 0.62) 40%, rgb(10 8 10 / 0.48) 70%, rgb(10 8 10 / 0.85));
}

.poster-content {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: 1.5rem 1.1rem;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0 2px 16px rgb(0 0 0 / 0.45);
}

.poster-main {
  padding-block: 2rem;
}

.poster-title {
  font-family: var(--font-display);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.035em;
  overflow-wrap: anywhere;
}

.poster-date {
  margin-top: 1.25rem;
  color: var(--color-white);
  font-weight: 700;
}

.poster-artists,
.poster-genres {
  margin-top: 1rem;
  font-weight: 700;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.poster-time {
  margin-top: 0.35rem;
  font-weight: 500;
}


@media (max-width: 479px) {
  .poster-content { padding: 1.75rem; }
}
</style>
