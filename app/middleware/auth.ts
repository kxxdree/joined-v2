import { canManageVenue, type Role, useSession } from '@entities/session'

/**
 * Защита маршрутов. На странице: definePageMeta({ middleware: 'auth', roles: ['admin'] })
 */
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useSession()
  if (!user.value) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })

  const roles = to.meta.roles as Role[] | undefined
  if (roles?.length && !roles.includes(user.value.role)) {
    return abortNavigation(createError({ statusCode: 403, message: 'Недостаточно прав для просмотра этой страницы' }))
  }

  if (to.path.startsWith('/partner/')) {
    if (!canManageVenue(user.value, String(to.params.slug))) {
      return abortNavigation(createError({ statusCode: 403, message: 'Доступно управление только своим заведением' }))
    }
    return navigateTo('/partner', { replace: true })
  }
})
