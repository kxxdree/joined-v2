import type { GenreId } from '@shared/config'

export type FormatId = 'bar' | 'pub' | 'lounge' | 'club' | 'concert'

export type DrinkId = 'cocktails' | 'craft' | 'wine' | 'kitchen' | 'snacks'

export interface Venue {
  slug: string
  name: string
  city: string
  format: FormatId
  genres: GenreId[]
  drinks: DrinkId[]
  address: string
  directions: string
  lat: number
  lng: number
  /** внутренний показатель для сортировки «Сначала популярные» */
  popularity: number
  short: string
  description: string
  phone: string
  instagram: string
  telegram: string
  hours: { day: string; time: string }[]
  photo: string
  gallery: string[]
  /** меню - фотографии страниц, которые загружает заведение */
  menu: { bar: string[]; kitchen: string[] }
  booking: { deposit: number; minGuests: number; maxGuests: number; conditions: string[] }
  rules: string[]
}
