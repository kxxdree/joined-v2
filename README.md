# Joined - бары и живая музыка

Фронтенд веб-сервиса для поиска баров и музыкальных событий: фильтры по жанрам, афиша, профили заведений и групп, афиши событий в формате историй, брони столиков, кабинеты партнёров и админ-панель.

**Стек:** Nuxt 4 (Composition API, SSR) · Tailwind CSS 4 · Яндекс Карты (виджет) · qrcode
**Архитектура:** Feature-Sliced Design
**Стиль:** liquid glass поверх процедурного фона-абстракции

```bash
npm install
npm run dev        # http://localhost:3000
npx nuxi typecheck # проверка типов
npm run build && node .output/server/index.mjs
```

## Архитектура (FSD)

```
app/                      слой app: всё, что нужно Nuxt
  pages/                  тонкие route-обёртки: импорт страницы из src/pages + definePageMeta
  layouts/  middleware/   лэйауты и защита маршрутов по ролям
  plugins/                liquid-glass.client - включает преломление в Chromium
  styles/main.css         тема Tailwind и дизайн-система liquid glass

src/
  pages/      home, venues, venue, events, artists, artist, auth, account, partner, admin, rules, about
  widgets/    header, footer, event-calendar, event-stories
  features/   select-city, favorites, filter-venues, book-table,
              auth, newsletter, share, notification-settings
  entities/   city, venue, artist, event, session, booking
  shared/     ui (Ui*-компоненты), lib (даты, форматирование, cookie-состояние, тосты), config (жанры)
```

Правила:

- импорты идут только сверху вниз: `pages → widgets → features → entities → shared`;
- каждый слайс открывает публичный API через `index.ts`, во внутренние файлы чужих слайсов не лезем;
- сущности не импортируют друг друга (при необходимости - через `@x`-нотацию);
- автоимпорт своих компонентов и composables выключен (`nuxt.config.ts`), все зависимости явные. Автоимпортируются только API Vue и Nuxt.

Алиасы: `@pages`, `@widgets`, `@features`, `@entities`, `@shared`.

## Дизайн-система

Классы в `app/styles/main.css`:

| Класс | Что это |
|---|---|
| `.card`, `.glass` | стеклянная панель: размытие, тонировка, блик сверху, градиентная кромка |
| `.glass-strong` | плотное стекло для модалок, тостов и выпадающих меню |
| `.glass-chip` | маленький стеклянный элемент (бейджи, счётчики) |
| `.lg-refract` | преломление через SVG-фильтр (только Chromium, в остальных браузерах - обычное стекло) |
| `.btn-primary` | «жидкая» оранжевая кнопка с объёмом и свечением |
| `.btn-dark`, `.btn-ghost`, `.btn-icon` | стеклянные кнопки |
| `.pill`, `.pill-active` | пилюли-фильтры |
| `.segmented` | сегментный переключатель |
| `.text-liquid` | градиентный «стеклянный» текст |

Фон (`shared/ui/UiBackdrop.vue`) рисуется процедурно, без картинок. Пятна света смещаются полосами шума по горизонтали и размываются анизотропно, получается эффект motion blur. Сверху накладывается плёночное зерно. Слой фиксированный, фильтр растеризуется один раз и при скролле не пересчитывается.

## Демо-доступ

Бэкенда нет. Каталог лежит в `src/entities/*/api`, а пользователь, брони и избранное хранятся в cookie.
На странице `/login` есть кнопки быстрого входа под каждую роль:

| Роль | Куда попадает |
|---|---|
| Гость (пользователь) | `/account` - брони, история, избранное, уведомления |
| Бар | `/partner` - профиль заведения, мероприятия, входящие брони, фото и меню |
| Группа | `/partner` - профиль группы, концерты, треки и медиа |
| Админ | `/admin` - статистика, модерация, города, теги, пользователи, комиссии |

Оплата имитируется (`UiPaymentSheet`), деньги не списываются.

## Что заменить при подключении бэкенда

- `src/entities/*/api` → запросы к API через `useFetch` (интерфейс сущностей менять не придётся)
- `entities/session` → настоящая авторизация (JWT или сессии)
- `entities/booking` → эндпоинты бронирования
- `UiPaymentSheet` → платёжный провайдер
- фото: сейчас подобранные снимки с Unsplash (`shared/lib/photo.ts`)
- карта на странице заведения - виджет Яндекс Карт (`shared/ui/UiYandexMap.vue`), ключ API не нужен
