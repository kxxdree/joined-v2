import assert from 'node:assert/strict'
import test from 'node:test'
import { parseHours } from '../src/features/manage-venue/model/hours.ts'

test('existing hour formats retain exact opening and closing times for selectors', () => {
  for (const time of ['18:15 - 02:37', '18:15–02:37', '18:15 — 02:37']) {
    assert.deepEqual(parseHours(time), { opening: '18:15', closing: '02:37' })
  }
  assert.equal(parseHours('Закрыто'), undefined)
  assert.equal(parseHours('18:00–'), undefined)
})
