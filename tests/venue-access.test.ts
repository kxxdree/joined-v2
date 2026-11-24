import assert from 'node:assert/strict'
import test from 'node:test'
import { canManageVenue } from '../src/entities/session/model/access.ts'
import type { User } from '../src/entities/session/model/session.ts'

const manager: User = { email: 'bar@example.com', name: 'Бар', role: 'venue', venueSlug: 'red-velvet' }

test('venue owners and administrators can manage only their assigned venue', () => {
  for (const role of ['venue', 'admin'] as const) {
    const user = { ...manager, role }
    assert.equal(canManageVenue(user, 'red-velvet'), true)
    assert.equal(canManageVenue(user, 'garage-hall'), false)
    assert.equal(canManageVenue(user, 'new'), false)
  }
})

test('missing assignments, anonymous users and other roles cannot manage venues', () => {
  assert.equal(canManageVenue(null, 'red-velvet'), false)
  assert.equal(canManageVenue({ ...manager, venueSlug: undefined }, 'red-velvet'), false)
  assert.equal(canManageVenue({ ...manager, venueSlug: '' }, ''), false)
  for (const role of ['user', 'artist'] as const) {
    assert.equal(canManageVenue({ ...manager, role }, 'red-velvet'), false)
  }
  assert.equal(canManageVenue({ ...manager, venueSlug: 'new' }, 'new'), false)
})
