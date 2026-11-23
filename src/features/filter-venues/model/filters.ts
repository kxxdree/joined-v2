import type { DrinkId, FormatId, Venue } from '@entities/venue'
import type { GenreId } from '@shared/config'

export interface VenueFilterState {
  q: string
  genres: GenreId[]
  formats: FormatId[]
  drinks: DrinkId[]
}

export const emptyFilters = (): VenueFilterState => ({
  q: '', genres: [], formats: [], drinks: [],
})

/** Сколько «доп.» фильтров включено (без поиска и жанров - они всегда на виду) */
export const countExtra = (filters: VenueFilterState) =>
  filters.formats.length + filters.drinks.length

export const applyVenueFilters = (venues: Venue[], filters: VenueFilterState) => {
  const normalizedSearchQuery = filters.q.trim().toLowerCase()

  return venues
    .filter(venue =>
      (!normalizedSearchQuery || [venue.name, venue.short, venue.address, venue.metro ?? ''].some(s => s.toLowerCase().includes(normalizedSearchQuery)))
      && (!filters.genres.length || filters.genres.some(g => venue.genres.includes(g)))
      && (!filters.formats.length || filters.formats.includes(venue.format))
      && (!filters.drinks.length || filters.drinks.every(d => venue.drinks.includes(d))))
    // сначала популярные
    .sort((a, b) => b.popularity - a.popularity)
}
