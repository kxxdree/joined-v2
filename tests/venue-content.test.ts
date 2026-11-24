import assert from 'node:assert/strict'
import test from 'node:test'
import { cloneContent, isImageSource, isVenueContent, validateContent, type VenueContent } from '../src/features/manage-venue/model/content.ts'

const createContent = (): VenueContent => ({
  venue: {
    slug: 'test-bar', name: 'Тестовый бар', city: 'moscow', format: 'bar', genres: ['jazz'], drinks: ['cocktails'],
    address: 'Тестовая, 1', directions: 'Вход со двора', lat: 55.75, lng: 37.61, popularity: 0,
    short: 'Бар с живой музыкой', description: 'Джаз по вечерам', phone: '+7 (999) 123-45-67', instagram: '', telegram: '',
    hours: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => ({ day, time: '18:00–02:00' })),
    photo: '/cover.jpg', gallery: [], menu: { bar: [], kitchen: [] }, booking: { deposit: 0, minGuests: 1, maxGuests: 8, conditions: [] }, rules: [],
  },
  events: [{ id: 'custom-test', title: 'Джазовый вечер', venue: 'test-bar', date: '2027-05-01', time: '20:00', description: 'Живой концерт', artists: [], genres: ['jazz'], photo: '/event.jpg', posters: [], tickets: [{ id: 'standard', name: 'Вход', desc: '', price: 0, left: 0 }] }],
})

test('free entry, zero deposit, sold-out tickets and overnight hours are valid', () => {
  assert.deepEqual(validateContent(createContent()), [])
  assert.equal(isVenueContent(createContent()), true)
})
test('invalid guest range and negative deposit link errors to booking', () => {
  const content = createContent()
  content.venue.booking = { deposit: -10, minGuests: 5, maxGuests: 2, conditions: [''] }
  assert.equal(validateContent(content).filter(issue => issue.section === 'booking').length, 3)
})
test('nonexistent dates and duplicate event identifiers cannot be saved', () => {
  const content = createContent()
  content.events[0]!.date = '2027-02-30'
  content.events.push(cloneContent(content.events[0]!))
  const messages = validateContent(content).map(issue => issue.message)
  assert.ok(messages.some(message => message.includes('дату')))
  assert.ok(messages.some(message => message.includes('идентификатор')))
})
test('events require tickets and reject fractional inventory', () => {
  const content = createContent()
  content.events[0]!.tickets[0]!.left = 1.5
  assert.ok(validateContent(content).some(issue => issue.section === 'events'))
  content.events[0]!.tickets = []
  assert.ok(validateContent(content).some(issue => issue.section === 'events'))
})
test('coordinates are bounded and seven daily hours must be provided', () => {
  const content = createContent()
  content.venue.lat = 91
  content.venue.hours.pop()
  assert.deepEqual(validateContent(content).map(issue => issue.section), ['location', 'hours'])
})

test('hours accept overnight ranges and days off, but reject invalid or incomplete times', () => {
  const content = createContent()
  for (const time of ['18:00 - 02:00', '09:15–23:45', '00:00—00:00', 'Закрыто']) {
    content.venue.hours[0]!.time = time
    assert.deepEqual(validateContent(content), [])
  }
  for (const time of ['', '–02:00', '18:00–', '24:00–02:00', '18:60–02:00', 'вечером']) {
    content.venue.hours[0]!.time = time
    assert.ok(validateContent(content).some(issue => issue.section === 'hours'))
  }
})
test('a draft is independent of the saved content including nested arrays', () => {
  const saved = createContent()
  const draft = cloneContent(saved)
  draft.venue.hours[0]!.time = 'Закрыто'
  draft.events[0]!.tickets[0]!.price = 200
  assert.equal(saved.venue.hours[0]!.time, '18:00–02:00')
  assert.equal(saved.events[0]!.tickets[0]!.price, 0)
})
test('invalid stored documents are rejected before reaching the catalog', () => {
  for (const value of [null, {}, { venue: {}, events: [] }, { ...createContent(), events: [{ tickets: [null] }] }]) assert.equal(isVenueContent(value), false)
  const content = createContent()
  delete (content.venue.menu as Partial<typeof content.venue.menu>).bar
  assert.equal(isVenueContent(content), false)
})
test('image sources accept uploads and URLs but reject script schemes', () => {
  for (const value of ['/posters/lineup.jpg', 'https://example.com/image.jpg', 'data:image/jpeg;base64,AAA']) assert.equal(isImageSource(value), true)
  for (const value of ['javascript:alert(1)', '//example.com/image.jpg', 'data:text/html;base64,AAA', 'data:image/svg+xml;base64,AAA']) assert.equal(isImageSource(value), false)
})

test('events save without a separate photo or posters, but reject invalid poster sources', () => {
  const content = createContent()
  const event = content.events[0]!
  event.photo = ''
  assert.deepEqual(validateContent(content), [])
  assert.equal(isVenueContent(content), true)
  event.posters = ['/poster.jpg']
  assert.deepEqual(validateContent(content), [])
  event.posters = ['javascript:alert(1)']
  assert.ok(validateContent(content).some(issue => issue.section === 'events' && issue.message.includes('афиши')))
})

test('page addresses accept slugs and reject invalid or reserved values', () => {
  const content = createContent()
  for (const slug of ['', 'new', 'Bar', 'мой-бар', 'bar/name', '-bar', 'bar--name']) {
    content.venue.slug = slug
    assert.ok(validateContent(content).some(issue => issue.section === 'overview' && issue.message.startsWith('Адрес страницы:')))
  }
  content.venue.slug = 'new-bar-2026'
  content.events.forEach(event => { event.venue = content.venue.slug })
  assert.deepEqual(validateContent(content), [])
})
