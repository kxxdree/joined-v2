import type { Option } from './option'

export type GenreId =
  | 'classical' | 'electronic' | 'pop' | 'rock' | 'jazz'
  | 'live' | 'hiphop' | 'indie' | 'blues' | 'open'

export const genres: Option<GenreId>[] = [
  { id: 'open', name: 'Открытый формат' },
  { id: 'pop', name: 'Поп' },
  { id: 'hiphop', name: 'Хип-хоп' },
  { id: 'electronic', name: 'Электроника' },
  { id: 'rock', name: 'Рок' },
  { id: 'jazz', name: 'Джаз' },
  { id: 'indie', name: 'Инди' },
  { id: 'blues', name: 'Блюз' },
  { id: 'classical', name: 'Классика' },
  { id: 'live', name: 'Живая музыка' },
]

export const genreName = (id: string) => genres.find(g => g.id === id)?.name ?? id
