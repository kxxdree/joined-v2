<script setup lang="ts">
import { CitySelect } from "@features/select-city";
import backgroundArtists from "@shared/assets/images/background-artists.jpg";
import backgroundTexture from "@shared/assets/images/background-texture-paper.jpg";

useHead({ title: "JOINED — места и музыка твоего города" });
</script>

<template>
  <section class="home-hero" aria-labelledby="home-title">
    <div class="home-texture" aria-hidden="true">
      <img :src="backgroundTexture" alt="" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
    </div>
    <div class="home-visual" aria-hidden="true">
      <img :src="backgroundArtists" alt="" fetchpriority="high" decoding="async" class="absolute inset-0 h-full w-full object-cover" />
    </div>

    <div class="home-content">
      <div class="home-heading">
        <h1 id="home-title" class="home-title">JOINED</h1>
      </div>

      <div class="home-details">
        <div class="home-intro">
          <div class="home-description">
            Места и музыка
            <CitySelect inline modal class="home-city inline-block align-baseline">твоего города</CitySelect>
          </div>
          <div class="home-actions">
            <NuxtLink to="/venues" class="btn-primary min-h-14 min-w-36 px-7 py-3.5 text-base">
              Начать
            </NuxtLink>
            <NuxtLink to="/events" class="btn-dark min-h-14 min-w-36 px-7 py-3.5 text-base">
              Афиша
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <footer class="home-footer">
      <span>© {{ new Date().getFullYear() }} Joined</span>
      <nav class="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Правовая информация">
        <NuxtLink to="/rules">Условия сервиса</NuxtLink>
        <NuxtLink to="/rules#privacy">Конфиденциальность</NuxtLink>
        <span>18+</span>
      </nav>
    </footer>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  min-height: 100svh;
  flex-direction: column;
  margin-top: -4.75rem;
  padding-top: 4.75rem;
  background: #141315;
}

.home-texture,
.home-visual {
  position: absolute;
  z-index: -1;
  isolation: isolate;
  overflow: hidden;
}

.home-texture {
  inset: 0 43% 0 0;
}

.home-visual {
  inset: 0 0 0 57%;
}

.home-content,
.home-footer {
  width: 100%;
  max-width: 100rem;
  margin-inline: auto;
  padding-inline: clamp(1.5rem, 4.5vw, 5rem);
}

.home-content {
  margin-block: auto;
  padding-block: clamp(5rem, 14vh, 10rem) 4rem;
}

.home-eyebrow {
  margin-bottom: 0.9rem;
  font-size: clamp(0.8rem, 1.7vw, 1.4rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.home-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6.4vw, 6.6rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.065em;
  text-align: center;
  text-transform: uppercase;
}

.home-details {
  display: grid;
  grid-template-columns: 57fr 43fr;
  align-items: end;
  margin-top: clamp(2rem, 4.5vh, 3rem);
}

.home-intro {
  max-width: 32rem;
  padding-right: 2rem;
}

.home-description {
  font-size: clamp(1.1rem, 1.8vw, 1.5rem);
  line-height: 1.6;
  color: rgb(255 255 255 / 0.72);
  white-space: nowrap;
}

.home-city :deep(button) {
  height: auto;
  padding: 0;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgb(255 255 255 / 0.45);
  text-underline-offset: 0.2em;
}

.home-city :deep(button:hover) {
  color: var(--color-sand);
  text-decoration-color: currentColor;
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.home-actions .btn-dark {
  background: #303033;
}

.home-actions .btn-dark:hover {
  background: #404044;
}

.home-categories {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
  padding-bottom: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.home-categories a {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  transition: color 180ms;
}

.home-categories span {
  font-size: 0.7rem;
  font-weight: 400;
  color: rgb(255 255 255 / 0.45);
}

.home-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem 2rem;
  padding-block: 1.5rem;
  font-size: 0.75rem;
  color: rgb(255 255 255 / 0.55);
}

.home-footer a {
  transition: color 180ms;
}

.home-categories a:hover,
.home-footer a:hover {
  color: var(--color-sand);
}

@media (min-width: 640px) {
  .home-hero {
    margin-top: -5rem;
    padding-top: 5rem;
  }
}

@media (max-width: 767px) {
  .home-texture {
    display: none;
  }

  .home-visual {
    inset: 0;
  }

  .home-visual::after {
    position: absolute;
    inset: 0;
    content: "";
    background: linear-gradient(180deg, rgb(20 19 21 / 0.2), rgb(20 19 21 / 0.65));
  }

  .home-content {
    padding-block: 5rem 3rem;
  }

  .home-title {
    font-size: clamp(2.4rem, 9.8vw, 4.6rem);
    text-align: left;
  }

  .home-details {
    grid-template-columns: 1fr;
    gap: 3rem;
    margin-top: 2rem;
  }

  .home-intro {
    padding-right: 0;
  }

  .home-description {
    font-size: clamp(0.875rem, 4.5vw, 1.5rem);
  }

  .home-categories {
    align-items: flex-start;
  }
}
</style>
