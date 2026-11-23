/**
 * Глобальное состояние, синхронизированное с cookie (работает и при SSR).
 * Все вызовы с одним ключом получают один и тот же ref.
 */
export const usePersisted = <T>(key: string, init: () => T, maxAgeSeconds = 60 * 60 * 24 * 365) => {
  const cookie = useCookie<T>(key, { default: init, maxAge: maxAgeSeconds })
  const state = useState<T>(`persist:${key}`, () => cookie.value)

  const nuxtApp = useNuxtApp() as unknown as Record<string, boolean>
  const watcherRegistrationKey = `__persist_${key}`
  if (!nuxtApp[watcherRegistrationKey]) {
    nuxtApp[watcherRegistrationKey] = true
    // detached scope - watcher переживает размонтирование компонента
    effectScope(true).run(() => {
      watch(state, (persistedValue) => { cookie.value = persistedValue }, { deep: true })
    })
  }
  return state
}
