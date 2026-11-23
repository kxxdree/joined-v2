import { venues as initialVenues } from '../api/venues'
import type { Venue } from './types'

/** Изменения отделены от демо-каталога и изолированы на каждый SSR-запрос. */
export const useVenueCatalog = () => {
  const overrides = useState<Record<string, Venue>>('venue-catalog-overrides', () => ({}))
  const venues = computed(() => [
    ...initialVenues.map(venue => overrides.value[venue.slug] ?? venue),
    ...Object.values(overrides.value).filter(venue => !initialVenues.some(initial => initial.slug === venue.slug)),
  ])
  const getVenue = (slug: string) => venues.value.find(venue => venue.slug === slug)
  const setVenue = (venue: Venue) => { overrides.value = { ...overrides.value, [venue.slug]: venue } }
  return { venues, getVenue, setVenue }
}
