const time = '(?:[01]\\d|2[0-3]):[0-5]\\d'
const rangePattern = new RegExp(`^(${time})\\s*[-–—]\\s*(${time})$`)

export const parseHours = (value: string) => {
  const match = value.trim().match(rangePattern)
  return match ? { opening: match[1]!, closing: match[2]! } : undefined
}

export const isHoursValue = (value: string) => value.trim() === 'Закрыто' || !!parseHours(value)
