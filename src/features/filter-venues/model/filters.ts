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
export const countExtra = (f: VenueFilterState) =>
  f.formats.length + f.drinks.length

export const applyVenueFilters = (list: Venue[], f: VenueFilterState) => {
  const needle = f.q.trim().toLowerCase()

  return list
    .filter(v =>
      (!needle || [v.name, v.short, v.address, v.metro ?? ''].some(s => s.toLowerCase().includes(needle)))
      && (!f.genres.length || f.genres.some(g => v.genres.includes(g)))
      && (!f.formats.length || f.formats.includes(v.format))
      && (!f.drinks.length || f.drinks.every(d => v.drinks.includes(d))))
    // сначала популярные
    .sort((a, b) => b.popularity - a.popularity)
}
