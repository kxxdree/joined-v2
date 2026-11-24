import { useEventCatalog } from '@entities/event'
import { useVenueCatalog } from '@entities/venue'
import { cloneContent, isVenueContent, type VenueContent } from './content'

const STORAGE_KEY = 'joined_venue_content_v1'

export const useVenueWorkspace = () => {
  const { getVenue, setVenue } = useVenueCatalog()
  const { setVenueEvents } = useEventCatalog()
  const isReady = useState('venue-workspace-ready', () => false)
  const storageError = useState('venue-workspace-error', () => '')
  const apply = (content: VenueContent, sourceSlug: string) => {
    const previousSlug = getVenue(sourceSlug)?.slug
    setVenue(cloneContent(content.venue), sourceSlug)
    if (previousSlug && previousSlug !== content.venue.slug) setVenueEvents(previousSlug, [])
    if (sourceSlug !== content.venue.slug) setVenueEvents(sourceSlug, [])
    setVenueEvents(content.venue.slug, cloneContent(content.events))
  }
  const restore = () => {
    try {
      const records = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, VenueContent>
      for (const [sourceSlug, content] of Object.entries(records)) {
        // Не переносим повреждённые записи в публичный каталог.
        if (isVenueContent(content) && content.venue.slug) apply(content, sourceSlug)
        else storageError.value = 'Часть сохранённых данных повреждена и не загружена. Остальные страницы доступны.'
      }
    } catch {
      storageError.value = 'Не удалось прочитать сохранённые изменения. Проверьте, разрешено ли хранение данных в браузере.'
    }
    isReady.value = true
  }
  const save = (content: VenueContent, sourceSlug = content.venue.slug) => {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, VenueContent>
    // Сначала запись: при нехватке места публичная версия остаётся прежней.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...records, [sourceSlug]: content }))
    apply(content, sourceSlug)
  }
  return { isReady, storageError, restore, save }
}
