import { useVenueWorkspace } from '@features/manage-venue'

export default defineNuxtPlugin(() => {
  const { restore } = useVenueWorkspace()
  // app:mounted может сработать до завершения гидратации асинхронной страницы.
  onNuxtReady(restore)
})
