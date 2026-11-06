import type { GenreId } from '@shared/config'

export interface Member {
  name: string
  role: string
}

export interface Track {
  title: string
  album: string
  year: number
  duration: string
}

export interface Artist {
  slug: string
  name: string
  city: string
  genres: GenreId[]
  short: string
  bio: string
  founded: number
  followers: number
  photo: string
  /** Фото для галереи на странице артиста */
  gallery?: string[]
  /** ссылки на соцсети; кнопка показывается, только если ссылка задана */
  socials?: { instagram?: string; telegram?: string }
  members: Member[]
  tracks: Track[]
  videos: { title: string; photo: string; duration: string }[]
}
