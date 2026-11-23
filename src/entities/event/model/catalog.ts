import { events as initialEvents } from '../api/events'
import type { EventItem } from './types'

export const useEventCatalog = () => {
  const overrides = useState<Record<string, EventItem[]>>('event-catalog-overrides', () => ({}))
  const events = computed(() => [
    ...initialEvents.filter(event => !Object.hasOwn(overrides.value, event.venue)),
    ...Object.values(overrides.value).flat(),
  ])
  const getEvent = (id: string) => events.value.find(event => event.id === id)
  const setVenueEvents = (slug: string, venueEvents: EventItem[]) => {
    overrides.value = { ...overrides.value, [slug]: venueEvents }
  }
  return { events, getEvent, setVenueEvents }
}
