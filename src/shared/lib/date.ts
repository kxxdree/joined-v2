const toDate = (iso: string) => new Date(`${iso}T12:00:00`)

const toISO = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** Дата относительно сегодняшнего дня, YYYY-MM-DD */
export const isoDay = (offset = 0) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return toISO(date)
}

export const todayISO = () => isoDay(0)

export const addDays = (iso: string, daysToAdd: number) => {
  const date = toDate(iso)
  date.setDate(date.getDate() + daysToAdd)
  return toISO(date)
}

/** Пятница, суббота, воскресенье */
export const isWeekend = (iso: string) => [0, 5, 6].includes(toDate(iso).getDay())

/** Индекс дня недели, где 0 = понедельник */
export const weekdayIndex = (date = new Date()) => (date.getDay() + 6) % 7

/** «23 мая» */
export const formatDay = (iso: string) => toDate(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

/** «23 мая 2025» */
export const formatDate = (iso: string) =>
  toDate(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

/** «пт» */
export const formatWeekday = (iso: string) => toDate(iso).toLocaleDateString('ru-RU', { weekday: 'short' })

/** «пятница» */
export const formatWeekdayLong = (iso: string) => toDate(iso).toLocaleDateString('ru-RU', { weekday: 'long' })

export const dayNumber = (iso: string) => toDate(iso).getDate()

export const monthShort = (iso: string) =>
  toDate(iso).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')

/** Сетка месяца (пн - первый день); null - пустые ячейки до 1-го числа */
export const monthGrid = (iso: string, offset = 0) => {
  const monthDate = toDate(iso)
  monthDate.setDate(1)
  monthDate.setMonth(monthDate.getMonth() + offset)
  const firstDayISO = toISO(monthDate)
  const leadingEmptyDays = weekdayIndex(monthDate)
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = Array(leadingEmptyDays).fill(null)
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(firstDayISO, i))
  return { title: monthDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }), cells }
}
