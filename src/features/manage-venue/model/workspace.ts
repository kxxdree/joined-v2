import { useEventCatalog } from '@entities/event'
import { useVenueCatalog } from '@entities/venue'
import { cloneContent, isVenueContent, type VenueContent } from './content'

const STORAGE_KEY = 'joined_venue_content_v1'

export const useVenueWorkspace = () => {
  const { setVenue } = useVenueCatalog()
  const { setVenueEvents } = useEventCatalog()
  const isReady = useState('venue-workspace-ready', () => false)
  const storageError = useState('venue-workspace-error', () => '')
  const apply = (content: VenueContent) => {
    setVenue(cloneContent(content.venue))
    setVenueEvents(content.venue.slug, cloneContent(content.events))
  }
  const restore = () => {
    try {
      const records = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, VenueContent>
      for (const content of Object.values(records)) {
        // Не переносим повреждённые записи в публичный каталог.
        if (isVenueContent(content) && content.venue.slug) apply(content)
        else storageError.value = 'Часть сохранённых данных повреждена и не загружена. Остальные страницы доступны.'
      }
    } catch {
      storageError.value = 'Не удалось прочитать сохранённые изменения. Проверьте, разрешено ли хранение данных в браузере.'
    }
    isReady.value = true
  }
  const save = (content: VenueContent) => {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, VenueContent>
    // Сначала запись: при нехватке места публичная версия остаётся прежней.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...records, [content.venue.slug]: content }))
    apply(content)
  }
  return { isReady, storageError, restore, save }
}
