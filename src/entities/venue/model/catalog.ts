import { venues as initialVenues } from '../api/venues'
import type { Venue } from './types'

/** Изменения отделены от демо-каталога и изолированы на каждый SSR-запрос. */
export const useVenueCatalog = () => {
  const overrides = useState<Record<string, Venue>>('venue-catalog-overrides', () => ({}))
  const venues = computed(() => [
    ...initialVenues.map(venue => overrides.value[venue.slug] ?? venue),
    ...Object.entries(overrides.value).filter(([sourceSlug]) => !initialVenues.some(initial => initial.slug === sourceSlug)).map(([, venue]) => venue),
  ])
  // Исходный адрес остаётся стабильной привязкой аккаунта и ссылкой на переименованное заведение.
  const getVenue = (slug: string) => overrides.value[slug] ?? venues.value.find(venue => venue.slug === slug)
  const setVenue = (venue: Venue, sourceSlug = venue.slug) => { overrides.value = { ...overrides.value, [sourceSlug]: venue } }
  return { venues, getVenue, setVenue }
}
