import type { Role, User } from './session'

export const isVenueManager = (role: Role) => role === 'venue' || role === 'admin'

export const canManageVenue = (user: User | null, slug: string) =>
  !!user && isVenueManager(user.role) && !!user.venueSlug && user.venueSlug === slug && slug !== 'new'
