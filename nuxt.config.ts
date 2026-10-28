import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/**
 * Архитектура - Feature-Sliced Design.
 *   app/  - слой app: роутинг Nuxt (тонкие обёртки), лэйауты, middleware, плагины, стили
 *   src/  - слои pages → widgets → features → entities → shared
 * Импорты между слоями - только сверху вниз и только через публичный API слайса (index.ts).
 */
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  alias: {
    '@pages': r('./src/pages'),
    '@widgets': r('./src/widgets'),
    '@features': r('./src/features'),
    '@entities': r('./src/entities'),
    '@shared': r('./src/shared'),
  },

  // В FSD зависимости явные: автоимпорт своих компонентов и composables выключен,
  // остаются только API Vue/Nuxt (ref, computed, useRoute, NuxtLink...)
  components: { dirs: [] },
  imports: { scan: false },

  typescript: {
    tsConfig: { include: ['../src/**/*'] },
  },

  css: ['~/styles/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Joined - бары и живая музыка',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Joined - поиск баров и музыкальных мероприятий по жанрам, расписание выступлений и билеты.' },
        { name: 'theme-color', content: '#161316' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Unbounded:wght@400;500;600;700&display=swap' },
      ],
    },
  },
})
