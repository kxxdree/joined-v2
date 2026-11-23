import type { EventItem } from '@entities/event'
import type { Venue } from '@entities/venue'

export interface VenueContent {
  venue: Venue
  events: EventItem[]
}

export const editorSections = [
  { id: 'overview', name: 'О заведении' },
  { id: 'location', name: 'Адрес и контакты' },
  { id: 'hours', name: 'Часы работы' },
  { id: 'media', name: 'Фотографии' },
  { id: 'menu', name: 'Меню' },
  { id: 'booking', name: 'Бронирование' },
  { id: 'events', name: 'Мероприятия' },
  { id: 'rules', name: 'Правила' },
] as const
export type EditorSection = typeof editorSections[number]['id']
export interface ContentIssue { section: EditorSection; message: string }
export const cloneContent = <T>(value: T): T => JSON.parse(JSON.stringify(value))
export const isImageSource = (value: string) => /^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value) || /^data:image\/(jpeg|png|webp);base64,/.test(value)

/** Проверяем весь документ: ошибки скрытых разделов тоже видны перед сохранением. */
export const validateContent = (content: VenueContent): ContentIssue[] => {
  const issues: ContentIssue[] = []
  const add = (section: EditorSection, message: string) => issues.push({ section, message })
  const { venue, events } = content
  const isNonNegative = (value: number) => Number.isFinite(value) && value >= 0
  if (!venue.name.trim()) add('overview', 'Укажите название заведения.')
  if (!venue.short.trim()) add('overview', 'Добавьте короткое описание для карточки.')
  if (!venue.description.trim()) add('overview', 'Расскажите о заведении в подробном описании.')
  if (!venue.genres.length) add('overview', 'Выберите хотя бы один музыкальный жанр.')
  if (!venue.city || !venue.address.trim()) add('location', 'Укажите город и адрес.')
  if (!/^\+?[\d\s()−-]{10,25}$/.test(venue.phone) || venue.phone.replace(/\D/g, '').length < 10) add('location', 'Укажите полный номер телефона.')
  if (!Number.isFinite(venue.lat) || Math.abs(venue.lat) > 90 || !Number.isFinite(venue.lng) || Math.abs(venue.lng) > 180) add('location', 'Проверьте координаты: широта от −90 до 90, долгота от −180 до 180.')
  if (venue.hours.length !== 7 || venue.hours.some(day => !day.day.trim() || !day.time.trim())) add('hours', 'Заполните часы для всех семи дней. Для выходного укажите «Закрыто».')
  if (!venue.photo || !isImageSource(venue.photo)) add('media', 'Добавьте обложку: загрузите фото.')
  if (venue.gallery.some(url => !isImageSource(url))) add('media', 'В галерее есть некорректная ссылка на фотографию.')
  if ([...venue.menu.bar, ...venue.menu.kitchen].some(url => !isImageSource(url))) add('menu', 'Проверьте ссылки на страницы меню.')
  if (!isNonNegative(venue.booking.deposit)) add('booking', 'Депозит должен быть числом не меньше нуля.')
  if (!Number.isInteger(venue.booking.minGuests) || venue.booking.minGuests < 1 || !Number.isInteger(venue.booking.maxGuests) || venue.booking.maxGuests < venue.booking.minGuests) add('booking', 'Количество гостей — целые числа от 1; максимум не меньше минимума.')
  if (venue.booking.conditions.some(condition => !condition.trim())) add('booking', 'Заполните или удалите пустые условия бронирования.')
  if (venue.rules.some(rule => !rule.trim())) add('rules', 'Заполните или удалите пустые правила.')
  const eventIds = new Set<string>()
  for (const [index, event] of events.entries()) {
    const label = `Мероприятие ${index + 1}`
    if (!event.title.trim()) add('events', `${label}: укажите название.`)
    if (!event.id || eventIds.has(event.id) || event.venue !== venue.slug) add('events', `${label}: некорректный идентификатор или заведение.`)
    eventIds.add(event.id)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date) || Number.isNaN(Date.parse(event.date)) || new Date(event.date).toISOString().slice(0, 10) !== event.date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)) add('events', `${label}: укажите корректную дату и время.`)
    if (!event.description.trim() || !event.genres.length) add('events', `${label}: заполните описание и выберите жанр.`)
    if (!event.photo || !isImageSource(event.photo) || event.posters?.some(url => !isImageSource(url))) add('events', `${label}: добавьте фото и проверьте ссылки на афиши.`)
    if (!event.tickets.length || event.tickets.some(ticket => !ticket.name.trim() || !isNonNegative(ticket.price) || !Number.isInteger(ticket.left) || ticket.left < 0)) add('events', `${label}: добавьте билет с названием, ценой и целым количеством от нуля.`)
  }
  return issues
}

/** Локальное хранилище может содержать старый или повреждённый документ. */
export const isVenueContent = (value: unknown): value is VenueContent => {
  if (!value || typeof value !== 'object') return false
  const content = value as Record<string, unknown>
  const venue = content.venue as Record<string, unknown> | undefined
  const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string')
  if (!venue || !['slug', 'name', 'city', 'format', 'address', 'directions', 'short', 'description', 'phone', 'instagram', 'telegram', 'photo'].every(key => typeof venue[key] === 'string')) return false
  if (!['lat', 'lng', 'popularity'].every(key => typeof venue[key] === 'number') || !strings(venue.genres) || !strings(venue.drinks) || !strings(venue.gallery)) return false
  if (!Array.isArray(venue.hours) || venue.hours.length !== 7 || !venue.hours.every(day => day && typeof day.day === 'string' && typeof day.time === 'string')) return false
  const menu = venue.menu as Record<string, unknown> | undefined
  const booking = venue.booking as Record<string, unknown> | undefined
  if (!menu || !strings(menu.bar) || !strings(menu.kitchen) || !booking || !strings(booking.conditions) || !strings(venue.rules)) return false
  if (!['deposit', 'minGuests', 'maxGuests'].every(key => typeof booking[key] === 'number')) return false
  return Array.isArray(content.events) && content.events.every(event => event && ['id', 'title', 'venue', 'date', 'time', 'description', 'photo'].every(key => typeof event[key] === 'string')
    && strings(event.artists) && strings(event.genres) && (event.posters === undefined || strings(event.posters))
    && Array.isArray(event.tickets) && event.tickets.every((ticket: Record<string, unknown>) => ticket && ['id', 'name', 'desc'].every(key => typeof ticket[key] === 'string') && typeof ticket.price === 'number' && typeof ticket.left === 'number'))
}
