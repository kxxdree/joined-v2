import { useSession } from '@entities/session'
import { usePersisted } from '@shared/lib'

export interface Favorites {
  venues: string[]
  artists: string[]
}

export type FavoriteKind = keyof Favorites

export const useFavorites = () => {
  const favs = usePersisted<Favorites>('joined_favs', () => ({ venues: [], artists: [] }))
  const { requireAuth } = useSession()

  const has = (kind: FavoriteKind, id: string) => favs.value[kind].includes(id)

  const toggle = (kind: FavoriteKind, id: string) => {
    if (!requireAuth()) return
    const favoriteIds = favs.value[kind]
    const shouldAdd = !favoriteIds.includes(id)
    favs.value = { ...favs.value, [kind]: shouldAdd ? [...favoriteIds, id] : favoriteIds.filter(x => x !== id) }
  }

  return { favs, has, toggle }
}
