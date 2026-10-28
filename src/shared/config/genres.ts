import type { Option } from './option'

export type GenreId =
  | 'classical' | 'electronic' | 'pop' | 'rock' | 'jazz'
  | 'live' | 'hiphop' | 'indie' | 'blues' | 'open'

export const genres: Option<GenreId>[] = [
  { id: 'live', name: 'Живая музыка' },
  { id: 'jazz', name: 'Джаз' },
  { id: 'rock', name: 'Рок' },
  { id: 'electronic', name: 'Электроника' },
  { id: 'pop', name: 'Поп' },
  { id: 'indie', name: 'Инди' },
  { id: 'hiphop', name: 'Хип-хоп' },
  { id: 'blues', name: 'Блюз' },
  { id: 'classical', name: 'Классика' },
  // открытый формат - бар играет все жанры, без привязки к одному стилю
  { id: 'open', name: 'Открытый формат' },
]

export const genreName = (id: string) => genres.find(g => g.id === id)?.name ?? id
